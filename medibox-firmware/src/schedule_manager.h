#pragma once
#include <Arduino.h>
#include <ArduinoJson.h>
#include <time.h>
#include "config.h"
#include "compartment.h"
#include "buzzer.h"
#include "api_client.h"

// ─── Estrutura de um horário agendado ─────────────────────
struct ScheduledDose {
  int    compartment;
  int    hour;
  int    minute;
  String recordId;
  bool   triggered;   // já foi acionado hoje
};

static ScheduledDose doses[20];  // máximo de 20 doses por dia
static int doseCount = 0;

// ─── Sincroniza programação com a API ────────────────────
void scheduleSync() {
  Serial.println("[Schedule] Sincronizando programação...");
  doseCount = 0;

  JsonDocument doc;
  if (!fetchTodaySchedule(doc)) {
    Serial.println("[Schedule] Falha na sincronização");
    return;
  }

  JsonArray records = doc["data"].as<JsonArray>();
  for (JsonObject record : records) {
    if (doseCount >= 20) break;

    String scheduledTime = record["scheduled_time"].as<String>();
    // scheduledTime formato ISO: "2026-05-19T14:00:00.000Z"
    // Extrai hora e minuto
    int hour   = scheduledTime.substring(11, 13).toInt();
    int minute = scheduledTime.substring(14, 16).toInt();
    // Ajusta para UTC-3
    hour = (hour - 3 + 24) % 24;

    String status = record["status"].as<String>();

    doses[doseCount] = {
      .compartment = record["compartment"].as<int>(),
      .hour        = hour,
      .minute      = minute,
      .recordId    = record["id"].as<String>(),
      .triggered   = (status == "taken" || status == "missed"),
    };

    Serial.printf("[Schedule] Dose %d: Comp %d às %02d:%02d (status: %s)\n",
      doseCount + 1,
      doses[doseCount].compartment,
      doses[doseCount].hour,
      doses[doseCount].minute,
      status.c_str()
    );

    doseCount++;
  }

  Serial.printf("[Schedule] %d doses carregadas\n", doseCount);
}

// ─── Verifica horários no loop principal ─────────────────
void checkSchedules() {
  struct tm now;
  if (!getLocalTime(&now)) return;

  for (int i = 0; i < doseCount; i++) {
    if (doses[i].triggered) continue;

    bool isTime = (now.tm_hour == doses[i].hour && now.tm_min == doses[i].minute);
    if (!isTime) continue;

    Serial.printf("[Schedule] HORA! Compartimento %d\n", doses[i].compartment);

    // Fecha todos os outros
    for (int j = 1; j <= NUM_COMPARTMENTS; j++) {
      if (j != doses[i].compartment) closeCompartment(j);
    }

    // Abre o compartimento correto
    openCompartment(doses[i].compartment, doses[i].recordId);

    // Aciona buzzer
    buzzerAlert(BUZZER_ALERT_DURATION_MS);

    doses[i].triggered = true;
  }
}

// ─── Verifica se medicamento foi retirado (reed switch) ───
void checkCompartmentSensors() {
  for (int i = 1; i <= NUM_COMPARTMENTS; i++) {
    CompartmentState& comp = getCompartment(i);

    // Só verifica compartimentos que estão abertos e aguardando retirada
    if (!comp.isOpen || comp.medicationTaken) continue;

    // Reed switch: LOW = imã presente (fechado), HIGH = sem imã (aberto/retirado)
    bool sensorOpen = digitalRead(comp.reedPin) == HIGH;

    if (sensorOpen) {
      Serial.printf("[Reed] Comp %d: medicamento retirado!\n", i);
      comp.medicationTaken = true;

      // Notifica a API
      notifyCompartmentOpened(i, comp.pendingRecordId);

      // Fecha o compartimento após 3 segundos
      delay(3000);
      closeCompartment(i);

      // Beep de confirmação
      buzzerBeep(2, 150);
    }
  }
}

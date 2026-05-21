#pragma once
#include <Arduino.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "config.h"

// ─── Heartbeat ────────────────────────────────────────────
// Informa à API que o dispositivo está online
void sendHeartbeat() {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  http.begin(String(API_BASE_URL) + "/device/heartbeat");
  http.addHeader("Content-Type", "application/json");

  // Lê nível de sinal WiFi e converte para texto
  int rssi = WiFi.RSSI();
  String signal = rssi > -60 ? "strong" : rssi > -75 ? "medium" : "weak";

  // Sem sensor de bateria real → valor fixo por enquanto
  // Em hardware real: analogRead(BATTERY_PIN) convertido para %
  int battery = 85;

  JsonDocument doc;
  doc["device_key"]     = DEVICE_KEY;
  doc["battery_level"]  = battery;
  doc["signal_strength"] = signal;

  String body;
  serializeJson(doc, body);

  int code = http.POST(body);
  if (code == 200) {
    Serial.printf("[API] Heartbeat OK (RSSI: %d dBm, sinal: %s)\n", rssi, signal.c_str());
  } else {
    Serial.printf("[API] Heartbeat falhou: %d\n", code);
  }
  http.end();
}

// ─── Confirma retirada de medicamento ────────────────────
// Chamado quando o reed switch detecta que o compartimento foi aberto
void notifyCompartmentOpened(int compartment, const String& recordId) {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  http.begin(String(API_BASE_URL) + "/device/compartment-opened");
  http.addHeader("Content-Type", "application/json");

  JsonDocument doc;
  doc["device_key"]  = DEVICE_KEY;
  doc["compartment"] = compartment;
  doc["record_id"]   = recordId;

  String body;
  serializeJson(doc, body);

  int code = http.POST(body);
  if (code == 200) {
    Serial.printf("[API] Comp %d: retirada confirmada\n", compartment);
  } else {
    Serial.printf("[API] Comp %d: falha ao confirmar retirada (%d)\n", compartment, code);
  }
  http.end();
}

// ─── Busca programação de medicamentos ───────────────────
// Retorna JSON com os registros de hoje
bool fetchTodaySchedule(JsonDocument& out) {
  if (WiFi.status() != WL_CONNECTED) return false;

  // Nota: esta rota requer autenticação JWT.
  // O device_key é passado como query param para o backend identificar o usuário.
  // No backend, adicione uma rota pública: GET /device/schedule?key=DEVICE_KEY
  HTTPClient http;
  String url = String(API_BASE_URL) + "/device/schedule?key=" + DEVICE_KEY;
  http.begin(url);

  int code = http.GET();
  if (code != 200) {
    Serial.printf("[API] fetchSchedule falhou: %d\n", code);
    http.end();
    return false;
  }

  String payload = http.getString();
  http.end();

  DeserializationError err = deserializeJson(out, payload);
  if (err) {
    Serial.printf("[API] JSON inválido: %s\n", err.c_str());
    return false;
  }

  Serial.println("[API] Programação recebida");
  return true;
}

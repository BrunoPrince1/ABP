/**
 * MediBox Firmware — ESP32
 *
 * Hardware necessário:
 *   - ESP32 (qualquer variante com WiFi)
 *   - 1× Buzzer passivo (pino 25)
 *   - 6× Servo motor SG90 (pinos 13,14,27,26,33,32) — um por compartimento
 *   - 6× Sensor magnético reed switch (pinos 34,35,36,39,4,5) — detecta abertura
 *   - 1× LED RGB ou LED simples de status (pino 2 — LED onboard)
 *
 * Fluxo:
 *   1. Conecta no WiFi
 *   2. Sincroniza horário via NTP
 *   3. Busca a programação de medicamentos na API
 *   4. No horário certo: abre o compartimento + aciona buzzer
 *   5. Detecta retirada pelo reed switch
 *   6. Notifica a API (compartimento aberto)
 *   7. Envia heartbeat a cada 30s
 *   8. Se não retirar no prazo, a API cuida de notificar o responsável
 */

#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <ESP32Servo.h>
#include <time.h>
#include "config.h"
#include "compartment.h"
#include "buzzer.h"
#include "api_client.h"
#include "schedule_manager.h"

// ─── Estado global ────────────────────────────────────────
bool wifiConnected = false;
unsigned long lastHeartbeat = 0;
unsigned long lastScheduleSync = 0;

// ─── Setup ────────────────────────────────────────────────
void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("\n[MediBox] Iniciando...");

  // LED de status (built-in)
  pinMode(LED_STATUS_PIN, OUTPUT);
  digitalWrite(LED_STATUS_PIN, LOW);

  // Inicializa compartimentos (servos + reed switches)
  compartmentInit();

  // Inicializa buzzer
  buzzerInit();

  // Conecta WiFi
  connectWiFi();

  // Sincroniza horário via NTP
  configTime(NTP_OFFSET_SEC, 0, NTP_SERVER);
  Serial.println("[NTP] Aguardando sincronização...");
  struct tm timeinfo;
  while (!getLocalTime(&timeinfo)) {
    delay(500);
    Serial.print(".");
  }
  Serial.printf("\n[NTP] Horário: %02d:%02d:%02d\n",
    timeinfo.tm_hour, timeinfo.tm_min, timeinfo.tm_sec);

  // Busca programação inicial
  scheduleSync();

  // Sinal de pronto
  buzzerBeep(3, 100);
  digitalWrite(LED_STATUS_PIN, HIGH);
  Serial.println("[MediBox] Pronto!");
}

// ─── Loop ─────────────────────────────────────────────────
void loop() {
  unsigned long now = millis();

  // Reconecta WiFi se necessário
  if (WiFi.status() != WL_CONNECTED) {
    wifiConnected = false;
    digitalWrite(LED_STATUS_PIN, LOW);
    connectWiFi();
  }

  // Heartbeat a cada 30 segundos
  if (now - lastHeartbeat >= HEARTBEAT_INTERVAL_MS) {
    lastHeartbeat = now;
    sendHeartbeat();
  }

  // Re-sincroniza programação a cada 5 minutos
  if (now - lastScheduleSync >= SCHEDULE_SYNC_INTERVAL_MS) {
    lastScheduleSync = now;
    scheduleSync();
  }

  // Verifica se algum horário chegou
  checkSchedules();

  // Verifica se algum compartimento aberto foi fechado (medicamento retirado)
  checkCompartmentSensors();

  delay(500);
}

// ─── WiFi ─────────────────────────────────────────────────
void connectWiFi() {
  Serial.printf("[WiFi] Conectando em %s", WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    wifiConnected = true;
    Serial.printf("\n[WiFi] Conectado! IP: %s\n", WiFi.localIP().toString().c_str());
    digitalWrite(LED_STATUS_PIN, HIGH);
  } else {
    Serial.println("\n[WiFi] Falha na conexão. Tentando novamente em 30s...");
    delay(30000);
  }
}

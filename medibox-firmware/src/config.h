#pragma once

// ─── WiFi ─────────────────────────────────────────────────
#define WIFI_SSID        "SEU_WIFI_AQUI"
#define WIFI_PASSWORD    "SUA_SENHA_AQUI"

// ─── API Backend ──────────────────────────────────────────
// IP da máquina onde o docker compose está rodando
#define API_BASE_URL     "http://192.168.1.105:3000/api"
#define DEVICE_KEY       "MBX-0042"   // deve bater com o banco

// ─── NTP ──────────────────────────────────────────────────
#define NTP_SERVER       "pool.ntp.org"
#define NTP_OFFSET_SEC   (-3 * 3600)  // UTC-3 (Brasília)

// ─── Pinos dos servos (um por compartimento) ──────────────
#define SERVO_PIN_1   13
#define SERVO_PIN_2   14
#define SERVO_PIN_3   27
#define SERVO_PIN_4   26
#define SERVO_PIN_5   33
#define SERVO_PIN_6   32

// ─── Pinos dos reed switches (sensor de abertura) ─────────
// Reed switch: LOW quando imã presente (fechado), HIGH quando aberto
#define REED_PIN_1   34
#define REED_PIN_2   35
#define REED_PIN_3   36
#define REED_PIN_4   39
#define REED_PIN_5    4
#define REED_PIN_6    5

// ─── Servo — ângulos ─────────────────────────────────────
#define SERVO_LOCKED_ANGLE    0    // compartimento fechado
#define SERVO_OPEN_ANGLE     90    // compartimento aberto

// ─── Buzzer ───────────────────────────────────────────────
#define BUZZER_PIN       25
#define BUZZER_FREQ      2000  // Hz

// ─── LED de status ────────────────────────────────────────
#define LED_STATUS_PIN   2    // LED onboard do ESP32

// ─── Intervalos ───────────────────────────────────────────
#define HEARTBEAT_INTERVAL_MS       (30 * 1000UL)   // 30 segundos
#define SCHEDULE_SYNC_INTERVAL_MS   ( 5 * 60 * 1000UL)  // 5 minutos
#define BUZZER_ALERT_DURATION_MS    (5 * 1000UL)    // 5 segundos

// ─── Número de compartimentos ─────────────────────────────
#define NUM_COMPARTMENTS  6

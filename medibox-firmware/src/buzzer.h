#pragma once
#include <Arduino.h>
#include "config.h"

void buzzerInit() {
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);
}

// Emite N beeps de durationMs ms cada
void buzzerBeep(int times, int durationMs = 300) {
  for (int i = 0; i < times; i++) {
    tone(BUZZER_PIN, BUZZER_FREQ, durationMs);
    delay(durationMs + 100);
  }
}

// Alerta contínuo por durationMs ms
void buzzerAlert(int durationMs = 5000) {
  tone(BUZZER_PIN, BUZZER_FREQ, durationMs);
}

void buzzerOff() {
  noTone(BUZZER_PIN);
  digitalWrite(BUZZER_PIN, LOW);
}

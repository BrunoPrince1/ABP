#pragma once
#include <Arduino.h>
#include <ESP32Servo.h>
#include "config.h"

// ─── Estado de cada compartimento ────────────────────────
struct CompartmentState {
  Servo  servo;
  int    servoPin;
  int    reedPin;
  bool   isOpen;
  bool   medicationTaken;  // true quando reed detectou retirada
  String pendingRecordId;  // ID do registro na API para confirmar retirada
};

static CompartmentState compartments[NUM_COMPARTMENTS];

// ─── Pinos ───────────────────────────────────────────────
static const int SERVO_PINS[NUM_COMPARTMENTS] = {
  SERVO_PIN_1, SERVO_PIN_2, SERVO_PIN_3,
  SERVO_PIN_4, SERVO_PIN_5, SERVO_PIN_6
};
static const int REED_PINS[NUM_COMPARTMENTS] = {
  REED_PIN_1, REED_PIN_2, REED_PIN_3,
  REED_PIN_4, REED_PIN_5, REED_PIN_6
};

// ─── Inicialização ────────────────────────────────────────
void compartmentInit() {
  for (int i = 0; i < NUM_COMPARTMENTS; i++) {
    compartments[i].servoPin         = SERVO_PINS[i];
    compartments[i].reedPin          = REED_PINS[i];
    compartments[i].isOpen           = false;
    compartments[i].medicationTaken  = false;
    compartments[i].pendingRecordId  = "";

    // Servo começa fechado
    compartments[i].servo.attach(SERVO_PINS[i]);
    compartments[i].servo.write(SERVO_LOCKED_ANGLE);

    // Reed switch com pull-up interno
    pinMode(REED_PINS[i], INPUT_PULLUP);

    Serial.printf("[Comp %d] Inicializado — servo=%d reed=%d\n",
      i + 1, SERVO_PINS[i], REED_PINS[i]);
  }
}

// ─── Abre um compartimento específico ────────────────────
void openCompartment(int number, const String& recordId) {
  if (number < 1 || number > NUM_COMPARTMENTS) return;
  int idx = number - 1;

  compartments[idx].servo.write(SERVO_OPEN_ANGLE);
  compartments[idx].isOpen          = true;
  compartments[idx].medicationTaken = false;
  compartments[idx].pendingRecordId = recordId;

  Serial.printf("[Comp %d] ABERTO — aguardando retirada (record: %s)\n",
    number, recordId.c_str());
}

// ─── Fecha um compartimento ───────────────────────────────
void closeCompartment(int number) {
  if (number < 1 || number > NUM_COMPARTMENTS) return;
  int idx = number - 1;

  compartments[idx].servo.write(SERVO_LOCKED_ANGLE);
  compartments[idx].isOpen          = false;
  compartments[idx].pendingRecordId = "";

  Serial.printf("[Comp %d] Fechado\n", number);
}

// ─── Fecha todos os compartimentos ────────────────────────
void closeAllCompartments() {
  for (int i = 1; i <= NUM_COMPARTMENTS; i++) closeCompartment(i);
}

// ─── Retorna estado de um compartimento ───────────────────
CompartmentState& getCompartment(int number) {
  return compartments[number - 1];
}

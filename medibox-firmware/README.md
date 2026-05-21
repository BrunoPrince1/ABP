# MediBox Firmware — ESP32

Firmware do dispositivo físico de dispensação de medicamentos.

## Hardware necessário

| Componente | Quantidade | Observação |
|---|---|---|
| ESP32 (DevKit v1 ou similar) | 1 | Qualquer variante com WiFi |
| Servo motor SG90 | 6 | Um por compartimento |
| Reed switch magnético | 6 | Detecta abertura da tampa |
| Buzzer passivo 5V | 1 | Alerta sonoro |
| Resistores 10kΩ | 6 | Pull-up para reed switches |
| Fonte 5V / 2A | 1 | Servos consomem bastante |

## Esquema de conexão

```
ESP32                    Componente
─────────────────────────────────────────────────────
GPIO 13  ──────────────► Servo 1 (sinal)
GPIO 14  ──────────────► Servo 2 (sinal)
GPIO 27  ──────────────► Servo 3 (sinal)
GPIO 26  ──────────────► Servo 4 (sinal)
GPIO 33  ──────────────► Servo 5 (sinal)
GPIO 32  ──────────────► Servo 6 (sinal)

GPIO 34  ──[10kΩ]── 3V3  ←── Reed Switch 1
GPIO 35  ──[10kΩ]── 3V3  ←── Reed Switch 2
GPIO 36  ──[10kΩ]── 3V3  ←── Reed Switch 3
GPIO 39  ──[10kΩ]── 3V3  ←── Reed Switch 4
GPIO  4  ──[10kΩ]── 3V3  ←── Reed Switch 5
GPIO  5  ──[10kΩ]── 3V3  ←── Reed Switch 6

GPIO 25  ──────────────► Buzzer (pino +)
GPIO  2  ──────────────► LED status (onboard)

5V  ────────────────────► Servo VCC (todos em paralelo)
GND ────────────────────► GND comum (ESP32 + servos + buzzer)
```

> ⚠️ **Importante:** Os servos devem ser alimentados com 5V direto da fonte,
> não pelo pino 5V do ESP32 (corrente insuficiente para 6 servos).

## Como o reed switch funciona

```
Tampa FECHADA (imã presente):
  Reed switch → contato fechado → LOW no GPIO

Tampa ABERTA (imã ausente = medicamento retirado):
  Reed switch → contato aberto → HIGH no GPIO (pull-up)
```

Coloque o imã na tampa e o reed switch no corpo da caixa,
alinhados quando fechado.

## Como gravar o firmware

### Opção 1 — VS Code + PlatformIO (recomendado)

```bash
# 1. Instale VS Code
# 2. Instale a extensão PlatformIO IDE
# 3. Abra a pasta medibox-firmware
# 4. Edite src/config.h com seu WiFi e IP da API
# 5. Conecte o ESP32 via USB
# 6. Clique em Upload (→) na barra inferior
```

### Opção 2 — Arduino IDE

```
1. Instale o Arduino IDE
2. Vá em File > Preferences > Additional Board URLs:
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
3. Instale o pacote ESP32 em Tools > Board Manager
4. Instale as bibliotecas:
   - ArduinoJson (by Benoit Blanchon)
   - ESP32Servo (by Kevin Harrington)
5. Abra src/main.cpp
6. Selecione a placa: ESP32 Dev Module
7. Carregue o código
```

## Configuração obrigatória antes de gravar

Edite `src/config.h`:

```cpp
#define WIFI_SSID      "nome_da_sua_rede"
#define WIFI_PASSWORD  "senha_da_rede"
#define API_BASE_URL   "http://192.168.x.x:3000/api"  // IP do seu computador
#define DEVICE_KEY     "MBX-0042"  // igual ao seed do banco
```

## Fluxo de operação

```
[BOOT]
  │
  ├─ Conecta WiFi
  ├─ Sincroniza horário (NTP)
  ├─ Busca programação de hoje na API
  └─ Fecha todos os compartimentos

[LOOP — a cada 500ms]
  │
  ├─ WiFi ok? → reconecta se necessário
  ├─ A cada 30s → envia heartbeat para a API
  ├─ A cada 5min → rebusca programação
  ├─ Horário chegou?
  │     └─ Sim → abre compartimento + aciona buzzer
  └─ Reed switch ativou?
        └─ Sim → notifica API + fecha compartimento
```

## Simulação sem hardware

Para testar sem o ESP32, você pode simular as chamadas da API com curl:

```bash
# Heartbeat (simula ESP32 online)
curl -X POST http://localhost:3000/api/device/heartbeat \
  -H "Content-Type: application/json" \
  -d '{"device_key":"MBX-0042","battery_level":85,"signal_strength":"strong"}'

# Simula retirada do medicamento no compartimento 1
curl -X POST http://localhost:3000/api/device/compartment-opened \
  -H "Content-Type: application/json" \
  -d '{"device_key":"MBX-0042","compartment":1,"record_id":"ID_DO_REGISTRO"}'
```

## Patch no backend necessário

O arquivo `BACKEND_PATCH.ts` contém a rota adicional que precisa ser
adicionada ao `medibox-api` para que o ESP32 busque a programação sem JWT.

Veja as instruções no arquivo.

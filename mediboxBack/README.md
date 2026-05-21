# MediBox API — Backend

Backend REST do sistema MediBox. **Node.js + Express + TypeScript + PostgreSQL**.

## Tecnologias

- Node.js 20 + Express 4
- TypeScript (strict)
- PostgreSQL 16 (pool com `pg`)
- JWT (autenticação)
- Winston (logs)
- Jest + Supertest (testes)
- Docker + docker-compose
- GitHub Actions (CI/CD)

## Subir localmente com Docker

```bash
# 1. Copie as variáveis
cp .env.example .env

# 2. Suba todos os serviços (API + PostgreSQL + MQTT)
docker compose up -d

# 3. Rode a migration (cria as tabelas)
docker compose exec api node dist/db/migrate.js

# 4. Popule com dados de demo (opcional)
docker compose exec api node dist/db/seed.js
```

API disponível em: `http://localhost:3000`

## Desenvolvimento sem Docker

```bash
npm install
cp .env.example .env   # configure DATABASE_URL apontando para seu PostgreSQL
npm run db:migrate
npm run db:seed
npm run dev            # hot-reload com ts-node-dev
```

## Testes

```bash
npm test               # roda os testes
npm run test:coverage  # com relatório de cobertura
```

## Rotas da API

### Auth
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/api/auth/register` | ❌ | Cadastro |
| POST | `/api/auth/login` | ❌ | Login |
| GET  | `/api/auth/me` | ✅ | Dados do usuário |

### Medicamentos
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET    | `/api/medications` | ✅ | Listar |
| GET    | `/api/medications/:id` | ✅ | Detalhe |
| POST   | `/api/medications` | ✅ | Criar |
| PUT    | `/api/medications/:id` | ✅ | Atualizar |
| DELETE | `/api/medications/:id` | ✅ | Remover |

**Body para criar/atualizar:**
```json
{
  "name": "Losartana",
  "dosage": "50mg",
  "compartment": 2,
  "alert_delay_minutes": 30,
  "color": "amber",
  "schedules": [{ "time": "14:00" }]
}
```

### Registros
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/api/records/today` | ✅ | Registros de hoje |
| GET | `/api/records?page=1` | ✅ | Histórico paginado |

### Dispositivo IoT
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET  | `/api/device/status` | ✅ | Status do dispositivo |
| POST | `/api/device/heartbeat` | ❌ | Heartbeat do device |
| POST | `/api/device/compartment-opened` | ❌ | Medicamento retirado |

**Heartbeat (enviado pelo ESP32/Arduino):**
```json
{ "device_key": "MBX-0042", "battery_level": 78, "signal_strength": "strong" }
```

**Compartimento aberto:**
```json
{ "device_key": "MBX-0042", "compartment": 2, "record_id": "uuid-do-registro" }
```

### Notificações
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET   | `/api/notifications` | ✅ | Listar notificações |
| PATCH | `/api/notifications/:id/read` | ✅ | Marcar lida |
| PATCH | `/api/notifications/read-all` | ✅ | Marcar todas lidas |

## CI/CD (GitHub Actions)

O pipeline executa automaticamente a cada push:

1. **Lint** — ESLint + TypeScript check
2. **Build** — Compila TypeScript para JS
3. **Test** — Testes com PostgreSQL em container
4. **Docker Build** — Build e push da imagem (só na `main`)
5. **Deploy** — Trigger via webhook (configure `DEPLOY_WEBHOOK_URL` nos Secrets)

### Secrets necessários no GitHub

| Secret | Descrição |
|--------|-----------|
| `DOCKER_USERNAME` | Usuário do Docker Hub |
| `DOCKER_TOKEN` | Token do Docker Hub |
| `DEPLOY_WEBHOOK_URL` | Webhook do Render / Railway |

## Estrutura

```
src/
├── controllers/     # Handlers das rotas
├── repositories/    # Queries SQL (Data Access Layer)
├── services/        # Lógica de negócio (alertScheduler)
├── middleware/       # auth JWT, errorHandler
├── routes/          # Definição das rotas
├── db/              # connection, migrate, seed
├── types/           # Interfaces TypeScript
├── utils/           # logger
└── server.ts        # Entry point
```

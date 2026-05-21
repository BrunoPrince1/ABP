import 'dotenv/config';
import { pool } from './connection';
import { logger } from '../utils/logger';

const SQL = `
-- Extensão para UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Usuários ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Medicamentos ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS medications (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name                 VARCHAR(100) NOT NULL,
  dosage               VARCHAR(50) NOT NULL,
  compartment          SMALLINT NOT NULL CHECK (compartment BETWEEN 1 AND 6),
  alert_delay_minutes  SMALLINT NOT NULL DEFAULT 30,
  color                VARCHAR(20) NOT NULL DEFAULT 'blue',
  active               BOOLEAN NOT NULL DEFAULT TRUE,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Horários ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS schedules (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id  UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
  time           VARCHAR(5) NOT NULL  -- HH:MM
);

-- ─── Registros de administração ────────────────────────────
CREATE TABLE IF NOT EXISTS administration_records (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id         UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
  medication_name       VARCHAR(150) NOT NULL,
  scheduled_time        TIMESTAMPTZ NOT NULL,
  taken_at              TIMESTAMPTZ,
  status                VARCHAR(20) NOT NULL DEFAULT 'upcoming',
  compartment           SMALLINT NOT NULL,
  notified_responsible  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Dispositivo IoT ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS devices (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name             VARCHAR(100) NOT NULL DEFAULT 'MediBox',
  device_key       VARCHAR(64) UNIQUE NOT NULL,
  is_online        BOOLEAN NOT NULL DEFAULT FALSE,
  last_sync        TIMESTAMPTZ DEFAULT NOW(),
  battery_level    SMALLINT NOT NULL DEFAULT 100,
  firmware_version VARCHAR(20) NOT NULL DEFAULT 'v1.0.0',
  signal_strength  VARCHAR(10) NOT NULL DEFAULT 'strong'
);

-- ─── Responsáveis ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS responsibles (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       VARCHAR(100) NOT NULL,
  phone      VARCHAR(20),
  email      VARCHAR(150) NOT NULL,
  is_active  BOOLEAN NOT NULL DEFAULT TRUE
);

-- ─── Notificações ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type          VARCHAR(30) NOT NULL,
  title         VARCHAR(150) NOT NULL,
  body          TEXT NOT NULL,
  read          BOOLEAN NOT NULL DEFAULT FALSE,
  medication_id UUID REFERENCES medications(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Índices ───────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_medications_user_id     ON medications(user_id);
CREATE INDEX IF NOT EXISTS idx_schedules_medication_id ON schedules(medication_id);
CREATE INDEX IF NOT EXISTS idx_records_medication_id   ON administration_records(medication_id);
CREATE INDEX IF NOT EXISTS idx_records_scheduled_time  ON administration_records(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id   ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_devices_user_id         ON devices(user_id);
CREATE INDEX IF NOT EXISTS idx_devices_device_key      ON devices(device_key);
`;

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query(SQL);
    logger.info('Migration concluída com sucesso');
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((err) => {
  logger.error('Erro na migration', err);
  process.exit(1);
});

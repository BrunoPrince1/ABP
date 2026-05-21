// ─── Usuário / Auth ──────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  created_at: Date;
}

export interface JwtPayload {
  sub: string;   // user id
  email: string;
  iat?: number;
  exp?: number;
}

// ─── Medicamento ─────────────────────────────────────────
export type MedicationColor = 'blue' | 'green' | 'amber' | 'coral' | 'teal';

export interface Medication {
  id: string;
  user_id: string;
  name: string;
  dosage: string;
  compartment: number;
  alert_delay_minutes: number;
  color: MedicationColor;
  active: boolean;
  created_at: Date;
}

export interface Schedule {
  id: string;
  medication_id: string;
  time: string; // "HH:MM"
}

// ─── Registro de administração ──────────────────────────
export type RecordStatus = 'taken' | 'missed' | 'pending' | 'upcoming';

export interface AdministrationRecord {
  id: string;
  medication_id: string;
  medication_name: string;
  scheduled_time: Date;
  taken_at: Date | null;
  status: RecordStatus;
  compartment: number;
  notified_responsible: boolean;
}

// ─── Dispositivo IoT ────────────────────────────────────
export type SignalStrength = 'weak' | 'medium' | 'strong';

export interface Device {
  id: string;
  user_id: string;
  name: string;
  device_key: string;
  is_online: boolean;
  last_sync: Date;
  battery_level: number;
  firmware_version: string;
  signal_strength: SignalStrength;
}

export interface Compartment {
  number: number;
  is_open: boolean;
  medication_id: string | null;
  medication_name: string | null;
}

// ─── Responsável ────────────────────────────────────────
export interface Responsible {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  email: string;
  is_active: boolean;
}

// ─── Notificação ─────────────────────────────────────────
export type NotificationType = 'missed' | 'taken' | 'device_offline' | 'low_battery';

export interface AppNotification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  medication_id: string | null;
  created_at: Date;
}

// ─── Express augmentation ────────────────────────────────
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

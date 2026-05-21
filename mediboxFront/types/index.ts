// ─── Medicamento ────────────────────────────────────────────────
export interface Medication {
  id: string;
  name: string;
  dosage: string;
  compartment: number;       // 1 a 6
  schedules: Schedule[];     // horários do dia
  alertDelayMinutes: number; // tempo máximo após alerta antes de notificar
  color: MedicationColor;
  active: boolean;
  createdAt: string;
}

export type MedicationColor = 'blue' | 'green' | 'amber' | 'coral' | 'teal';

export interface Schedule {
  id: string;
  time: string; // "HH:mm"
}

// ─── Registro de administração ──────────────────────────────────
export interface AdministrationRecord {
  id: string;
  medicationId: string;
  medicationName: string;
  scheduledTime: string;       // ISO string
  takenAt: string | null;      // ISO string ou null se não tomou
  status: RecordStatus;
  compartment: number;
  notifiedResponsible: boolean;
}

export type RecordStatus = 'taken' | 'missed' | 'pending' | 'upcoming';

// ─── Compartimento ───────────────────────────────────────────────
export interface Compartment {
  number: number;
  isOpen: boolean;
  medicationId: string | null;
  medicationName: string | null;
}

// ─── Dispositivo IoT ─────────────────────────────────────────────
export interface DeviceStatus {
  id: string;
  name: string;
  isOnline: boolean;
  lastSync: string;       // ISO string
  batteryLevel: number;   // 0–100
  firmwareVersion: string;
  signalStrength: 'weak' | 'medium' | 'strong';
  compartments: Compartment[];
}

// ─── Responsável ────────────────────────────────────────────────
export interface Responsible {
  id: string;
  name: string;
  phone: string;
  email: string;
  isActive: boolean;
}

// ─── Notificação ─────────────────────────────────────────────────
export interface AppNotification {
  id: string;
  type: 'missed' | 'taken' | 'device_offline' | 'low_battery';
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  medicationId?: string;
}

// ─── API Responses ────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

import { api } from './api';
import type { Medication, AdministrationRecord } from '@/types';

// ─── Mock para desenvolvimento sem backend ───────────────────────
const USE_MOCK = false;

const mockMedications: Medication[] = [
  {
    id: '1',
    name: 'Metformina',
    dosage: '500mg',
    compartment: 1,
    schedules: [{ id: 's1', time: '08:00' }, { id: 's2', time: '20:00' }],
    alertDelayMinutes: 30,
    color: 'blue',
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Losartana',
    dosage: '50mg',
    compartment: 2,
    schedules: [{ id: 's3', time: '14:00' }],
    alertDelayMinutes: 30,
    color: 'amber',
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'AAS',
    dosage: '100mg',
    compartment: 3,
    schedules: [{ id: 's4', time: '22:00' }],
    alertDelayMinutes: 20,
    color: 'green',
    active: true,
    createdAt: new Date().toISOString(),
  },
];

const mockRecords: AdministrationRecord[] = [
  {
    id: 'r1',
    medicationId: '1',
    medicationName: 'Metformina 500mg',
    scheduledTime: new Date().toISOString(),
    takenAt: new Date().toISOString(),
    status: 'taken',
    compartment: 1,
    notifiedResponsible: false,
  },
  {
    id: 'r2',
    medicationId: '2',
    medicationName: 'Losartana 50mg',
    scheduledTime: new Date().toISOString(),
    takenAt: null,
    status: 'upcoming',
    compartment: 2,
    notifiedResponsible: false,
  },
  {
    id: 'r3',
    medicationId: '3',
    medicationName: 'AAS 100mg',
    scheduledTime: new Date().toISOString(),
    takenAt: null,
    status: 'upcoming',
    compartment: 3,
    notifiedResponsible: false,
  },
];

// ─── Serviço ─────────────────────────────────────────────────────
export const medicationService = {
  async getAll(): Promise<Medication[]> {
    if (USE_MOCK) return mockMedications;
    const { data } = await api.get<{ data: Medication[] }>('/medications');
    return data.data;
  },

  async getById(id: string): Promise<Medication> {
    if (USE_MOCK) {
      const med = mockMedications.find((m) => m.id === id);
      if (!med) throw new Error('Medicamento não encontrado');
      return med;
    }
    const { data } = await api.get<{ data: Medication }>(`/medications/${id}`);
    return data.data;
  },

  async getTodayRecords(): Promise<AdministrationRecord[]> {
    if (USE_MOCK) return mockRecords;
    const { data } = await api.get<{ data: AdministrationRecord[] }>('/records/today');
    return data.data;
  },

  async getHistory(page = 1): Promise<AdministrationRecord[]> {
    if (USE_MOCK) return mockRecords;
    const { data } = await api.get<{ data: AdministrationRecord[] }>(`/records?page=${page}`);
    return data.data;
  },

  async create(medication: Omit<Medication, 'id' | 'createdAt'>): Promise<Medication> {
    if (USE_MOCK) {
      const newMed: Medication = {
        ...medication,
        id: String(Date.now()),
        createdAt: new Date().toISOString(),
      };
      mockMedications.push(newMed);
      return newMed;
    }
    const { data } = await api.post<{ data: Medication }>('/medications', medication);
    return data.data;
  },

  async update(id: string, medication: Partial<Medication>): Promise<Medication> {
    if (USE_MOCK) {
      const idx = mockMedications.findIndex((m) => m.id === id);
      mockMedications[idx] = { ...mockMedications[idx], ...medication };
      return mockMedications[idx];
    }
    const { data } = await api.put<{ data: Medication }>(`/medications/${id}`, medication);
    return data.data;
  },

  async remove(id: string): Promise<void> {
    if (USE_MOCK) {
      const idx = mockMedications.findIndex((m) => m.id === id);
      mockMedications.splice(idx, 1);
      return;
    }
    await api.delete(`/medications/${id}`);
  },
};

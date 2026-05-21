import { api } from './api';
import type { DeviceStatus, AppNotification } from '@/types';

const USE_MOCK = false;

const mockDevice: DeviceStatus = {
  id: 'MBX-0042',
  name: 'MediBox Principal',
  isOnline: true,
  lastSync: new Date().toISOString(),
  batteryLevel: 78,
  firmwareVersion: 'v1.2.0',
  signalStrength: 'strong',
  compartments: [
    { number: 1, isOpen: false, medicationId: '1', medicationName: 'Metformina 500mg' },
    { number: 2, isOpen: true,  medicationId: '2', medicationName: 'Losartana 50mg' },
    { number: 3, isOpen: false, medicationId: '3', medicationName: 'AAS 100mg' },
    { number: 4, isOpen: false, medicationId: null, medicationName: null },
    { number: 5, isOpen: false, medicationId: null, medicationName: null },
    { number: 6, isOpen: false, medicationId: null, medicationName: null },
  ],
};

const mockNotifications: AppNotification[] = [
  {
    id: 'n1',
    type: 'missed',
    title: 'Medicamento não retirado',
    body: 'Losartana 50mg não foi retirada após 30 min do alerta.',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    medicationId: '2',
  },
  {
    id: 'n2',
    type: 'taken',
    title: 'Medicamento tomado',
    body: 'Metformina 500mg foi retirada no horário.',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    medicationId: '1',
  },
  {
    id: 'n3',
    type: 'low_battery',
    title: 'Bateria baixa',
    body: 'O dispositivo MediBox está com 20% de bateria.',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
];

export const deviceService = {
  async getStatus(): Promise<DeviceStatus> {
    if (USE_MOCK) return mockDevice;
    const { data } = await api.get<{ data: DeviceStatus }>('/device/status');
    return data.data;
  },

  async getNotifications(): Promise<AppNotification[]> {
    if (USE_MOCK) return mockNotifications;
    const { data } = await api.get<{ data: AppNotification[] }>('/notifications');
    return data.data;
  },

  async openCompartment(number: number): Promise<void> {
    if (USE_MOCK) {
      const comp = mockDevice.compartments.find((c) => c.number === number);
      if (comp) comp.isOpen = true;
      return;
    }
    await api.post(`/device/compartments/${number}/open`);
  },
};

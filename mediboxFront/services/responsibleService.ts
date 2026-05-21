import { api } from './api';
import type { Responsible } from '@/types';

const USE_MOCK = __DEV__;

const mockResponsibles: Responsible[] = [
  {
    id: 'r1',
    name: 'Maria Silva',
    phone: '(12) 99999-0001',
    email: 'maria@email.com',
    isActive: true,
  },
];

export const responsibleService = {
  async getAll(): Promise<Responsible[]> {
    if (USE_MOCK) return mockResponsibles;
    const { data } = await api.get<{ data: Responsible[] }>('/responsibles');
    return data.data;
  },

  async create(payload: Omit<Responsible, 'id'>): Promise<Responsible> {
    if (USE_MOCK) {
      const novo: Responsible = { ...payload, id: String(Date.now()) };
      mockResponsibles.push(novo);
      return novo;
    }
    const { data } = await api.post<{ data: Responsible }>('/responsibles', payload);
    return data.data;
  },

  async remove(id: string): Promise<void> {
    if (USE_MOCK) {
      const idx = mockResponsibles.findIndex((r) => r.id === id);
      if (idx !== -1) mockResponsibles.splice(idx, 1);
      return;
    }
    await api.delete(`/responsibles/${id}`);
  },

  async toggleActive(id: string, isActive: boolean): Promise<Responsible> {
    if (USE_MOCK) {
      const r = mockResponsibles.find((r) => r.id === id)!;
      r.isActive = isActive;
      return r;
    }
    const { data } = await api.patch<{ data: Responsible }>(`/responsibles/${id}`, { isActive });
    return data.data;
  },
};

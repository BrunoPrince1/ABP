import { create } from 'zustand';
import type { Medication, AdministrationRecord, Schedule } from '@/types';
import { medicationService } from '@/services/medicationService';

interface MedicationState {
  medications: Medication[];
  records: AdministrationRecord[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchMedications: () => Promise<void>;
  fetchTodayRecords: () => Promise<void>;
  addMedication: (data: Omit<Medication, 'id' | 'createdAt'>) => Promise<void>;
  updateMedication: (id: string, data: Partial<Medication>) => Promise<void>;
  deleteMedication: (id: string) => Promise<void>;
}

export const useMedicationStore = create<MedicationState>((set, get) => ({
  medications: [],
  records: [],
  isLoading: false,
  error: null,

  fetchMedications: async () => {
    set({ isLoading: true, error: null });
    try {
      const medications = await medicationService.getAll();
      set({ medications, isLoading: false });
    } catch (err) {
      set({ error: 'Erro ao carregar medicamentos', isLoading: false });
    }
  },

  fetchTodayRecords: async () => {
    set({ isLoading: true, error: null });
    try {
      const records = await medicationService.getTodayRecords();
      set({ records, isLoading: false });
    } catch (err) {
      set({ error: 'Erro ao carregar registros', isLoading: false });
    }
  },

  addMedication: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const newMed = await medicationService.create(data);
      set((state) => ({
        medications: [...state.medications, newMed],
        isLoading: false,
      }));
    } catch (err) {
      set({ error: 'Erro ao salvar medicamento', isLoading: false });
      throw err;
    }
  },

  updateMedication: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await medicationService.update(id, data);
      set((state) => ({
        medications: state.medications.map((m) => (m.id === id ? updated : m)),
        isLoading: false,
      }));
    } catch (err) {
      set({ error: 'Erro ao atualizar medicamento', isLoading: false });
      throw err;
    }
  },

  deleteMedication: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await medicationService.remove(id);
      set((state) => ({
        medications: state.medications.filter((m) => m.id !== id),
        isLoading: false,
      }));
    } catch (err) {
      set({ error: 'Erro ao remover medicamento', isLoading: false });
      throw err;
    }
  },
}));

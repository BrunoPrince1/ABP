import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '@/services/api';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,

  loadFromStorage: async () => {
    try {
      const token = await AsyncStorage.getItem('@medibox:token');
      const userRaw = await AsyncStorage.getItem('@medibox:user');

      if (token && userRaw) {
        set({
          token,
          user: JSON.parse(userRaw),
          isAuthenticated: true,
        });
      }
    } catch {
      // sem dados salvos
    }
  },

  // =====================================================
  // 🔥 LOGIN (MOCK - DESENVOLVIMENTO)
  // =====================================================
  login: async (email, password) => {
    set({ isLoading: true });

    // 👉 MOCK ATIVO
    set({
      user: { id: '1', name: 'Usuário Demo', email },
      token: 'mock-token',
      isAuthenticated: true,
      isLoading: false,
    });

    /* =====================================================
    // 🔒 VERSÃO REAL (API) - DESCOMENTAR EM PRODUÇÃO

    try {
      const { data } = await api.post('/auth/login', { email, password });

      const { token, user } = data.data;

      await AsyncStorage.setItem('@medibox:token', token);
      await AsyncStorage.setItem('@medibox:user', JSON.stringify(user));

      set({
        token,
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err: any) {
      set({ isLoading: false });
      const msg = err?.response?.data?.message ?? 'Erro ao fazer login';
      throw new Error(msg);
    }
    ===================================================== */
  },

  // =====================================================
  // 🔥 REGISTER (MOCK - DESENVOLVIMENTO)
  // =====================================================
  register: async (name, email, password) => {
    set({ isLoading: true });

    // 👉 MOCK ATIVO
    set({
      user: { id: '1', name, email },
      token: 'mock-token',
      isAuthenticated: true,
      isLoading: false,
    });

    /* =====================================================
    // 🔒 VERSÃO REAL (API) - DESCOMENTAR EM PRODUÇÃO

    try {
      const { data } = await api.post('/auth/register', {
        name,
        email,
        password,
      });

      const { token, user } = data.data;

      await AsyncStorage.setItem('@medibox:token', token);
      await AsyncStorage.setItem('@medibox:user', JSON.stringify(user));

      set({
        token,
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err: any) {
      set({ isLoading: false });
      const msg = err?.response?.data?.message ?? 'Erro ao criar conta';
      throw new Error(msg);
    }
    ===================================================== */
  },

  logout: async () => {
    await AsyncStorage.removeItem('@medibox:token');
    await AsyncStorage.removeItem('@medibox:user');

    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },
}));
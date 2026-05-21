import { create } from 'zustand';
import type { DeviceStatus, AppNotification } from '@/types';
import { deviceService } from '@/services/deviceService';

interface DeviceState {
  device: DeviceStatus | null;
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;

  fetchDevice: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  markAllRead: () => void;
  markRead: (id: string) => void;
}

export const useDeviceStore = create<DeviceState>((set, get) => ({
  device: null,
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  fetchDevice: async () => {
    set({ isLoading: true, error: null });
    try {
      const device = await deviceService.getStatus();
      set({ device, isLoading: false });
    } catch (err) {
      set({ error: 'Dispositivo offline', isLoading: false });
    }
  },

  fetchNotifications: async () => {
    try {
      const notifications = await deviceService.getNotifications();
      const unreadCount = notifications.filter((n) => !n.read).length;
      set({ notifications, unreadCount });
    } catch (err) {
      // silencioso
    }
  },

  markAllRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },

  markRead: (id: string) => {
    set((state) => {
      const notifications = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n,
      );
      const unreadCount = notifications.filter((n) => !n.read).length;
      return { notifications, unreadCount };
    });
  },
}));

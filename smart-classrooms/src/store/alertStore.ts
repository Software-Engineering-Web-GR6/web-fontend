import { create } from 'zustand';
import type { Alert } from '../types/alert';

interface AlertStore {
  alerts: Alert[];
  unreadCount: number;
  addAlert: (alert: Alert) => void;
  acknowledge: (id: string) => void;
  resolve: (id: string) => void;
}

export const useAlertStore = create<AlertStore>((set) => ({
  alerts: [],
  unreadCount: 0,
  addAlert: (alert) =>
    set((state) => ({
      alerts: [alert, ...state.alerts],
      unreadCount: state.unreadCount + 1,
    })),
  acknowledge: (id) =>
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === id ? { ...a, status: 'acknowledged' } : a,
      ),
    })),
  resolve: (id) =>
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === id ? { ...a, status: 'resolved' } : a,
      ),
    })),
}));

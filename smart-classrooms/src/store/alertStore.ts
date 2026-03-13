import { create } from "zustand";
import type { AlertState, Alert } from "../types";

export const useAlertStore = create<AlertState>((set, get) => ({
  alerts: [],
  unreadCount: 0,

  addAlert: (alert: Alert) => {
    set((state) => ({
      alerts: [alert, ...state.alerts].slice(0, 100), // Keep only last 100 alerts
      unreadCount: state.unreadCount + 1,
    }));
  },

  markAsRead: (id: string) => {
    set((state) => {
      const alert = state.alerts.find((a) => a.id === id);
      if (alert && !alert.read) {
        return {
          alerts: state.alerts.map((a) =>
            a.id === id ? { ...a, read: true } : a,
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        };
      }
      return state;
    });
  },

  markAllAsRead: () => {
    set((state) => ({
      alerts: state.alerts.map((a) => ({ ...a, read: true })),
      unreadCount: 0,
    }));
  },

  clearAlerts: () => {
    set({
      alerts: [],
      unreadCount: 0,
    });
  },
}));

import { create } from "zustand";
import type { AlertState, Alert } from "../types";

export const useAlertStore = create<AlertState>((set, get) => ({
  alerts: [],
  unreadCount: 0,

  setAlerts: (alerts: Alert[]) => {
    // Filter: Only show OPEN alerts or recently resolved ones (within 1 hour)
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    
    const filteredAlerts = alerts.filter(alert => {
      if (alert.status === "OPEN") return true;
      
      // Keep recently resolved alerts for visibility
      const alertTime = new Date(alert.timestamp).getTime();
      return alertTime > oneHourAgo;
    });
    
    // Remove duplicates by ID (use Map to keep only latest)
    const alertMap = new Map<string, Alert>();
    filteredAlerts.forEach(alert => {
      alertMap.set(alert.id, alert);
    });
    
    const uniqueAlerts = Array.from(alertMap.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 100);
    
    const unreadCount = uniqueAlerts.filter((alert) => !alert.read).length;
    set({ alerts: uniqueAlerts, unreadCount });
  },

  addAlert: (alert: Alert) => {
    // Check if alert with same ID already exists
    const existingAlert = get().alerts.find((item) => item.id === alert.id);
    if (existingAlert) {
      return; // Don't add duplicate
    }

    // Check for duplicate by message/level in last 30 seconds
    const latestMatchingAlert = get().alerts.find(
      (item) => item.message === alert.message && item.level === alert.level,
    );

    if (latestMatchingAlert) {
      const lastTimestamp = new Date(latestMatchingAlert.timestamp).getTime();
      const currentTimestamp = new Date(alert.timestamp).getTime();

      if (
        Number.isFinite(lastTimestamp) &&
        Number.isFinite(currentTimestamp) &&
        currentTimestamp - lastTimestamp < 30_000
      ) {
        return;
      }
    }

    set((state) => ({
      alerts: [alert, ...state.alerts].slice(0, 100), // Keep only last 100 alerts
      unreadCount: state.unreadCount + 1,
    }));
  },

  upsertAlert: (alert: Alert) => {
    const existing = get().alerts.find((item) => item.id === alert.id);
    if (!existing) {
      get().addAlert(alert);
      return;
    }

    set((state) => {
      const alerts = state.alerts.map((item) =>
        item.id === alert.id ? { ...item, ...alert } : item,
      );
      return {
        alerts,
        unreadCount: alerts.filter((item) => !item.read).length,
      };
    });
  },

  resolveAlert: (id: string) => {
    set((state) => {
      const alerts = state.alerts.map((alert) =>
        alert.id === id ? { ...alert, status: "RESOLVED", read: true } : alert,
      );
      return {
        alerts,
        unreadCount: alerts.filter((alert) => !alert.read).length,
      };
    });
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

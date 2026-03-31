import { useEffect } from "react";
import { useAlertStore } from "../store";
import type { Alert } from "../types";
import { socketService } from "../services";
import { alertApi, mapBackendAlert } from "../services/alertApi";

let alertsInitialized = false;
let alertsInitializationPromise: Promise<void> | null = null;

const initializeAlerts = async () => {
  if (alertsInitialized) {
    return;
  }

  if (!alertsInitializationPromise) {
    alertsInitializationPromise = (async () => {
      try {
        const backendAlerts = await alertApi.list();
        useAlertStore.getState().setAlerts(backendAlerts);
      } catch (error) {
        console.error("Failed to fetch alerts", error);
      }

      socketService.connect();
      socketService.onAlertEvent((payload) => {
        const backendAlert = payload.alert as {
          id: number;
          room_id: number;
          level?: string;
          message?: string;
          status?: "OPEN" | "RESOLVED";
        };

        if (payload.event === "new_alert" && backendAlert.level && backendAlert.message) {
          useAlertStore.getState().upsertAlert(
            mapBackendAlert(
              {
                id: backendAlert.id,
                room_id: backendAlert.room_id,
                level: backendAlert.level,
                message: backendAlert.message,
                status: backendAlert.status ?? "OPEN",
                created_at: new Date().toISOString(),
              },
              false,
            ),
          );
        }

        if (payload.event === "resolved_alert") {
          useAlertStore.getState().resolveAlert(String(backendAlert.id));
        }
      });

      alertsInitialized = true;
    })();
  }

  await alertsInitializationPromise;
};

export const useAlerts = () => {
  const {
    alerts,
    unreadCount,
    setAlerts,
    addAlert,
    upsertAlert,
    resolveAlert,
    markAsRead,
    markAllAsRead,
    clearAlerts,
  } = useAlertStore();

  useEffect(() => {
    void initializeAlerts();
  }, []);

  const getUnreadAlerts = (): Alert[] => {
    return alerts.filter((a) => !a.read);
  };

  const getCriticalAlerts = (): Alert[] => {
    return alerts.filter((a) => a.level === "critical");
  };

  const getWarningAlerts = (): Alert[] => {
    return alerts.filter((a) => a.level === "warning");
  };

  const getRecentAlerts = (limit: number = 10): Alert[] => {
    return alerts.slice(0, limit);
  };

  return {
    alerts,
    unreadCount,
    setAlerts,
    addAlert,
    upsertAlert,
    resolveAlert,
    markAsRead,
    markAllAsRead,
    clearAlerts,
    getUnreadAlerts,
    getCriticalAlerts,
    getWarningAlerts,
    getRecentAlerts,
  };
};

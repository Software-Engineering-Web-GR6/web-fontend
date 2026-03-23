import { useEffect } from "react";
import { useAlertStore } from "../store";
import type { Alert } from "../types";
import { socketService } from "../services";
import { alertApi, mapBackendAlert } from "../services/alertApi";

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
    let mounted = true;

    const loadAlerts = async () => {
      try {
        const backendAlerts = await alertApi.list();
        if (mounted) {
          setAlerts(backendAlerts);
        }
      } catch (error) {
        console.error("Failed to fetch alerts", error);
      }
    };

    socketService.connect();
    const unsubscribe = socketService.onAlertEvent((payload) => {
      const backendAlert = payload.alert as {
        id: number;
        room_id: number;
        level?: string;
        message?: string;
        status?: "OPEN" | "RESOLVED";
      };

      if (payload.event === "new_alert" && backendAlert.level && backendAlert.message) {
        upsertAlert(
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
        resolveAlert(String(backendAlert.id));
      }
    });

    loadAlerts();

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [resolveAlert, setAlerts, upsertAlert]);

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

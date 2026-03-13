import { useAlertStore } from "../store";
import type { Alert } from "../types";

export const useAlerts = () => {
  const {
    alerts,
    unreadCount,
    addAlert,
    markAsRead,
    markAllAsRead,
    clearAlerts,
  } = useAlertStore();

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
    addAlert,
    markAsRead,
    markAllAsRead,
    clearAlerts,
    getUnreadAlerts,
    getCriticalAlerts,
    getWarningAlerts,
    getRecentAlerts,
  };
};

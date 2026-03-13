// Alert Types
export type AlertLevel = "info" | "warning" | "critical";
export type AlertType = "temperature" | "humidity" | "device" | "system";

export interface Alert {
  id: string;
  level: AlertLevel;
  type: AlertType;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface AlertState {
  alerts: Alert[];
  unreadCount: number;
  addAlert: (alert: Alert) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAlerts: () => void;
}

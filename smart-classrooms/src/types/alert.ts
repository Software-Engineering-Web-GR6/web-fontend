// Alert Types
export type AlertLevel = "info" | "warning" | "critical";
export type AlertType = "temperature" | "humidity" | "device" | "system";

export interface Alert {
  id: string;
  roomId?: number;
  level: AlertLevel;
  type: AlertType;
  message: string;
  timestamp: string;
  status?: "OPEN" | "RESOLVED";
  read: boolean;
}

export interface AlertState {
  alerts: Alert[];
  unreadCount: number;
  setAlerts: (alerts: Alert[]) => void;
  addAlert: (alert: Alert) => void;
  upsertAlert: (alert: Alert) => void;
  resolveAlert: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAlerts: () => void;
}

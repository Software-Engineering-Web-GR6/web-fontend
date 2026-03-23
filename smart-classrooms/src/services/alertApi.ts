import api from "./api";
import type { Alert } from "../types";

interface BackendAlert {
  id: number;
  room_id: number;
  level: string;
  message: string;
  status: "OPEN" | "RESOLVED";
  created_at: string;
  resolved_at?: string | null;
}

const mapLevel = (level: string): Alert["level"] => {
  const normalized = level.toUpperCase();
  if (normalized === "HIGH" || normalized === "CRITICAL") {
    return "critical";
  }
  if (normalized === "MEDIUM" || normalized === "WARNING") {
    return "warning";
  }
  return "info";
};

export const mapBackendAlert = (
  alert: BackendAlert,
  read = false,
): Alert => ({
  id: String(alert.id),
  roomId: alert.room_id,
  level: mapLevel(alert.level),
  type: "system",
  message: alert.message,
  timestamp: alert.created_at,
  status: alert.status,
  read,
});

export const alertApi = {
  list: async (): Promise<Alert[]> => {
    const response = await api.get<BackendAlert[]>("/api/v1/alerts/");
    return response.data.map((alert) => mapBackendAlert(alert));
  },

  resolve: async (alertId: string): Promise<Alert> => {
    const response = await api.post<BackendAlert>(`/api/v1/alerts/${alertId}/resolve`);
    return mapBackendAlert(response.data);
  },
};


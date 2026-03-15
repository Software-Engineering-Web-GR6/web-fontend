import api from "./api";
import type { SensorHistory, ApiResponse } from "../types";

export interface SensorHistoryResponse {
  history: SensorHistory[];
  total: number;
}

export const sensorApi = {
  // Get sensor history
  getHistory: async (limit?: number): Promise<SensorHistory[]> => {
    const params = limit ? { limit } : {};
    const response = await api.get<ApiResponse<SensorHistoryResponse>>(
      "/api/sensors/history",
      { params },
    );
    return response.data.data.history;
  },

  // Get current sensor data
  getCurrent: async () => {
    const response = await api.get<
      ApiResponse<{ temp: number; humidity: number }>
    >("/api/sensors/current");
    return response.data.data;
  },
};

import api from "./api";
import type { Threshold, ApiResponse } from "../types";

export const thresholdApi = {
  // Get current thresholds
  get: async (): Promise<Threshold> => {
    const response = await api.get<ApiResponse<Threshold>>("/api/threshold");
    return response.data.data;
  },

  // Update thresholds
  update: async (threshold: Partial<Threshold>): Promise<Threshold> => {
    const response = await api.put<ApiResponse<Threshold>>(
      "/api/threshold",
      threshold,
    );
    return response.data.data;
  },

  // Reset thresholds to default
  reset: async (): Promise<Threshold> => {
    const response = await api.post<ApiResponse<Threshold>>(
      "/api/threshold/reset",
    );
    return response.data.data;
  },
};

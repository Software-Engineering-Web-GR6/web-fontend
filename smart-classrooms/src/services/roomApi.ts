import api from "./api";
import type { Room } from "../types";

export const roomApi = {
  getAll: async (): Promise<Room[]> => {
    const response = await api.get<Room[]>("/api/v1/rooms");
    return response.data;
  },

  updateAutomationMode: async (
    roomId: number,
    autoControlEnabled: boolean,
  ): Promise<Room> => {
    const response = await api.put<Room>(`/api/v1/rooms/${roomId}/automation-mode`, {
      auto_control_enabled: autoControlEnabled,
    });
    return response.data;
  },
};

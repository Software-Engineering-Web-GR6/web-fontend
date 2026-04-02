import api from "./api";
import type { Room } from "../types";

export interface CreateRoomPayload {
  name: string;
  building: string;
  location?: string | null;
}

export const roomApi = {
  getAll: async (): Promise<Room[]> => {
    const response = await api.get<Room[]>("/api/v1/rooms");
    return response.data;
  },

  create: async (payload: CreateRoomPayload): Promise<Room> => {
    const response = await api.post<Room>("/api/v1/rooms", payload);
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

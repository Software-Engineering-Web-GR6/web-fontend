import api from "./api";
import type { SensorHistory } from "../types";
import { normalizeTimestamp, toSafeTimestampMs } from "../utils/formatters";

interface BackendSensorReading {
  id: number;
  room_id: number;
  temperature: number | null;
  humidity: number | null;
  co2: number | null;
  recorded_at: string;
}

const DEFAULT_ROOM_ID = 1;

export const sensorApi = {
  getHistory: async (
    roomId: number = DEFAULT_ROOM_ID,
    limit?: number,
  ): Promise<SensorHistory[]> => {
    const params = limit ? { limit } : {};
    const response = await api.get<BackendSensorReading[]>(
      `/api/v1/sensors/${roomId}/history`,
      { params },
    );

    return response.data
      .map((item) => ({
        id: String(item.id),
        temp: item.temperature ?? 0,
        humidity: item.humidity ?? 0,
        co2: item.co2 ?? 800,
        timestamp: normalizeTimestamp(item.recorded_at),
      }))
      .sort(
        (left, right) =>
          toSafeTimestampMs(left.timestamp) - toSafeTimestampMs(right.timestamp),
      );
  },

  getCurrent: async (roomId: number = DEFAULT_ROOM_ID) => {
    const response = await api.get<BackendSensorReading>(
      `/api/v1/sensors/${roomId}/latest`,
    );

    return {
      temp: response.data.temperature ?? 0,
      humidity: response.data.humidity ?? 0,
      co2: response.data.co2 ?? 800,
      timestamp: normalizeTimestamp(response.data.recorded_at),
    };
  },
};

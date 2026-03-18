import api from './api';
import type { SensorHistory } from '../types/sensor';

export async function getSensorHistory(roomId: string): Promise<SensorHistory> {
  const response = await api.get<SensorHistory>(`/sensors/${roomId}/history`);
  return response.data;
}

export async function getLatestReading(roomId: string) {
  const response = await api.get(`/sensors/${roomId}/latest`);
  return response.data;
}

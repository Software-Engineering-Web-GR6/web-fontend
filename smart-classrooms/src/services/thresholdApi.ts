import api from './api';
import type { ThresholdConfig } from '../types/threshold';

export async function getThreshold(roomId: string): Promise<ThresholdConfig> {
  const response = await api.get<ThresholdConfig>(`/thresholds/${roomId}`);
  return response.data;
}

export async function updateThreshold(config: ThresholdConfig): Promise<ThresholdConfig> {
  const response = await api.put<ThresholdConfig>(`/thresholds/${config.roomId}`, config);
  return response.data;
}

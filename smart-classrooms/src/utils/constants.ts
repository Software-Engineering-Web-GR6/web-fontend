import type { ThresholdConfig } from '../types/threshold';

export const DEFAULT_THRESHOLDS: ThresholdConfig = {
  roomId: 'default',
  maxTemperature: 35,
  minTemperature: 18,
  maxHumidity: 80,
  minHumidity: 30,
};

export const COLORS = {
  temperature: '#ef4444',
  humidity: '#3b82f6',
  comfort: '#22c55e',
  warning: '#f59e0b',
  danger: '#dc2626',
};

export const ROOM_LIST = ['A101', 'A102', 'B201', 'B202', 'C301'];

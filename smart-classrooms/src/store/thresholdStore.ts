import { create } from 'zustand';
import type { ThresholdConfig } from '../types/threshold';
import { DEFAULT_THRESHOLDS } from '../utils/constants';

interface ThresholdStore {
  thresholds: Record<string, ThresholdConfig>;
  setThreshold: (config: ThresholdConfig) => void;
  getThreshold: (roomId: string) => ThresholdConfig;
}

export const useThresholdStore = create<ThresholdStore>((set, get) => ({
  thresholds: {},
  setThreshold: (config) =>
    set((state) => ({
      thresholds: { ...state.thresholds, [config.roomId]: config },
    })),
  getThreshold: (roomId) =>
    get().thresholds[roomId] ?? { ...DEFAULT_THRESHOLDS, roomId },
}));

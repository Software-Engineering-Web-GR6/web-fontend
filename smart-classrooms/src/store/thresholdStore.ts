import { create } from "zustand";
import type { ThresholdState, Threshold } from "../types/threshold";
import { DEFAULT_THRESHOLDS } from "../types/threshold";

export const useThresholdStore = create<ThresholdState>((set) => ({
  ...DEFAULT_THRESHOLDS,

  setThresholds: (thresholds: Partial<Threshold>) => {
    set((state) => ({
      ...state,
      ...thresholds,
    }));
  },

  resetThresholds: () => {
    set(DEFAULT_THRESHOLDS);
  },
}));

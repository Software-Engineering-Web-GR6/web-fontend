// Threshold Types
export interface Threshold {
  tempMax: number;
  tempMin: number;
  humidityMax: number;
  humidityMin: number;
}

export interface ThresholdState extends Threshold {
  setThresholds: (thresholds: Partial<Threshold>) => void;
  resetThresholds: () => void;
}

export const DEFAULT_THRESHOLDS: Threshold = {
  tempMax: 30,
  tempMin: 18,
  humidityMax: 80,
  humidityMin: 30,
};

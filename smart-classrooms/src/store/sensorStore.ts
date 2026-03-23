import { create } from "zustand";
import type { SensorState, SensorData, SensorHistory } from "../types";
import {
  DEFAULT_TEMP,
  DEFAULT_HUMIDITY,
  HISTORY_LIMIT,
} from "../utils/constants";

export const useSensorStore = create<SensorState>((set, get) => ({
  temp: DEFAULT_TEMP,
  humidity: DEFAULT_HUMIDITY,
  co2: 800,
  history: [],
  isConnected: false,

  setSensorData: (data: SensorData) => {
    set({
      temp: data.temp,
      humidity: data.humidity,
      co2: data.co2,
    });
  },

  setHistory: (history: SensorHistory[]) => {
    set({ history });
  },

  addHistory: (data: SensorHistory) => {
    const { history } = get();
    const newHistory = [...history, data];
    // Keep only the last HISTORY_LIMIT items
    if (newHistory.length > HISTORY_LIMIT) {
      newHistory.shift();
    }
    set({ history: newHistory });
  },

  setConnected: (connected: boolean) => {
    set({ isConnected: connected });
  },

  reset: () => {
    set({
      temp: DEFAULT_TEMP,
      humidity: DEFAULT_HUMIDITY,
      co2: 800,
      history: [],
      isConnected: false,
    });
  },
}));

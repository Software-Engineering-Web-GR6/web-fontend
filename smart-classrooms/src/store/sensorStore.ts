import { create } from "zustand";
import type { SensorState, SensorData, SensorHistory } from "../types";
import {
  DEFAULT_TEMP,
  DEFAULT_HUMIDITY,
  HISTORY_LIMIT,
} from "../utils/constants";

const MAX_HISTORY_GAP_MS = 20_000;

const normalizeHistory = (history: SensorHistory[]) =>
  history
    .slice()
    .sort(
      (left, right) =>
        new Date(left.timestamp).getTime() - new Date(right.timestamp).getTime(),
    )
    .reduce<SensorHistory[]>((items, item) => {
      const existingIndex = items.findIndex(
        (current) => current.timestamp === item.timestamp,
      );
      if (existingIndex >= 0) {
        items[existingIndex] = item;
        return items;
      }
      items.push(item);
      return items;
    }, [])
    .reduce<SensorHistory[]>((items, item) => {
      if (items.length === 0) {
        items.push(item);
        return items;
      }

      const previous = items[items.length - 1];
      const gap =
        new Date(item.timestamp).getTime() - new Date(previous.timestamp).getTime();

      if (gap > MAX_HISTORY_GAP_MS) {
        return [item];
      }

      items.push(item);
      return items;
    }, [])
    .slice(-HISTORY_LIMIT);

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
    set({ history: normalizeHistory(history) });
  },

  addHistory: (data: SensorHistory) => {
    const { history } = get();
    set({ history: normalizeHistory([...history, data]) });
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

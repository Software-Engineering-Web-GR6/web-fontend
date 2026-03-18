import { create } from 'zustand';
import type { SensorReading } from '../types/sensor';

interface SensorStore {
  readings: Record<string, SensorReading>;
  history: Record<string, SensorReading[]>;
  setReading: (reading: SensorReading) => void;
  appendHistory: (reading: SensorReading) => void;
}

export const useSensorStore = create<SensorStore>((set) => ({
  readings: {},
  history: {},
  setReading: (reading) =>
    set((state) => ({
      readings: { ...state.readings, [reading.roomId]: reading },
    })),
  appendHistory: (reading) =>
    set((state) => {
      const prev = state.history[reading.roomId] ?? [];
      return {
        history: {
          ...state.history,
          [reading.roomId]: [...prev.slice(-99), reading],
        },
      };
    }),
}));

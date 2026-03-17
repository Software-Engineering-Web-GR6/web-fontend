import { create } from "zustand";
import type { DeviceState } from "../types";

export const useDeviceStore = create<DeviceState>((set) => ({
  fanOn: false,
  lightOn: true,
  acOn: false,
  acTemp: 24,
  lastUpdated: new Date().toISOString(),

  setFanOn: (on: boolean) => {
    set({
      fanOn: on,
      lastUpdated: new Date().toISOString(),
    });
  },

  setLightOn: (on: boolean) => {
    set({
      lightOn: on,
      lastUpdated: new Date().toISOString(),
    });
  },

  setAcOn: (on: boolean) => {
    set({
      acOn: on,
      lastUpdated: new Date().toISOString(),
    });
  },

  setAcTemp: (temp: number) => {
    set({
      acTemp: temp,
      lastUpdated: new Date().toISOString(),
    });
  },

  setLastUpdated: (time: string) => {
    set({ lastUpdated: time });
  },
}));

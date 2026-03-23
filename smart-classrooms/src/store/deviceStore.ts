import { create } from "zustand";
import type { DeviceState } from "../types";

export const useDeviceStore = create<DeviceState>((set) => ({
  devices: [],
  fanOn: false,
  lightOn: false,
  acOn: false,
  acTemp: 24,
  lastUpdated: new Date().toISOString(),

  syncDevices: (devices) => {
    const lastUpdated = devices[0]?.lastUpdated ?? new Date().toISOString();
    set({
      devices,
      fanOn: devices.some((device) => device.type === "fan" && device.status),
      lightOn: devices.some((device) => device.type === "light" && device.status),
      acOn: devices.some((device) => device.type === "ac" && device.status),
      lastUpdated,
    });
  },

  updateDevice: (device) => {
    set((state) => {
      const devices = state.devices.some((item) => item.id === device.id)
        ? state.devices.map((item) => (item.id === device.id ? device : item))
        : [...state.devices, device];

      return {
        devices,
        fanOn: devices.some((item) => item.type === "fan" && item.status),
        lightOn: devices.some((item) => item.type === "light" && item.status),
        acOn: devices.some((item) => item.type === "ac" && item.status),
        lastUpdated: device.lastUpdated,
      };
    });
  },

  setFanOn: (on: boolean) => {
    set({
      fanOn: on,
      lastUpdated: new Date().toISOString(),
    });
  },

  setLightOn: (open: boolean) => {
    set({
      lightOn: open,
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

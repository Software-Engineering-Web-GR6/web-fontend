import { create } from "zustand";
import type { DeviceState } from "../types";

export const useDeviceStore = create<DeviceState>((set) => ({
  fanOn: false,
  windowOpen: false,
  lastUpdated: new Date().toISOString(),

  setFanOn: (on: boolean) => {
    set({
      fanOn: on,
      lastUpdated: new Date().toISOString(),
    });
  },

  setWindowOpen: (open: boolean) => {
    set({
      windowOpen: open,
      lastUpdated: new Date().toISOString(),
    });
  },

  setLastUpdated: (time: string) => {
    set({ lastUpdated: time });
  },
}));

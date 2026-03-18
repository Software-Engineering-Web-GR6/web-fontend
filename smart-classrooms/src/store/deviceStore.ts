import { create } from 'zustand';
import type { DeviceState } from '../types/device';

interface DeviceStore {
  devices: Record<string, DeviceState>;
  setDevice: (state: DeviceState) => void;
}

export const useDeviceStore = create<DeviceStore>((set) => ({
  devices: {},
  setDevice: (deviceState) =>
    set((state) => ({
      devices: { ...state.devices, [deviceState.roomId]: deviceState },
    })),
}));

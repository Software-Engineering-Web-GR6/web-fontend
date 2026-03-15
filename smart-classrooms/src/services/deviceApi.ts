import api from "./api";
import type { Device, DeviceControl, ApiResponse } from "../types";

export interface DeviceControlResponse {
  device: Device;
  success: boolean;
}

export const deviceApi = {
  // Get all devices
  getAll: async (): Promise<Device[]> => {
    const response = await api.get<ApiResponse<Device[]>>("/api/devices");
    return response.data.data;
  },

  // Control device
  control: async (
    deviceId: string,
    action: "turnOn" | "turnOff",
  ): Promise<Device> => {
    const response = await api.post<ApiResponse<DeviceControlResponse>>(
      "/api/device/control",
      {
        deviceId,
        action,
      } as DeviceControl,
    );
    return response.data.data.device;
  },

  // Control fan specifically
  controlFan: async (action: "turnOn" | "turnOff"): Promise<Device> => {
    const response = await api.post<ApiResponse<DeviceControlResponse>>(
      "/api/device/control",
      {
        deviceId: "fan",
        action,
      } as DeviceControl,
    );
    return response.data.data.device;
  },

  // Control window specifically
  controlWindow: async (action: "turnOn" | "turnOff"): Promise<Device> => {
    const response = await api.post<ApiResponse<DeviceControlResponse>>(
      "/api/device/control",
      {
        deviceId: "window",
        action,
      } as DeviceControl,
    );
    return response.data.data.device;
  },

  // Control AC specifically
  controlAc: async (action: "turnOn" | "turnOff"): Promise<Device> => {
    const response = await api.post<ApiResponse<DeviceControlResponse>>(
      "/api/device/control",
      {
        deviceId: "ac",
        action,
      } as DeviceControl,
    );
    return response.data.data.device;
  },
};

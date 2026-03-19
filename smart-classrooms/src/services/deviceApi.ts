import api from "./api";
import type { Device } from "../types";

interface BackendDevice {
  id: number;
  room_id: number;
  name: string;
  device_type: string;
  state: string;
  last_updated: string;
}

const DEFAULT_ROOM_ID = 1;

const mapBackendTypeToFrontend = (deviceType: string): Device["type"] => {
  if (deviceType === "air_conditioner") {
    return "ac";
  }
  if (deviceType === "window") {
    return "light";
  }
  return "fan";
};

const mapBackendDevice = (device: BackendDevice): Device => ({
  id: String(device.id),
  name: device.name,
  type: mapBackendTypeToFrontend(device.device_type),
  status: ["ON", "OPEN"].includes(device.state.toUpperCase()),
  lastUpdated: device.last_updated,
});

export const deviceApi = {
  getAll: async (roomId: number = DEFAULT_ROOM_ID): Promise<Device[]> => {
    const response = await api.get<BackendDevice[]>(`/api/v1/devices/${roomId}`);
    return response.data.map(mapBackendDevice);
  },

  control: async (
    deviceId: string,
    action: "turnOn" | "turnOff",
    roomId: number = DEFAULT_ROOM_ID,
  ): Promise<Device> => {
    const listResponse = await api.get<BackendDevice[]>(`/api/v1/devices/${roomId}`);
    const devices = listResponse.data;

    const target =
      /^\d+$/.test(deviceId)
        ? devices.find((item) => item.id === Number(deviceId))
        : devices.find((item) => {
          if (deviceId === "fan") {
            return item.device_type === "fan";
          }
          if (deviceId === "ac") {
            return item.device_type === "air_conditioner";
          }
          if (deviceId === "light") {
            return item.device_type === "window";
          }
          return false;
        });

    if (!target) {
      throw new Error("Device not found");
    }

    const backendAction =
      target.device_type === "window"
        ? action === "turnOn"
          ? "OPEN"
          : "CLOSE"
        : action === "turnOn"
          ? "ON"
          : "OFF";

    const response = await api.post<BackendDevice>(
      `/api/v1/devices/${target.id}/control`,
      { action: backendAction },
    );

    return mapBackendDevice(response.data);
  },

  controlFan: async (
    action: "turnOn" | "turnOff",
    roomId: number = DEFAULT_ROOM_ID,
  ): Promise<Device> => {
    return deviceApi.control("fan", action, roomId);
  },
};

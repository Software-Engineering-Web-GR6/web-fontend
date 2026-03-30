import api from "./api";
import type { Device } from "../types";

interface BackendDevice {
  id: number;
  room_id: number;
  name: string;
  device_type: string;
  state: string;
  target_temp: number;
  last_updated: string;
}

const DEFAULT_ROOM_ID = 1;

const mapBackendTypeToFrontend = (deviceType: string): Device["type"] => {
  if (deviceType === "air_conditioner") {
    return "ac";
  }
  if (deviceType === "light" || deviceType === "window") {
    return "light";
  }
  return "fan";
};

const mapBackendDevice = (device: BackendDevice): Device => ({
  id: String(device.id),
  roomId: device.room_id,
  name: device.name,
  type: mapBackendTypeToFrontend(device.device_type),
  index: Number(device.name.match(/(\d+)$/)?.[1] ?? 1),
  status: ["ON", "OPEN"].includes(device.state.toUpperCase()),
  targetTemp: device.target_temp,
  lastUpdated: device.last_updated,
});

const mapTypeToBackend = (deviceType: Device["type"]) => {
  if (deviceType === "ac") {
    return "air_conditioner";
  }
  return deviceType;
};

export const deviceApi = {
  getAll: async (roomId: number = DEFAULT_ROOM_ID): Promise<Device[]> => {
    const response = await api.get<BackendDevice[]>(`/api/v1/devices/${roomId}`);
    return response.data.map(mapBackendDevice);
  },

  controlOne: async (
    deviceId: string | number,
    action: "turnOn" | "turnOff",
  ): Promise<Device> => {
    const backendAction = action === "turnOn" ? "ON" : "OFF";

    const response = await api.post<BackendDevice>(
      `/api/v1/devices/${deviceId}/control`,
      { action: backendAction },
    );

    return mapBackendDevice(response.data);
  },

  controlGroup: async (
    deviceType: Device["type"],
    action: "turnOn" | "turnOff",
    roomId: number = DEFAULT_ROOM_ID,
  ): Promise<Device[]> => {
    const devices = await deviceApi.getAll(roomId);
    const targets = devices.filter((device) => device.type === deviceType);

    const updates = await Promise.all(
      targets.map((device) => deviceApi.controlOne(device.id, action)),
    );

    return updates;
  },

  controlFan: async (
    action: "turnOn" | "turnOff",
    roomId: number = DEFAULT_ROOM_ID,
  ): Promise<Device[]> => {
    return deviceApi.controlGroup("fan", action, roomId);
  },

  controlByTypeAndIndex: async (
    deviceType: Device["type"],
    index: number,
    action: "turnOn" | "turnOff",
    roomId: number = DEFAULT_ROOM_ID,
  ): Promise<Device> => {
    const listResponse = await api.get<BackendDevice[]>(`/api/v1/devices/${roomId}`);
    const target = listResponse.data.find(
      (device) =>
        device.device_type === mapTypeToBackend(deviceType) &&
        Number(device.name.match(/(\d+)$/)?.[1] ?? 1) === index,
    );

    if (!target) {
      throw new Error("Device not found");
    }

    return deviceApi.controlOne(target.id, action);
  },

  updateAcTemperature: async (
    deviceId: string | number,
    targetTemp: number,
  ): Promise<Device> => {
    const response = await api.put<BackendDevice>(
      `/api/v1/devices/${deviceId}/temperature`,
      { target_temp: targetTemp },
    );
    return mapBackendDevice(response.data);
  },
};

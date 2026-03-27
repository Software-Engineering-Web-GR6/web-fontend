export type DeviceType = "fan" | "light" | "ac";

export interface Device {
  id: string;
  roomId: number;
  name: string;
  type: DeviceType;
  index: number;
  status: boolean;
  targetTemp?: number;
  lastUpdated: string;
}

export interface DeviceControl {
  deviceId: string;
  action: "turnOn" | "turnOff";
}

export interface DeviceState {
  devices: Device[];
  fanOn: boolean;
  lightOn: boolean;
  acOn: boolean;
  acTemp: number;
  lastUpdated: string;
  syncDevices: (devices: Device[]) => void;
  updateDevice: (device: Device) => void;
  setFanOn: (on: boolean) => void;
  setLightOn: (on: boolean) => void;
  setAcOn: (on: boolean) => void;
  setAcTemp: (temp: number) => void;
  setLastUpdated: (time: string) => void;
}

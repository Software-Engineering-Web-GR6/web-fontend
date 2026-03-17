// Device Types
export type DeviceType = "fan" | "light" | "ac";

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  status: boolean;
  lastUpdated: string;
}

export interface DeviceControl {
  deviceId: string;
  action: "turnOn" | "turnOff";
}

export interface DeviceState {
  fanOn: boolean;
  lightOn: boolean;
  acOn: boolean;
  acTemp: number;
  lastUpdated: string;
  setFanOn: (on: boolean) => void;
  setLightOn: (on: boolean) => void;
  setAcOn: (on: boolean) => void;
  setAcTemp: (temp: number) => void;
  setLastUpdated: (time: string) => void;
}

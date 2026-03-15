// Device Types
export type DeviceType = "fan" | "window" | "light" | "ac";

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
  windowOpen: boolean;
  acOn: boolean;
  lastUpdated: string;
  setFanOn: (on: boolean) => void;
  setWindowOpen: (open: boolean) => void;
  setAcOn: (on: boolean) => void;
  setLastUpdated: (time: string) => void;
}

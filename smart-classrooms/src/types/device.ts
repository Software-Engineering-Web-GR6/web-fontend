export interface DeviceState {
  roomId: string;
  fanOn: boolean;
  windowOpen: boolean;
  manual: boolean;
}

export interface DeviceCommand {
  roomId: string;
  device: 'fan' | 'window';
  action: 'on' | 'off' | 'open' | 'close';
}

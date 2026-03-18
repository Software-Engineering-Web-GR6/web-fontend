import api from './api';
import type { DeviceCommand, DeviceState } from '../types/device';

export async function sendDeviceCommand(command: DeviceCommand): Promise<void> {
  await api.post('/devices/command', command);
}

export async function getDeviceState(roomId: string): Promise<DeviceState> {
  const response = await api.get<DeviceState>(`/devices/${roomId}`);
  return response.data;
}

import type { SensorReading } from '../types/sensor';
import type { DeviceState } from '../types/device';
import type { Alert } from '../types/alert';

const now = Date.now();

export function generateDemoReadings(roomId: string, count = 20): SensorReading[] {
  return Array.from({ length: count }, (_, i) => ({
    roomId,
    temperature: 22 + Math.sin(i * 0.5) * 5 + Math.random() * 2,
    humidity: 55 + Math.cos(i * 0.3) * 10 + Math.random() * 3,
    timestamp: new Date(now - (count - i) * 3 * 60 * 1000).toISOString(),
  }));
}

export const demoRooms = ['A101', 'A102', 'B201'];

export const demoDevices: Record<string, DeviceState> = {
  A101: { roomId: 'A101', fanOn: true, windowOpen: false, manual: false },
  A102: { roomId: 'A102', fanOn: false, windowOpen: true, manual: true },
  B201: { roomId: 'B201', fanOn: false, windowOpen: false, manual: false },
};

export const demoAlerts: Alert[] = [
  {
    id: '1',
    roomId: 'A101',
    type: 'high_temp',
    message: 'Nhiệt độ phòng A101 vượt ngưỡng 35°C',
    status: 'new',
    timestamp: new Date(now - 5 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    roomId: 'B201',
    type: 'high_humidity',
    message: 'Độ ẩm phòng B201 vượt ngưỡng 80%',
    status: 'acknowledged',
    timestamp: new Date(now - 20 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    roomId: 'A102',
    type: 'device_fault',
    message: 'Quạt phòng A102 không phản hồi lệnh điều khiển',
    status: 'resolved',
    timestamp: new Date(now - 60 * 60 * 1000).toISOString(),
  },
];

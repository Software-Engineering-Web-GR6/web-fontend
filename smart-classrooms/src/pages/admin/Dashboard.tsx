import { useState } from 'react';
import { Card, CardHeader } from '../../components/ui/Card';
import { TempCard } from '../../components/sensors/TempCard';
import { HumidityCard } from '../../components/sensors/HumidityCard';
import { ComfortIndex } from '../../components/sensors/ComfortIndex';
import { FanControl } from '../../components/devices/FanControl';
import { WindowControl } from '../../components/devices/WindowControl';
import { TempLineChart } from '../../components/charts/TempLineChart';
import { HumidityChart } from '../../components/charts/HumidityChart';
import { AlertBanner } from '../../components/alerts/AlertBanner';
import { getTemperatureStatus, getHumidityStatus } from '../../utils/thresholdLogic';
import { DEFAULT_THRESHOLDS } from '../../utils/constants';
import { generateDemoReadings, demoRooms, demoDevices, demoAlerts } from '../../utils/demoData';
import type { DeviceState } from '../../types/device';

export function AdminDashboard() {
  const [selectedRoom, setSelectedRoom] = useState(demoRooms[0]);
  const [devices, setDevices] = useState(demoDevices);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  const history = generateDemoReadings(selectedRoom);
  const latest = history[history.length - 1];
  const thresholds = { ...DEFAULT_THRESHOLDS, roomId: selectedRoom };
  const tempStatus = getTemperatureStatus(latest.temperature, thresholds);
  const humStatus = getHumidityStatus(latest.humidity, thresholds);
  const device = devices[selectedRoom] ?? {
    roomId: selectedRoom,
    fanOn: false,
    windowOpen: false,
    manual: false,
  };

  const activeAlerts = demoAlerts.filter(
    (a) => a.status === 'new' && !dismissedAlerts.has(a.id),
  );

  function handleFanToggle(on: boolean) {
    setDevices((prev) => ({
      ...prev,
      [selectedRoom]: { ...prev[selectedRoom], fanOn: on, manual: true } as DeviceState,
    }));
  }

  function handleWindowToggle(open: boolean) {
    setDevices((prev) => ({
      ...prev,
      [selectedRoom]: { ...prev[selectedRoom], windowOpen: open, manual: true } as DeviceState,
    }));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Dashboard – Admin</h1>
        <div className="flex gap-2">
          {demoRooms.map((room) => (
            <button
              key={room}
              onClick={() => setSelectedRoom(room)}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                selectedRoom === room
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {room}
            </button>
          ))}
        </div>
      </div>

      {/* Active alerts */}
      {activeAlerts.length > 0 && (
        <div className="space-y-2">
          {activeAlerts.map((alert) => (
            <AlertBanner
              key={alert.id}
              alert={alert}
              onDismiss={() => setDismissedAlerts((s) => new Set([...s, alert.id]))}
            />
          ))}
        </div>
      )}

      {/* Sensor cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TempCard roomId={selectedRoom} temperature={latest.temperature} status={tempStatus} />
        <HumidityCard roomId={selectedRoom} humidity={latest.humidity} status={humStatus} />
        <ComfortIndex temperature={latest.temperature} humidity={latest.humidity} />
      </div>

      {/* Device controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FanControl device={device} onToggle={handleFanToggle} />
        <WindowControl device={device} onToggle={handleWindowToggle} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Biểu đồ nhiệt độ (real-time)" subtitle={selectedRoom} />
          <TempLineChart data={history} />
        </Card>
        <Card>
          <CardHeader title="Biểu đồ độ ẩm (real-time)" subtitle={selectedRoom} />
          <HumidityChart data={history} />
        </Card>
      </div>
    </div>
  );
}

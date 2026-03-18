import { useState } from 'react';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DEFAULT_THRESHOLDS } from '../../utils/constants';
import type { ThresholdConfig } from '../../types/threshold';
import { demoRooms } from '../../utils/demoData';

export function AdminSettings() {
  const [selectedRoom, setSelectedRoom] = useState(demoRooms[0]);
  const [thresholds, setThresholds] = useState<ThresholdConfig>({
    ...DEFAULT_THRESHOLDS,
    roomId: selectedRoom,
  });
  const [saved, setSaved] = useState(false);

  function handleChange(field: keyof ThresholdConfig, value: number) {
    setThresholds((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-800">Cài đặt ngưỡng</h1>

      <div className="flex gap-2">
        {demoRooms.map((room) => (
          <button
            key={room}
            onClick={() => {
              setSelectedRoom(room);
              setThresholds({ ...DEFAULT_THRESHOLDS, roomId: room });
            }}
            className={`px-3 py-1.5 rounded text-sm font-medium ${
              selectedRoom === room
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700'
            }`}
          >
            {room}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader title={`Ngưỡng cảnh báo – ${selectedRoom}`} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(
            [
              { field: 'maxTemperature', label: 'Nhiệt độ tối đa (°C)', unit: '°C' },
              { field: 'minTemperature', label: 'Nhiệt độ tối thiểu (°C)', unit: '°C' },
              { field: 'maxHumidity', label: 'Độ ẩm tối đa (%)', unit: '%' },
              { field: 'minHumidity', label: 'Độ ẩm tối thiểu (%)', unit: '%' },
            ] as const
          ).map(({ field, label }) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input
                type="number"
                value={thresholds[field]}
                onChange={(e) => handleChange(field, Number(e.target.value))}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
        </div>
        <div className="mt-6 flex items-center gap-4">
          <Button onClick={handleSave}>Lưu cài đặt</Button>
          {saved && <span className="text-sm text-green-600">✅ Đã lưu thành công!</span>}
        </div>
      </Card>
    </div>
  );
}

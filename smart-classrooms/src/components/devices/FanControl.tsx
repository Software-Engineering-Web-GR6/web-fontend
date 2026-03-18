import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import type { DeviceState } from '../../types/device';

interface FanControlProps {
  device: DeviceState;
  onToggle: (on: boolean) => void;
}

export function FanControl({ device, onToggle }: FanControlProps) {
  return (
    <Card>
      <CardHeader title="Quạt" subtitle={device.roomId} />
      <div className="flex items-center gap-4">
        <span className="text-3xl">{device.fanOn ? '🌀' : '⭕'}</span>
        <div>
          <p className="text-sm text-gray-600">
            Trạng thái: <strong>{device.fanOn ? 'Đang chạy' : 'Tắt'}</strong>
          </p>
          <Button
            variant={device.fanOn ? 'danger' : 'primary'}
            size="sm"
            className="mt-2"
            onClick={() => onToggle(!device.fanOn)}
          >
            {device.fanOn ? 'Tắt quạt' : 'Bật quạt'}
          </Button>
        </div>
      </div>
    </Card>
  );
}

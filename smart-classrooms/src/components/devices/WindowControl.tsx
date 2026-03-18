import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import type { DeviceState } from '../../types/device';

interface WindowControlProps {
  device: DeviceState;
  onToggle: (open: boolean) => void;
}

export function WindowControl({ device, onToggle }: WindowControlProps) {
  return (
    <Card>
      <CardHeader title="Cửa sổ" subtitle={device.roomId} />
      <div className="flex items-center gap-4">
        <span className="text-3xl">{device.windowOpen ? '🪟' : '🚪'}</span>
        <div>
          <p className="text-sm text-gray-600">
            Trạng thái: <strong>{device.windowOpen ? 'Đang mở' : 'Đóng'}</strong>
          </p>
          <Button
            variant={device.windowOpen ? 'danger' : 'primary'}
            size="sm"
            className="mt-2"
            onClick={() => onToggle(!device.windowOpen)}
          >
            {device.windowOpen ? 'Đóng cửa' : 'Mở cửa'}
          </Button>
        </div>
      </div>
    </Card>
  );
}

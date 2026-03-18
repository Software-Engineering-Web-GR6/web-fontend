import { Card, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { formatHumidity } from '../../utils/formatters';
import type { SensorStatus } from '../../utils/thresholdLogic';

interface HumidityCardProps {
  roomId: string;
  humidity: number;
  status: SensorStatus;
}

const statusColor: Record<SensorStatus, 'green' | 'yellow' | 'red'> = {
  normal: 'green',
  warning: 'yellow',
  danger: 'red',
};

const statusLabel: Record<SensorStatus, string> = {
  normal: 'Bình thường',
  warning: 'Cảnh báo',
  danger: 'Nguy hiểm',
};

export function HumidityCard({ roomId, humidity, status }: HumidityCardProps) {
  return (
    <Card>
      <CardHeader
        title={`Độ ẩm – ${roomId}`}
        action={<Badge label={statusLabel[status]} color={statusColor[status]} />}
      />
      <p className="text-4xl font-bold text-blue-500">{formatHumidity(humidity)}</p>
    </Card>
  );
}

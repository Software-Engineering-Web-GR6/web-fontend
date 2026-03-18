import { Card, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { formatTemperature } from '../../utils/formatters';
import type { SensorStatus } from '../../utils/thresholdLogic';

interface TempCardProps {
  roomId: string;
  temperature: number;
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

export function TempCard({ roomId, temperature, status }: TempCardProps) {
  return (
    <Card>
      <CardHeader
        title={`Nhiệt độ – ${roomId}`}
        action={<Badge label={statusLabel[status]} color={statusColor[status]} />}
      />
      <p className="text-4xl font-bold text-red-500">{formatTemperature(temperature)}</p>
    </Card>
  );
}

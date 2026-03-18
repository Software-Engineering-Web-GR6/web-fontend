import { Card, CardHeader } from '../ui/Card';
import { computeComfortIndex } from '../../utils/thresholdLogic';
import { Badge } from '../ui/Badge';

interface ComfortIndexProps {
  temperature: number;
  humidity: number;
}

function getComfortLabel(index: number): { label: string; color: 'green' | 'yellow' | 'red' } {
  if (index <= 27) return { label: 'Thoải mái', color: 'green' };
  if (index <= 32) return { label: 'Ấm áp', color: 'yellow' };
  return { label: 'Nóng bức', color: 'red' };
}

export function ComfortIndex({ temperature, humidity }: ComfortIndexProps) {
  const index = computeComfortIndex(temperature, humidity);
  const { label, color } = getComfortLabel(index);

  return (
    <Card>
      <CardHeader title="Chỉ số tiện nghi" action={<Badge label={label} color={color} />} />
      <p className="text-4xl font-bold text-green-600">{index}°C</p>
      <p className="text-sm text-gray-500 mt-1">Chỉ số cảm nhận nhiệt</p>
    </Card>
  );
}

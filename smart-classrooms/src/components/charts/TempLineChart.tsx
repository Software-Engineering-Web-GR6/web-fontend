import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { SensorReading } from '../../types/sensor';
import { formatTime } from '../../utils/formatters';
import { COLORS } from '../../utils/constants';

interface TempLineChartProps {
  data: SensorReading[];
}

export function TempLineChart({ data }: TempLineChartProps) {
  const chartData = data.map((r) => ({
    time: formatTime(r.timestamp),
    temperature: r.temperature,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" tick={{ fontSize: 11 }} />
        <YAxis domain={['auto', 'auto']} unit="°C" tick={{ fontSize: 11 }} />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="temperature"
          stroke={COLORS.temperature}
          dot={false}
          strokeWidth={2}
          name="Nhiệt độ"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

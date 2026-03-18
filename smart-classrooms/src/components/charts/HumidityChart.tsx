import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { SensorReading } from '../../types/sensor';
import { formatTime } from '../../utils/formatters';
import { COLORS } from '../../utils/constants';

interface HumidityChartProps {
  data: SensorReading[];
}

export function HumidityChart({ data }: HumidityChartProps) {
  const chartData = data.map((r) => ({
    time: formatTime(r.timestamp),
    humidity: r.humidity,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" tick={{ fontSize: 11 }} />
        <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
        <Tooltip />
        <Area
          type="monotone"
          dataKey="humidity"
          stroke={COLORS.humidity}
          fill={COLORS.humidity}
          fillOpacity={0.2}
          name="Độ ẩm"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

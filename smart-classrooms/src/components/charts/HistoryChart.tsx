import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { SensorReading } from '../../types/sensor';
import { formatTime } from '../../utils/formatters';
import { COLORS } from '../../utils/constants';

interface HistoryChartProps {
  data: SensorReading[];
}

export function HistoryChart({ data }: HistoryChartProps) {
  const chartData = data.map((r) => ({
    time: formatTime(r.timestamp),
    temperature: r.temperature,
    humidity: r.humidity,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" tick={{ fontSize: 11 }} />
        <YAxis yAxisId="left" unit="°C" tick={{ fontSize: 11 }} />
        <YAxis yAxisId="right" orientation="right" unit="%" tick={{ fontSize: 11 }} />
        <Tooltip />
        <Legend />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="temperature"
          stroke={COLORS.temperature}
          dot={false}
          strokeWidth={2}
          name="Nhiệt độ"
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="humidity"
          stroke={COLORS.humidity}
          dot={false}
          strokeWidth={2}
          name="Độ ẩm"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

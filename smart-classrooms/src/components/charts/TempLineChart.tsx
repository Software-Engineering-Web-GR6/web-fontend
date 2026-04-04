import React from "react";
import {
  Area,
  AreaChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { useSensorStore } from "../../store";
import { formatChartTime, toSafeTimestampMs } from "../../utils/formatters";
import { CHART_COLORS } from "../../utils/constants";

interface TempLineChartProps {
  height?: number;
}

export const TempLineChart: React.FC<TempLineChartProps> = ({
  height = 300,
}) => {
  const { history } = useSensorStore();

  const rawData = history
    .slice(-36)
    .sort(
      (left, right) =>
        toSafeTimestampMs(left.timestamp) - toSafeTimestampMs(right.timestamp),
    );

  const data = rawData.map((item) => ({
    timestamp: item.timestamp,
    value: item.temp,
  }));

  const values = data.map((item) => item.value);
  const minValue = values.length ? Math.min(...values) : 18;
  const maxValue = values.length ? Math.max(...values) : 35;
  const padding = 1.5;
  const yDomain: [number, number] = [
    Math.max(15, Math.floor(minValue - padding)),
    Math.min(40, Math.ceil(maxValue + padding)),
  ];

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        Đang chờ dữ liệu...
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 12, right: 22, bottom: 8, left: 2 }}>
        <defs>
          <linearGradient id="tempAreaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART_COLORS.temp} stopOpacity={0.35} />
            <stop offset="100%" stopColor={CHART_COLORS.temp} stopOpacity={0.04} />
          </linearGradient>
        </defs>

        <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="#e5e7eb" />
        <XAxis
          dataKey="timestamp"
          tickFormatter={(value: string) => formatChartTime(value)}
          tick={{ fontSize: 12, fill: "#6b7280" }}
          axisLine={{ stroke: "#e5e7eb" }}
          tickLine={false}
          minTickGap={16}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "#6b7280" }}
          axisLine={{ stroke: "#e5e7eb" }}
          tickLine={false}
          domain={yDomain}
          unit="°C"
        />

        <ReferenceLine y={20} stroke="#10b981" strokeDasharray="3 3" ifOverflow="extendDomain" />
        <ReferenceLine y={27} stroke="#f97316" strokeDasharray="3 3" ifOverflow="extendDomain" />

        <Tooltip
          cursor={{ stroke: "#94a3b8", strokeDasharray: "4 4" }}
          contentStyle={{
            backgroundColor: "#0f172a",
            border: "1px solid #1e293b",
            borderRadius: "12px",
            color: "#e2e8f0",
            boxShadow: "0 12px 30px rgba(15, 23, 42, 0.28)",
          }}
          labelStyle={{ color: "#cbd5e1", fontSize: "12px" }}
          labelFormatter={(value: string) => formatChartTime(value)}
          formatter={(value) => [`${Number(value).toFixed(1)}°C`, "Nhiệt độ"]}
        />

        <Area
          type="monotone"
          dataKey="value"
          stroke="none"
          fill="url(#tempAreaFill)"
          animationDuration={700}
        />

        <Line
          type="monotone"
          dataKey="value"
          stroke={CHART_COLORS.temp}
          strokeWidth={2.8}
          dot={false}
          activeDot={{ r: 5, strokeWidth: 2, fill: "#ffffff" }}
          animationDuration={700}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default TempLineChart;

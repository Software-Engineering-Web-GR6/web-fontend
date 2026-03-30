import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useSensorStore } from "../../store";
import { buildThirtySecondStepLabels } from "../../utils/formatters";
import { CHART_COLORS } from "../../utils/constants";

interface TempLineChartProps {
  height?: number;
}

export const TempLineChart: React.FC<TempLineChartProps> = ({
  height = 300,
}) => {
  const { history } = useSensorStore();

  const rawData = history
    .slice(-20)
    .sort(
      (left, right) =>
        new Date(left.timestamp).getTime() - new Date(right.timestamp).getTime(),
    );

  const labels = buildThirtySecondStepLabels(
    rawData.length,
    rawData[rawData.length - 1]?.timestamp,
  );

  const data = rawData.map((item, index) => ({
    timestamp: item.timestamp,
    time: labels[index],
    value: item.temp,
  }));

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        Đang chờ dữ liệu...
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="time"
          tick={{ fontSize: 12, fill: "#6b7280" }}
          axisLine={{ stroke: "#e5e7eb" }}
          tickLine={{ stroke: "#e5e7eb" }}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "#6b7280" }}
          axisLine={{ stroke: "#e5e7eb" }}
          tickLine={{ stroke: "#e5e7eb" }}
          domain={[18, 35]}
          unit="°C"
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
          formatter={(value) => [`${Number(value).toFixed(1)}°C`, "Nhiệt độ"]}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={CHART_COLORS.temp}
          strokeWidth={2}
          dot={{ fill: CHART_COLORS.temp, strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, strokeWidth: 2 }}
          animationDuration={500}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default TempLineChart;

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useSensorStore } from "../../store";
import { buildThirtySecondStepLabels } from "../../utils/formatters";
import { CHART_COLORS } from "../../utils/constants";

interface HistoryChartProps {
  height?: number;
}

export const HistoryChart: React.FC<HistoryChartProps> = ({ height = 300 }) => {
  const { history } = useSensorStore();

  const rawData = history
    .slice(-30)
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
    temp: item.temp,
    humidity: item.humidity,
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
          tick={{ fontSize: 11, fill: "#6b7280" }}
          axisLine={{ stroke: "#e5e7eb" }}
          tickLine={{ stroke: "#e5e7eb" }}
        />
        <YAxis
          yAxisId="left"
          tick={{ fontSize: 12, fill: "#6b7280" }}
          axisLine={{ stroke: "#e5e7eb" }}
          tickLine={{ stroke: "#e5e7eb" }}
          domain={["auto", "auto"]}
          unit="°C"
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tick={{ fontSize: 12, fill: "#6b7280" }}
          axisLine={{ stroke: "#e5e7eb" }}
          tickLine={{ stroke: "#e5e7eb" }}
          domain={["auto", "auto"]}
          unit="%"
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
          formatter={(value, name) => {
            const v = Number(value);
            if (name === "temp") return [`${v.toFixed(1)}°C`, "Nhiệt độ"];
            return [`${v.toFixed(1)}%`, "Độ ẩm"];
          }}
        />
        <Legend
          wrapperStyle={{ paddingTop: "10px" }}
          formatter={(value: string) => {
            if (value === "temp") return "Nhiệt độ";
            return "Độ ẩm";
          }}
        />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="temp"
          stroke={CHART_COLORS.temp}
          strokeWidth={2}
          dot={{ fill: CHART_COLORS.temp, strokeWidth: 2, r: 3 }}
          activeDot={{ r: 5, strokeWidth: 2 }}
          animationDuration={500}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="humidity"
          stroke={CHART_COLORS.humidity}
          strokeWidth={2}
          dot={{ fill: CHART_COLORS.humidity, strokeWidth: 2, r: 3 }}
          activeDot={{ r: 5, strokeWidth: 2 }}
          animationDuration={500}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default HistoryChart;

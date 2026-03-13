import React from "react";
import { Thermometer, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useSensorStore } from "../../store";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import { formatTemp } from "../../utils/formatters";
import { CHART_COLORS } from "../../utils/constants";

interface TempCardProps {
  showTrend?: boolean;
}

export const TempCard: React.FC<TempCardProps> = ({ showTrend = true }) => {
  const { temp, history } = useSensorStore();

  // Calculate trend
  const getTrend = (): {
    direction: "up" | "down" | "stable";
    value: number;
  } | null => {
    if (history.length < 2) return null;
    const current = history[history.length - 1]?.temp || 0;
    const previous = history[history.length - 2]?.temp || 0;
    const diff = current - previous;

    if (Math.abs(diff) < 0.5) return { direction: "stable", value: 0 };
    return { direction: diff > 0 ? "up" : "down", value: Math.abs(diff) };
  };

  const trend = getTrend();

  // Determine status
  const getStatus = (): "normal" | "warning" | "danger" => {
    if (temp > 30) return "danger";
    if (temp > 28 || temp < 18) return "warning";
    return "normal";
  };

  const status = getStatus();

  const statusConfig = {
    normal: { badge: "success", label: "Bình thường" },
    warning: { badge: "warning", label: "Cảnh báo" },
    danger: { badge: "danger", label: "Nguy hiểm" },
  };

  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">Nhiệt độ</p>
          <div className="flex items-baseline gap-2">
            <span
              className="text-4xl font-bold"
              style={{ color: CHART_COLORS.temp }}
            >
              {formatTemp(temp)}
            </span>
            {showTrend && trend && (
              <div className="flex items-center gap-1">
                {trend.direction === "up" && (
                  <TrendingUp className="w-4 h-4 text-red-500" />
                )}
                {trend.direction === "down" && (
                  <TrendingDown className="w-4 h-4 text-blue-500" />
                )}
                {trend.direction === "stable" && (
                  <Minus className="w-4 h-4 text-gray-400" />
                )}
              </div>
            )}
          </div>
          <Badge
            variant={statusConfig[status].badge as any}
            size="sm"
            className="mt-2"
          >
            {statusConfig[status].label}
          </Badge>
        </div>
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${CHART_COLORS.temp}15` }}
        >
          <Thermometer
            className="w-8 h-8"
            style={{ color: CHART_COLORS.temp }}
          />
        </div>
      </div>
    </Card>
  );
};

export default TempCard;

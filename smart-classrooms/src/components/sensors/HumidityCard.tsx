import React from "react";
import { Droplets, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useSensorStore } from "../../store";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import { formatHumidity } from "../../utils/formatters";
import { CHART_COLORS } from "../../utils/constants";

interface HumidityCardProps {
  showTrend?: boolean;
}

export const HumidityCard: React.FC<HumidityCardProps> = ({
  showTrend = true,
}) => {
  const { humidity, history } = useSensorStore();

  // Calculate trend
  const getTrend = (): {
    direction: "up" | "down" | "stable";
    value: number;
  } | null => {
    if (history.length < 2) return null;
    const current = history[history.length - 1]?.humidity || 0;
    const previous = history[history.length - 2]?.humidity || 0;
    const diff = current - previous;

    if (Math.abs(diff) < 1) return { direction: "stable", value: 0 };
    return { direction: diff > 0 ? "up" : "down", value: Math.abs(diff) };
  };

  const trend = getTrend();

  // Determine status
  const getStatus = (): "normal" | "warning" | "danger" => {
    if (humidity > 80) return "danger";
    if (humidity > 70 || humidity < 30) return "warning";
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
          <p className="text-sm font-medium text-gray-500 mb-1">Độ ẩm</p>
          <div className="flex items-baseline gap-2">
            <span
              className="text-4xl font-bold"
              style={{ color: CHART_COLORS.humidity }}
            >
              {formatHumidity(humidity)}
            </span>
            {showTrend && trend && (
              <div className="flex items-center gap-1">
                {trend.direction === "up" && (
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                )}
                {trend.direction === "down" && (
                  <TrendingDown className="w-4 h-4 text-orange-500" />
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
          style={{ backgroundColor: `${CHART_COLORS.humidity}15` }}
        >
          <Droplets
            className="w-8 h-8"
            style={{ color: CHART_COLORS.humidity }}
          />
        </div>
      </div>
    </Card>
  );
};

export default HumidityCard;

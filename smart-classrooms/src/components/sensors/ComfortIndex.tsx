import React from "react";
import { Smile, Meh, Frown, AlertTriangle } from "lucide-react";
import { useSensorStore } from "../../store";
import { calculateComfortIndex } from "../../utils/thresholdLogic";
import Card from "../ui/Card";
import { CHART_COLORS } from "../../utils/constants";

export const ComfortIndex: React.FC = () => {
  const { temp, humidity } = useSensorStore();

  const { level, value } = calculateComfortIndex(temp, humidity);

  const config = {
    comfortable: {
      icon: Smile,
      label: "Thoải mái",
      color: CHART_COLORS.success,
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    too_hot: {
      icon: AlertTriangle,
      label: "Quá nóng",
      color: CHART_COLORS.danger,
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
    },
    too_cold: {
      icon: AlertTriangle,
      label: "Quá lạnh",
      color: CHART_COLORS.humidity,
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    too_humid: {
      icon: Meh,
      label: "Quá ẩm",
      color: CHART_COLORS.warning,
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
    },
    too_dry: {
      icon: Meh,
      label: "Quá khô",
      color: CHART_COLORS.warning,
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
    },
  };

  const current = config[level];
  const Icon = current.icon;

  // Calculate progress bar color
  const getProgressColor = () => {
    if (value >= 80) return "bg-green-500";
    if (value >= 60) return "bg-yellow-500";
    if (value >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">
            Chỉ số tiện nghi
          </p>
          <div className="flex items-baseline gap-2">
            <span
              className="text-4xl font-bold"
              style={{ color: current.color }}
            >
              {value}
            </span>
            <span className="text-lg text-gray-400">/100</span>
          </div>
        </div>
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${current.color}15` }}
        >
          <Icon className="w-8 h-8" style={{ color: current.color }} />
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full ${getProgressColor()} transition-all duration-500 ease-out`}
            style={{ width: `${value}%` }}
          />
        </div>
      </div>

      {/* Status */}
      <div
        className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium ${current.bgColor} border ${current.borderColor}`}
        style={{ color: current.color }}
      >
        <Icon className="w-4 h-4 mr-2" />
        {current.label}
      </div>

      {/* Info */}
      <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
        <p>Nhiệt độ tối ưu: 20-26°C</p>
        <p>Độ ẩm tối ưu: 40-60%</p>
      </div>
    </Card>
  );
};

export default ComfortIndex;

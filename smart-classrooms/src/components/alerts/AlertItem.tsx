import React from "react";
import { AlertTriangle, Info, AlertCircle, CheckCircle } from "lucide-react";
import clsx from "clsx";
import type { Alert, AlertLevel } from "../../types";
import { formatRelativeTime } from "../../utils/formatters";

interface AlertItemProps {
  alert: Alert;
  onMarkRead?: (id: string) => void;
}

export const AlertItem: React.FC<AlertItemProps> = ({ alert, onMarkRead }) => {
  const config = {
    info: {
      icon: Info,
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      iconColor: "text-blue-600",
    },
    warning: {
      icon: AlertTriangle,
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      iconColor: "text-yellow-600",
    },
    critical: {
      icon: AlertCircle,
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      iconColor: "text-red-600",
    },
  };

  const { icon: Icon, bgColor, borderColor, iconColor } = config[alert.level];

  const typeLabels = {
    temperature: "Nhiệt độ",
    humidity: "Độ ẩm",
    device: "Thiết bị",
    system: "Hệ thống",
  };

  return (
    <div
      className={clsx(
        "flex items-start gap-3 p-4 rounded-lg border transition-colors cursor-pointer",
        bgColor,
        borderColor,
        !alert.read && "ring-2 ring-offset-1 ring-indigo-200",
      )}
      onClick={() => onMarkRead?.(alert.id)}
    >
      <Icon className={clsx("w-5 h-5 mt-0.5", iconColor)} />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={clsx("font-medium", !alert.read && "font-semibold")}>
            {alert.message}
          </p>
          {!alert.read && (
            <span className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0 mt-2" />
          )}
        </div>
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
          <span className="px-2 py-0.5 bg-white rounded-full">
            {typeLabels[alert.type]}
          </span>
          <span>{formatRelativeTime(alert.timestamp)}</span>
        </div>
      </div>
    </div>
  );
};

export default AlertItem;

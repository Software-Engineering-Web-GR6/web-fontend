import React from "react";
import { AlertTriangle, X, Bell } from "lucide-react";
import clsx from "clsx";
import { useAlerts } from "../../hooks";
import type { AlertLevel } from '../../types';

interface AlertBannerProps {
  maxAlerts?: number;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ maxAlerts = 3 }) => {
  const { getCriticalAlerts, getWarningAlerts, markAsRead } = useAlerts();

  const criticalAlerts = getCriticalAlerts();
  const warningAlerts = getWarningAlerts();
  const displayAlerts = [...criticalAlerts, ...warningAlerts].slice(
    0,
    maxAlerts,
  );

  if (displayAlerts.length === 0) return null;

  const getAlertStyle = (level: AlertLevel) => {
    switch (level) {
      case "critical":
        return "bg-red-50 border-red-200 text-red-800";
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      default:
        return "bg-blue-50 border-blue-200 text-blue-800";
    }
  };

  const getAlertIcon = (level: AlertLevel) => {
    return <AlertTriangle className="w-5 h-5" />;
  };

  return (
    <div className="space-y-2 mb-4">
      {displayAlerts.map((alert) => (
        <div
          key={alert.id}
          className={clsx(
            "flex items-start gap-3 p-4 rounded-lg border animate-pulse",
            getAlertStyle(alert.level),
          )}
          onClick={() => markAsRead(alert.id)}
        >
          {getAlertIcon(alert.level)}
          <div className="flex-1">
            <p className="font-medium">{alert.message}</p>
            <p className="text-sm opacity-75 mt-1">
              {new Date(alert.timestamp).toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <button className="text-current opacity-50 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default AlertBanner;

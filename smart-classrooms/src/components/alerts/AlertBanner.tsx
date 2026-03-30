import React from "react";
import { AlertTriangle } from "lucide-react";
import clsx from "clsx";
import { useAlerts } from "../../hooks";
import type { AlertLevel } from "../../types";

interface AlertBannerProps {
  maxAlerts?: number;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ maxAlerts = 3 }) => {
  const { alerts, markAsRead } = useAlerts();

  const displayAlerts = alerts
    .filter((alert) => alert.status !== "RESOLVED" && !alert.read)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, maxAlerts);

  if (displayAlerts.length === 0) return null;

  const getAlertStyle = (level: AlertLevel) => {
    switch (level) {
      case "critical":
        return "border-red-200 bg-red-50 text-red-800";
      case "warning":
        return "border-yellow-200 bg-yellow-50 text-yellow-800";
      default:
        return "border-blue-200 bg-blue-50 text-blue-800";
    }
  };

  return (
    <div className="mb-4 space-y-3">
      {displayAlerts.map((alert) => (
        <div
          key={alert.id}
          className={clsx("flex items-start gap-3 rounded-2xl border p-4", getAlertStyle(alert.level))}
          onClick={() => markAsRead(alert.id)}
        >
          <div className="mt-0.5 rounded-xl bg-white/70 p-2">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-medium">{alert.message}</p>
            <p className="mt-1 text-sm opacity-75">
              {new Date(alert.timestamp).toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <button
            onClick={(event) => {
              event.stopPropagation();
              markAsRead(alert.id);
            }}
            className="rounded-full border border-current/15 bg-white/70 px-3 py-1.5 text-xs font-semibold opacity-80 transition hover:opacity-100"
          >
            Bỏ qua
          </button>
        </div>
      ))}
    </div>
  );
};

export default AlertBanner;

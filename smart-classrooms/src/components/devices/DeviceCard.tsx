import React from "react";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import type { DeviceType } from "../../types";

interface DeviceCardProps {
  name: string;
  type: DeviceType;
  status: boolean;
  onToggle?: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({
  name,
  status,
  onToggle,
  disabled = false,
  icon,
}) => {
  return (
    <Card hover className="relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${
              status ? "bg-indigo-100" : "bg-gray-100"
            }`}
          >
            <div className={status ? "text-indigo-600" : "text-gray-400"}>{icon}</div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{name}</h3>
            <Badge variant={status ? "success" : "default"} size="sm">
              {status ? "Đang bật" : "Đã tắt"}
            </Badge>
          </div>
        </div>
        <button
          onClick={onToggle}
          disabled={disabled}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
            status ? "bg-indigo-600" : "bg-gray-200"
          } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              status ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
    </Card>
  );
};

export default DeviceCard;

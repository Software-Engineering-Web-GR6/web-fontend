import React from "react";
import { AirVent, Minus, Plus } from "lucide-react";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import { useDeviceControl } from "../../hooks";

interface AcControlProps {
  disabled?: boolean;
  roomId?: number;
}

export const AcControl: React.FC<AcControlProps> = ({
  disabled = false,
  roomId = 1,
}) => {
  const { acOn, acTemp, toggleAc, changeAcTemp, loading } = useDeviceControl(roomId);

  const handleTempChange = (delta: number) => {
    const nextTemp = Math.min(30, Math.max(16, acTemp + delta));
    changeAcTemp(nextTemp);
  };

  return (
    <Card hover className="relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${
              acOn ? "bg-cyan-100" : "bg-gray-100"
            }`}
          >
            <AirVent className={`h-6 w-6 ${acOn ? "text-cyan-600" : "text-gray-400"}`} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Điều hòa</h3>
            <div className="flex items-center gap-2">
              <Badge variant={acOn ? "success" : "default"} size="sm">
                {acOn ? "Đang bật" : "Đã tắt"}
              </Badge>
              {acOn && <span className="text-sm font-medium text-cyan-600">{acTemp}°C</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {acOn && (
            <div className="mr-2 flex items-center gap-1">
              <button
                onClick={() => handleTempChange(-1)}
                disabled={disabled || loading || acTemp <= 16}
                className="rounded-full p-1 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Minus className="h-4 w-4 text-gray-600" />
              </button>
              <span className="w-8 text-center font-medium text-gray-900">{acTemp}</span>
              <button
                onClick={() => handleTempChange(1)}
                disabled={disabled || loading || acTemp >= 30}
                className="rounded-full p-1 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          )}

          <button
            onClick={toggleAc}
            disabled={disabled || loading}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 ${
              acOn ? "bg-cyan-600" : "bg-gray-200"
            } ${disabled || loading ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                acOn ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>
    </Card>
  );
};

export default AcControl;

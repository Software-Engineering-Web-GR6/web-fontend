import React from "react";
import { AirVent, Minus, Plus } from "lucide-react";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import { useDeviceControl } from "../../hooks";

interface AcControlProps {
  disabled?: boolean;
}

export const AcControl: React.FC<AcControlProps> = ({ disabled = false }) => {
  const { acOn, acTemp, toggleAc, changeAcTemp, loading } = useDeviceControl();

  const handleTempChange = (delta: number) => {
    const newTemp = Math.min(30, Math.max(16, acTemp + delta));
    changeAcTemp(newTemp);
  };

  return (
    <Card hover className="relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
              acOn ? "bg-cyan-100" : "bg-gray-100"
            }`}
          >
            <AirVent
              className={`w-6 h-6 ${acOn ? "text-cyan-600" : "text-gray-400"}`}
            />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Điều hòa</h3>
            <div className="flex items-center gap-2">
              <Badge variant={acOn ? "success" : "default"} size="sm">
                {acOn ? "Đang bật" : "Đã tắt"}
              </Badge>
              {acOn && (
                <span className="text-sm text-cyan-600 font-medium">
                  {acTemp}°C
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Temperature Control */}
          {acOn && (
            <div className="flex items-center gap-1 mr-2">
              <button
                onClick={() => handleTempChange(-1)}
                disabled={disabled || loading || acTemp <= 16}
                className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Minus className="w-4 h-4 text-gray-600" />
              </button>
              <span className="w-8 text-center font-medium text-gray-900">
                {acTemp}
              </span>
              <button
                onClick={() => handleTempChange(1)}
                disabled={disabled || loading || acTemp >= 30}
                className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          )}

          {/* Toggle Switch */}
          <button
            onClick={toggleAc}
            disabled={disabled || loading}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 ${
              acOn ? "bg-cyan-600" : "bg-gray-200"
            } ${disabled || loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
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

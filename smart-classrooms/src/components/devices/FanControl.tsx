import React from "react";
import { Fan } from "lucide-react";
import DeviceCard from "./DeviceCard";
import { useDeviceControl } from "../../hooks";

interface FanControlProps {
  disabled?: boolean;
}

export const FanControl: React.FC<FanControlProps> = ({ disabled = false }) => {
  const { fanOn, toggleFan, loading } = useDeviceControl();

  return (
    <DeviceCard
      name="Quạt"
      type="fan"
      status={fanOn}
      onToggle={toggleFan}
      disabled={disabled || loading}
      icon={
        <Fan
          className={`w-6 h-6 ${fanOn ? "animate-spin" : ""}`}
          style={{ animationDuration: "2s" }}
        />
      }
    />
  );
};

export default FanControl;

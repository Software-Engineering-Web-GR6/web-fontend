import React from "react";
import { Fan } from "lucide-react";
import DeviceCard from "./DeviceCard";
import { useDeviceControl } from "../../hooks";

interface FanControlProps {
  disabled?: boolean;
  roomId?: number;
}

export const FanControl: React.FC<FanControlProps> = ({
  disabled = false,
  roomId = 1,
}) => {
  const { fanOn, toggleFan, loading } = useDeviceControl(roomId);

  return (
    <DeviceCard
      name="Quạt"
      type="fan"
      status={fanOn}
      onToggle={toggleFan}
      disabled={disabled || loading}
      icon={
        <Fan
          className={`h-6 w-6 ${fanOn ? "animate-spin" : ""}`}
          style={{ animationDuration: "2s" }}
        />
      }
    />
  );
};

export default FanControl;

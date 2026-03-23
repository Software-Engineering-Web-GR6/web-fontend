import React from "react";
import { Lightbulb } from "lucide-react";
import DeviceCard from "./DeviceCard";
import { useDeviceControl } from "../../hooks";

interface LightControlProps {
  disabled?: boolean;
  roomId?: number;
}

export const LightControl: React.FC<LightControlProps> = ({
  disabled = false,
  roomId = 1,
}) => {
  const { lightOn, toggleLight, loading } = useDeviceControl(roomId);

  return (
    <DeviceCard
      name="Đèn"
      type="light"
      status={lightOn}
      onToggle={toggleLight}
      disabled={disabled || loading}
      icon={<Lightbulb className={`h-6 w-6 ${lightOn ? "text-amber-500" : ""}`} />}
    />
  );
};

export default LightControl;

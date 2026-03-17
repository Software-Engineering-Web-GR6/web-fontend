import React from "react";
import { Lightbulb } from "lucide-react";
import DeviceCard from "./DeviceCard";
import { useDeviceControl } from "../../hooks";

interface LightControlProps {
  disabled?: boolean;
}

export const LightControl: React.FC<LightControlProps> = ({
  disabled = false,
}) => {
  const { lightOn, toggleLight, loading } = useDeviceControl();

  return (
    <DeviceCard
      name="Đèn"
      type="light"
      status={lightOn}
      onToggle={toggleLight}
      disabled={disabled || loading}
      icon={
        <Lightbulb
          className={`w-6 h-6 ${lightOn ? "text-yellow-500 fill-yellow-200" : ""}`}
        />
      }
    />
  );
};

export default LightControl;

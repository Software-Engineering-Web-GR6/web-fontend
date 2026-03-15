import React from "react";
import { Snowflake } from "lucide-react";
import DeviceCard from "./DeviceCard";
import { useDeviceControl } from "../../hooks";

interface AcControlProps {
  disabled?: boolean;
}

export const AcControl: React.FC<AcControlProps> = ({ disabled = false }) => {
  const { acOn, toggleAc, loading } = useDeviceControl();

  return (
    <DeviceCard
      name="Điều hòa"
      type="ac"
      status={acOn}
      onToggle={toggleAc}
      disabled={disabled || loading.ac}
      icon={<Snowflake className={`w-6 h-6 ${acOn ? "animate-pulse" : ""}`} />}
    />
  );
};

export default AcControl;

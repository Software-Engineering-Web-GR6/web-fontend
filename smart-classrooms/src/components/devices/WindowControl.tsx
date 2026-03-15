import React from "react";
import { DoorOpen } from "lucide-react";
import DeviceCard from "./DeviceCard";
import { useDeviceControl } from "../../hooks";

interface WindowControlProps {
  disabled?: boolean;
}

export const WindowControl: React.FC<WindowControlProps> = ({
  disabled = false,
}) => {
  const { windowOpen, toggleWindow, loading } = useDeviceControl();

  return (
    <DeviceCard
      name="Cửa sổ"
      type="window"
      status={windowOpen}
      onToggle={toggleWindow}
      disabled={disabled || loading.window}
      icon={<DoorOpen className="w-6 h-6" />}
    />
  );
};

export default WindowControl;

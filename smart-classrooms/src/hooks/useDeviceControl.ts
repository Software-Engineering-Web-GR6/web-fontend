import { useState, useCallback } from "react";
import { useDeviceStore } from "../store";
import { deviceApi } from "../services";

export const useDeviceControl = () => {
  const { fanOn, windowOpen, setFanOn, setWindowOpen } = useDeviceStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleFan = useCallback(async () => {
    try {
      setLoading(true);
      const newState = !fanOn;
      await deviceApi.controlFan(newState ? "turnOn" : "turnOff");
      setFanOn(newState);
    } catch (err) {
      setError("Failed to control fan");
      console.error(err);
      // Update local state anyway for demo purposes
      setFanOn(!fanOn);
    } finally {
      setLoading(false);
    }
  }, [fanOn, setFanOn]);

  const toggleWindow = useCallback(async () => {
    try {
      setLoading(true);
      const newState = !windowOpen;
      await deviceApi.controlWindow(newState ? "turnOn" : "turnOff");
      setWindowOpen(newState);
    } catch (err) {
      setError("Failed to control window");
      console.error(err);
      // Update local state anyway for demo purposes
      setWindowOpen(!windowOpen);
    } finally {
      setLoading(false);
    }
  }, [windowOpen, setWindowOpen]);

  const setFan = useCallback(
    (on: boolean) => {
      setFanOn(on);
    },
    [setFanOn],
  );

  const setWindow = useCallback(
    (open: boolean) => {
      setWindowOpen(open);
    },
    [setWindowOpen],
  );

  return {
    fanOn,
    windowOpen,
    loading,
    error,
    toggleFan,
    toggleWindow,
    setFan,
    setWindow,
  };
};

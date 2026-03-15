import { useState, useCallback } from "react";
import { useDeviceStore } from "../store";
import { deviceApi } from "../services";

type DeviceLoadingState = {
  fan: boolean;
  window: boolean;
  ac: boolean;
};

export const useDeviceControl = () => {
  const { fanOn, windowOpen, acOn, setFanOn, setWindowOpen, setAcOn } =
    useDeviceStore();
  const [loading, setLoading] = useState<DeviceLoadingState>({
    fan: false,
    window: false,
    ac: false,
  });
  const [error, setError] = useState<string | null>(null);

  const setDeviceLoading = useCallback(
    (device: keyof DeviceLoadingState, value: boolean) => {
      setLoading((prev) => ({ ...prev, [device]: value }));
    },
    [],
  );

  const toggleFan = useCallback(async () => {
    const newState = !fanOn;
    setFanOn(newState);
    setDeviceLoading("fan", true);
    setError(null);

    try {
      await deviceApi.controlFan(newState ? "turnOn" : "turnOff");
    } catch (err) {
      setFanOn(!newState);
      setError("Failed to control fan");
      console.error(err);
    } finally {
      setDeviceLoading("fan", false);
    }
  }, [fanOn, setFanOn, setDeviceLoading]);

  const toggleWindow = useCallback(async () => {
    const newState = !windowOpen;
    setWindowOpen(newState);
    setDeviceLoading("window", true);
    setError(null);

    try {
      await deviceApi.controlWindow(newState ? "turnOn" : "turnOff");
    } catch (err) {
      setWindowOpen(!newState);
      setError("Failed to control window");
      console.error(err);
    } finally {
      setDeviceLoading("window", false);
    }
  }, [windowOpen, setWindowOpen, setDeviceLoading]);

  const toggleAc = useCallback(async () => {
    const newState = !acOn;
    setAcOn(newState);
    setDeviceLoading("ac", true);
    setError(null);

    try {
      await deviceApi.controlAc(newState ? "turnOn" : "turnOff");
    } catch (err) {
      setAcOn(!newState);
      setError("Failed to control AC");
      console.error(err);
    } finally {
      setDeviceLoading("ac", false);
    }
  }, [acOn, setAcOn, setDeviceLoading]);

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

  const setAc = useCallback(
    (on: boolean) => {
      setAcOn(on);
    },
    [setAcOn],
  );

  return {
    fanOn,
    windowOpen,
    acOn,
    loading,
    error,
    toggleFan,
    toggleWindow,
    toggleAc,
    setFan,
    setWindow,
    setAc,
  };
};

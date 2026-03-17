import { useState, useCallback } from "react";
import { useDeviceStore } from "../store";
import { deviceApi } from "../services";

export const useDeviceControl = () => {
  const {
    fanOn,
    lightOn,
    acOn,
    acTemp,
    setFanOn,
    setLightOn,
    setAcOn,
    setAcTemp,
  } = useDeviceStore();
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

  const toggleLight = useCallback(async () => {
    try {
      setLoading(true);
      const newState = !lightOn;
      await deviceApi.control("light", newState ? "turnOn" : "turnOff");
      setLightOn(newState);
    } catch (err) {
      setError("Failed to control light");
      console.error(err);
      // Update local state anyway for demo purposes
      setLightOn(!lightOn);
    } finally {
      setLoading(false);
    }
  }, [lightOn, setLightOn]);

  const toggleAc = useCallback(async () => {
    try {
      setLoading(true);
      const newState = !acOn;
      await deviceApi.control("ac", newState ? "turnOn" : "turnOff");
      setAcOn(newState);
    } catch (err) {
      setError("Failed to control AC");
      console.error(err);
      // Update local state anyway for demo purposes
      setAcOn(!acOn);
    } finally {
      setLoading(false);
    }
  }, [acOn, setAcOn]);

  const changeAcTemp = useCallback(
    (temp: number) => {
      setAcTemp(temp);
    },
    [setAcTemp],
  );

  const setFan = useCallback(
    (on: boolean) => {
      setFanOn(on);
    },
    [setFanOn],
  );

  return {
    fanOn,
    lightOn,
    acOn,
    acTemp,
    loading,
    error,
    toggleFan,
    toggleLight,
    toggleAc,
    changeAcTemp,
    setFan,
  };
};

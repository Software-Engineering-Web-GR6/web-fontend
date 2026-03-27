import { useCallback, useState } from "react";
import { useDeviceStore } from "../store";
import { deviceApi } from "../services";
import type { Device, DeviceType } from "../types";

export const useDeviceControl = (roomId: number = 1) => {
  const {
    devices,
    fanOn,
    lightOn,
    acOn,
    acTemp,
    syncDevices,
    setFanOn,
    setLightOn,
    setAcOn,
    setAcTemp,
    setLastUpdated,
  } = useDeviceStore();
  const [loading, setLoading] = useState(false);
  const [loadingTarget, setLoadingTarget] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshRoomDevices = useCallback(async () => {
    const latestDevices = await deviceApi.getAll(roomId);
    syncDevices(latestDevices);
    setLastUpdated(latestDevices[0]?.lastUpdated ?? new Date().toISOString());
    return latestDevices;
  }, [roomId, setLastUpdated, syncDevices]);

  const toggleFan = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      setLoadingTarget("fan");
      await deviceApi.controlFan(fanOn ? "turnOff" : "turnOn", roomId);
      const latestDevices = await refreshRoomDevices();
      setFanOn(latestDevices.some((device) => device.type === "fan" && device.status));
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Không thể điều khiển quạt");
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingTarget(null);
    }
  }, [fanOn, refreshRoomDevices, roomId, setFanOn]);

  const toggleLight = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      setLoadingTarget("light");
      await deviceApi.controlGroup("light", lightOn ? "turnOff" : "turnOn", roomId);
      const latestDevices = await refreshRoomDevices();
      setLightOn(latestDevices.some((device) => device.type === "light" && device.status));
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Không thể điều khiển đèn");
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingTarget(null);
    }
  }, [lightOn, refreshRoomDevices, roomId, setLightOn]);

  const toggleAc = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      setLoadingTarget("ac");
      await deviceApi.controlGroup("ac", acOn ? "turnOff" : "turnOn", roomId);
      const latestDevices = await refreshRoomDevices();
      setAcOn(latestDevices.some((device) => device.type === "ac" && device.status));
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Không thể điều khiển điều hòa");
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingTarget(null);
    }
  }, [acOn, refreshRoomDevices, roomId, setAcOn]);

  const toggleDevice = useCallback(
    async (deviceType: DeviceType, index: number, nextStatus: boolean): Promise<Device | null> => {
      try {
        setError(null);
        setLoading(true);
        setLoadingTarget(`${deviceType}-${index}`);
        await deviceApi.controlByTypeAndIndex(
          deviceType,
          index,
          nextStatus ? "turnOn" : "turnOff",
          roomId,
        );
        const latestDevices = await refreshRoomDevices();
        return latestDevices.find((device) => device.type === deviceType && device.index === index) ?? null;
      } catch (err: any) {
        setError(err?.response?.data?.detail || "Không thể điều khiển thiết bị");
        console.error(err);
        return null;
      } finally {
        setLoading(false);
        setLoadingTarget(null);
      }
    },
    [refreshRoomDevices, roomId],
  );

  const changeAcTemp = useCallback(
    async (temp: number) => {
      try {
        setError(null);
        setLoading(true);
        setLoadingTarget("ac-temp");
        const latestDevices = await deviceApi.getAll(roomId);
        const acDevices = latestDevices.filter((device) => device.type === "ac");
        await Promise.all(
          acDevices.map((device) => deviceApi.updateAcTemperature(device.id, temp)),
        );
        const refreshed = await refreshRoomDevices();
        setAcTemp(refreshed.find((device) => device.type === "ac")?.targetTemp ?? temp);
      } catch (err: any) {
        setError(err?.response?.data?.detail || "Không thể cập nhật nhiệt độ điều hòa");
        console.error(err);
      } finally {
        setLoading(false);
        setLoadingTarget(null);
      }
    },
    [refreshRoomDevices, roomId, setAcTemp],
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
    devices,
    loading,
    loadingTarget,
    error,
    toggleFan,
    toggleLight,
    toggleAc,
    toggleDevice,
    changeAcTemp,
    setFan,
  };
};

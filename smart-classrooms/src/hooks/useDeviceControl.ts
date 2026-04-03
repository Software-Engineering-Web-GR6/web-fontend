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
    updateDevice,
    setFanOn,
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

  const mergeUpdatedDevices = useCallback(
    (updatedDevices: Device[]) => {
      if (updatedDevices.length === 0) {
        return;
      }

      const updatedById = new Map(updatedDevices.map((device) => [device.id, device]));
      const nextDevices = devices.map((device) => updatedById.get(device.id) ?? device);

      syncDevices(nextDevices);
      setLastUpdated(
        updatedDevices.reduce(
          (latest, device) => (device.lastUpdated > latest ? device.lastUpdated : latest),
          updatedDevices[0].lastUpdated,
        ),
      );
    },
    [devices, setLastUpdated, syncDevices],
  );

  const toggleGroup = useCallback(
    async (deviceType: DeviceType, nextStatus: boolean, loadingKey: string, fallbackError: string) => {
      const targets = devices.filter((device) => device.type === deviceType);
      const previousTargets = targets.map((device) => ({ ...device }));

      try {
        setError(null);
        setLoading(true);
        setLoadingTarget(loadingKey);

        const optimisticTime = new Date().toISOString();
        previousTargets.forEach((device) =>
          updateDevice({
            ...device,
            status: nextStatus,
            lastUpdated: optimisticTime,
          }),
        );

        const updatedDevices = await Promise.all(
          targets.map((device) => deviceApi.controlOne(device.id, nextStatus ? "turnOn" : "turnOff")),
        );
        mergeUpdatedDevices(updatedDevices);
      } catch (err: any) {
        previousTargets.forEach((device) => updateDevice(device));
        setError(err?.response?.data?.detail || fallbackError);
        console.error(err);
      } finally {
        setLoading(false);
        setLoadingTarget(null);
      }
    },
    [devices, mergeUpdatedDevices, updateDevice],
  );

  const toggleFan = useCallback(async () => {
    await toggleGroup("fan", !fanOn, "fan", "Không thể điều khiển quạt");
  }, [fanOn, toggleGroup]);

  const toggleLight = useCallback(async () => {
    await toggleGroup("light", !lightOn, "light", "Không thể điều khiển đèn");
  }, [lightOn, toggleGroup]);

  const toggleAc = useCallback(async () => {
    await toggleGroup("ac", !acOn, "ac", "Không thể điều khiển điều hòa");
  }, [acOn, toggleGroup]);

  const toggleDevice = useCallback(
    async (deviceType: DeviceType, index: number, nextStatus: boolean): Promise<Device | null> => {
      const target = devices.find((device) => device.type === deviceType && device.index === index);

      try {
        setError(null);
        setLoading(true);
        setLoadingTarget(`${deviceType}-${index}`);

        if (!target) {
          return await deviceApi.controlByTypeAndIndex(
            deviceType,
            index,
            nextStatus ? "turnOn" : "turnOff",
            roomId,
          );
        }

        updateDevice({
          ...target,
          status: nextStatus,
          lastUpdated: new Date().toISOString(),
        });

        const updated = await deviceApi.controlOne(target.id, nextStatus ? "turnOn" : "turnOff");
        updateDevice(updated);
        return updated;
      } catch (err: any) {
        if (target) {
          updateDevice(target);
        }
        setError(err?.response?.data?.detail || "Không thể điều khiển thiết bị");
        console.error(err);
        return null;
      } finally {
        setLoading(false);
        setLoadingTarget(null);
      }
    },
    [devices, roomId, updateDevice],
  );

  const changeAcTemp = useCallback(
    async (temp: number) => {
      let previousDevices: Device[] = [];

      try {
        setError(null);
        setLoading(true);
        setLoadingTarget("ac-temp");

        let acDevices = devices.filter((device) => device.type === "ac");
        if (acDevices.length === 0) {
          acDevices = (await deviceApi.getAll(roomId)).filter((device) => device.type === "ac");
        }

        previousDevices = acDevices.map((device) => ({ ...device }));
        const optimisticTime = new Date().toISOString();

        previousDevices.forEach((device) =>
          updateDevice({
            ...device,
            targetTemp: temp,
            lastUpdated: optimisticTime,
          }),
        );

        const updatedDevices = await Promise.all(
          acDevices.map((device) => deviceApi.updateAcTemperature(device.id, temp)),
        );
        mergeUpdatedDevices(updatedDevices);
        setAcTemp(updatedDevices[0]?.targetTemp ?? temp);
      } catch (err: any) {
        previousDevices.forEach((device) => updateDevice(device));
        setError(err?.response?.data?.detail || "Không thể cập nhật nhiệt độ điều hòa");
        console.error(err);
      } finally {
        setLoading(false);
        setLoadingTarget(null);
      }
    },
    [devices, mergeUpdatedDevices, roomId, setAcTemp, updateDevice],
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
    refreshRoomDevices,
  };
};

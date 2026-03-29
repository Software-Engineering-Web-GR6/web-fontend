import { useCallback, useEffect } from "react";
import { useAlertStore } from "../store";
import { useDeviceStore } from "../store";
import { useSensorStore } from "../store";
import { useThresholdStore } from "../store";
import { deviceApi, sensorApi, socketService } from "../services";
import type { SensorData, SensorHistory } from "../types";
import { createAlert, getAlertLevel, isWithinThresholds } from "../utils";

export const useSensor = (roomId: number | null = 1) => {
  const {
    temp,
    humidity,
    co2,
    history,
    isConnected,
    setSensorData,
    setHistory,
    addHistory,
    reset,
    setConnected,
  } = useSensorStore();
  const { syncDevices } = useDeviceStore();
  const { addAlert } = useAlertStore();
  const threshold = useThresholdStore();

  const handleSensorData = useCallback(
    (data: SensorData) => {
      setSensorData(data);

      const historyItem: SensorHistory = {
        id: `sensor-${Date.now()}`,
        temp: data.temp,
        humidity: data.humidity,
        co2: data.co2,
        timestamp: data.timestamp,
      };
      addHistory(historyItem);

      const { valid, issues } = isWithinThresholds(
        data.temp,
        data.humidity,
        threshold,
      );
      if (!valid) {
        const alertLevel = getAlertLevel(data.temp, data.humidity, threshold);
        if (alertLevel) {
          addAlert(createAlert(alertLevel, "temperature", issues.join(", ")));
        }
      }
    },
    [addAlert, addHistory, setSensorData, threshold],
  );

  const syncLatestSensorData = useCallback(
    (data: SensorData) => {
      setSensorData(data);

      const { valid, issues } = isWithinThresholds(
        data.temp,
        data.humidity,
        threshold,
      );

      if (!valid) {
        const alertLevel = getAlertLevel(data.temp, data.humidity, threshold);
        if (alertLevel) {
          addAlert(createAlert(alertLevel, "temperature", issues.join(", ")));
        }
      }
    },
    [addAlert, setSensorData, threshold],
  );

  useEffect(() => {
    let isMounted = true;
    reset();

    if (roomId == null) {
      setConnected(false);
      syncDevices([]);
      setHistory([]);
      return () => {
        isMounted = false;
        setConnected(false);
      };
    }

    const fetchRoomData = async () => {
      try {
        const [latest, historyData, devices] = await Promise.all([
          sensorApi.getCurrent(roomId),
          sensorApi.getHistory(roomId, 10),
          deviceApi.getAll(roomId),
        ]);

        if (!isMounted) {
          return;
        }

        setHistory(historyData);
        syncDevices(devices);
        syncLatestSensorData(latest);
      } catch (error) {
        console.error("Failed to fetch room data", error);
      }
    };

    socketService.connect();
    setConnected(socketService.isConnected());

    const unsubscribe = socketService.onSensorData((data) => {
      if (isMounted && (!data.roomId || data.roomId === roomId)) {
        handleSensorData(data);
      }
    });

    const pollInterval = setInterval(fetchRoomData, 5000);
    const connectionInterval = setInterval(() => {
      if (isMounted) {
        setConnected(socketService.isConnected());
      }
    }, 1000);

    fetchRoomData();

    return () => {
      isMounted = false;
      unsubscribe();
      clearInterval(pollInterval);
      clearInterval(connectionInterval);
      setConnected(false);
    };
  }, [
    handleSensorData,
    reset,
    roomId,
    setConnected,
    setHistory,
    syncLatestSensorData,
    syncDevices,
  ]);

  return {
    temp,
    humidity,
    co2,
    history,
    isConnected,
  };
};

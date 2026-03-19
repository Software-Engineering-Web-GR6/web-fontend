import { useEffect, useCallback } from "react";
import { useSensorStore } from "../store";
import { useAlertStore } from "../store";
import { useThresholdStore } from "../store";
import { sensorApi, socketService } from "../services";
import type { SensorData, SensorHistory } from "../types";
import { getAlertLevel, createAlert, isWithinThresholds } from "../utils";

export const useSensor = () => {
  const {
    temp,
    humidity,
    co2,
    history,
    isConnected,
    setSensorData,
    addHistory,
    setConnected,
  } = useSensorStore();
  const { addAlert } = useAlertStore();
  const threshold = useThresholdStore();

  // Handle incoming sensor data
  const handleSensorData = useCallback(
    (data: SensorData) => {
      setSensorData(data);

      // Add to history
      const historyItem: SensorHistory = {
        id: `sensor-${Date.now()}`,
        temp: data.temp,
        humidity: data.humidity,
        co2: data.co2,
        timestamp: data.timestamp,
      };
      addHistory(historyItem);

      // Check thresholds and create alerts if needed
      const { valid, issues } = isWithinThresholds(
        data.temp,
        data.humidity,
        threshold,
      );
      if (!valid) {
        const alertLevel = getAlertLevel(data.temp, data.humidity, threshold);
        if (alertLevel) {
          const message = issues.join(", ");
          const alert = createAlert(alertLevel, "temperature", message);
          addAlert(alert);
        }
      }
    },
    [setSensorData, addHistory, addAlert, threshold],
  );

  // Connect to socket on mount
  useEffect(() => {
    let isMounted = true;

    const fetchLatest = async () => {
      try {
        const latest = await sensorApi.getCurrent(1);
        if (!isMounted) {
          return;
        }
        handleSensorData({
          temp: latest.temp,
          humidity: latest.humidity,
          co2: latest.co2,
          timestamp: latest.timestamp,
        });
      } catch (error) {
        console.error("Failed to fetch latest sensor data", error);
      }
    };

    socketService.connect();
    setConnected(socketService.isConnected());

    const unsubscribe = socketService.onSensorData(handleSensorData);
    const pollInterval = setInterval(fetchLatest, 5000);
    const connectionInterval = setInterval(() => {
      if (isMounted) {
        setConnected(socketService.isConnected());
      }
    }, 1000);

    fetchLatest();

    // fallback simulated values when backend has no data yet
    const simulationInterval = setInterval(() => {
      if (isMounted && history.length === 0) {
        const simulatedData: SensorData = {
          temp: 22 + Math.random() * 10,
          humidity: 50 + Math.random() * 30,
          co2: 650 + Math.random() * 500,
          timestamp: new Date().toISOString(),
        };
        handleSensorData(simulatedData);
      }
    }, 7000);

    return () => {
      isMounted = false;
      unsubscribe();
      clearInterval(pollInterval);
      clearInterval(connectionInterval);
      clearInterval(simulationInterval);
      setConnected(false);
    };
  }, [handleSensorData, history.length, setConnected]);

  return {
    temp,
    humidity,
    co2,
    history,
    isConnected,
  };
};

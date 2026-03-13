import { useEffect, useCallback } from "react";
import { useSensorStore } from "../store";
import { useAlertStore } from "../store";
import { useThresholdStore } from "../store";
import { socketService } from "../services";
import type { SensorData, SensorHistory } from "../types";
import { getAlertLevel, createAlert, isWithinThresholds } from "../utils";

export const useSensor = () => {
  const {
    temp,
    humidity,
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
    socketService.connect();
    setConnected(true);

    const unsubscribe = socketService.onSensorData(handleSensorData);

    // For demo purposes, simulate sensor data if not connected to real server
    const simulationInterval = setInterval(() => {
      if (!isConnected) {
        const simulatedData: SensorData = {
          temp: 22 + Math.random() * 10,
          humidity: 50 + Math.random() * 30,
          timestamp: new Date().toISOString(),
        };
        handleSensorData(simulatedData);
      }
    }, 5000);

    return () => {
      unsubscribe();
      clearInterval(simulationInterval);
      setConnected(false);
    };
  }, [handleSensorData, isConnected, setConnected]);

  return {
    temp,
    humidity,
    history,
    isConnected,
  };
};

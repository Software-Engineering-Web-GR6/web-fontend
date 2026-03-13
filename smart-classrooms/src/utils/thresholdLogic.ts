import type { Threshold, Alert } from "../types";
import type { AlertLevel, AlertType } from "../types/alert";

// Calculate comfort index based on temperature and humidity
export const calculateComfortIndex = (
  temp: number,
  humidity: number,
): {
  level: "comfortable" | "too_hot" | "too_cold" | "too_humid" | "too_dry";
  value: number;
} => {
  // Simplified comfort index calculation
  // Optimal: temp 20-26°C, humidity 40-60%

  let score = 100;
  let level: "comfortable" | "too_hot" | "too_cold" | "too_humid" | "too_dry" =
    "comfortable";

  // Temperature deviation
  if (temp > 26) {
    score -= (temp - 26) * 5;
    level = "too_hot";
  } else if (temp < 20) {
    score -= (20 - temp) * 5;
    level = "too_cold";
  }

  // Humidity deviation
  if (humidity > 60) {
    score -= (humidity - 60) * 2;
    if (level === "comfortable") level = "too_humid";
  } else if (humidity < 40) {
    score -= (40 - humidity) * 2;
    if (level === "comfortable") level = "too_dry";
  }

  return {
    level: score >= 70 ? "comfortable" : level,
    value: Math.max(0, Math.min(100, score)),
  };
};

// Check if temperature is within threshold
export const isTempInRange = (temp: number, threshold: Threshold): boolean => {
  return temp >= threshold.tempMin && temp <= threshold.tempMax;
};

// Check if humidity is within threshold
export const isHumidityInRange = (
  humidity: number,
  threshold: Threshold,
): boolean => {
  return humidity >= threshold.humidityMin && humidity <= threshold.humidityMax;
};

// Check if sensor data is within all thresholds
export const isWithinThresholds = (
  temp: number,
  humidity: number,
  threshold: Threshold,
): { valid: boolean; issues: string[] } => {
  const issues: string[] = [];

  if (temp > threshold.tempMax) {
    issues.push(`Nhiệt độ cao hơn ngưỡng cho phép (${threshold.tempMax}°C)`);
  } else if (temp < threshold.tempMin) {
    issues.push(`Nhiệt độ thấp hơn ngưỡng cho phép (${threshold.tempMin}°C)`);
  }

  if (humidity > threshold.humidityMax) {
    issues.push(`Độ ẩm cao hơn ngưỡng cho phép (${threshold.humidityMax}%)`);
  } else if (humidity < threshold.humidityMin) {
    issues.push(`Độ ẩm thấp hơn ngưỡng cho phép (${threshold.humidityMin}%)`);
  }

  return {
    valid: issues.length === 0,
    issues,
  };
};

// Determine alert level based on deviation from threshold
export const getAlertLevel = (
  temp: number,
  humidity: number,
  threshold: Threshold,
): AlertLevel | null => {
  const tempDeviation = Math.max(
    temp - threshold.tempMax,
    threshold.tempMin - temp,
    0,
  );
  const humidityDeviation = Math.max(
    humidity - threshold.humidityMax,
    threshold.humidityMin - humidity,
    0,
  );

  const maxDeviation = Math.max(tempDeviation, humidityDeviation);

  if (maxDeviation >= 10) return "critical";
  if (maxDeviation >= 5) return "warning";
  if (maxDeviation > 0) return "info";

  return null;
};

// Generate alert message based on threshold violation
export const generateAlertMessage = (
  type: AlertType,
  value: number,
  threshold: Threshold,
): string => {
  switch (type) {
    case "temperature":
      if (value > threshold.tempMax) {
        return `Nhiệt độ cao: ${value.toFixed(1)}°C (ngưỡng tối đa: ${threshold.tempMax}°C)`;
      }
      return `Nhiệt độ thấp: ${value.toFixed(1)}°C (ngưỡng tối thiểu: ${threshold.tempMin}°C)`;
    case "humidity":
      if (value > threshold.humidityMax) {
        return `Độ ẩm cao: ${value.toFixed(1)}% (ngưỡng tối đa: ${threshold.humidityMax}%)`;
      }
      return `Độ ẩm thấp: ${value.toFixed(1)}% (ngưỡng tối thiểu: ${threshold.humidityMin}%)`;
    default:
      return "Cảnh báo hệ thống";
  }
};

// Create new alert object
export const createAlert = (
  level: AlertLevel,
  type: AlertType,
  message: string,
): Alert => {
  return {
    id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    level,
    type,
    message,
    timestamp: new Date().toISOString(),
    read: false,
  };
};

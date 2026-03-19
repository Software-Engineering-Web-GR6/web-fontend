import type { Threshold, Alert } from "../types";
import type { AlertLevel, AlertType } from "../types/alert";

export type ComfortLevel =
  | "comfortable"
  | "too_hot"
  | "too_cold"
  | "too_humid"
  | "too_dry"
  | "too_stale";

// Calculate comfort index based on temperature and humidity
export const calculateComfortIndex = (
  temp: number,
  humidity: number,
): {
  level: ComfortLevel;
  value: number;
} => {
  // Simplified comfort index calculation
  // Optimal: temp 20-26°C, humidity 40-60%

  let score = 100;
  let level: ComfortLevel = "comfortable";

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

export const calculateComfortIndexV2 = (
  temp: number,
  humidity: number,
  co2: number,
): {
  level: ComfortLevel;
  value: number;
  breakdown: {
    thermalScore: number;
    co2Score: number;
    temperatureScore: number;
    humidityScore: number;
  };
} => {
  const temperaturePenalty = temp > 26 ? (temp - 26) * 6 : temp < 20 ? (20 - temp) * 6 : 0;
  const humidityPenalty =
    humidity > 60 ? (humidity - 60) * 2 : humidity < 40 ? (40 - humidity) * 2 : 0;

  const temperatureScore = clamp(100 - temperaturePenalty, 0, 100);
  const humidityScore = clamp(100 - humidityPenalty, 0, 100);

  const thermalScore = clamp(
    Math.round(temperatureScore * 0.65 + humidityScore * 0.35),
    0,
    100,
  );

  const co2Score = calculateCo2Score(co2);

  const value = clamp(Math.round(thermalScore * 0.7 + co2Score * 0.3), 0, 100);

  let level: ComfortLevel = "comfortable";
  if (co2 > 1400) {
    level = "too_stale";
  } else if (temp > 26) {
    level = "too_hot";
  } else if (temp < 20) {
    level = "too_cold";
  } else if (humidity > 60) {
    level = "too_humid";
  } else if (humidity < 40) {
    level = "too_dry";
  }

  if (
    value >= 75 &&
    temp >= 20 &&
    temp <= 26 &&
    humidity >= 40 &&
    humidity <= 60 &&
    co2 <= 1000
  ) {
    level = "comfortable";
  }

  return {
    level,
    value,
    breakdown: {
      thermalScore,
      co2Score,
      temperatureScore: Math.round(temperatureScore),
      humidityScore: Math.round(humidityScore),
    },
  };
};

const calculateCo2Score = (co2: number): number => {
  if (co2 <= 800) {
    return 100;
  }
  if (co2 <= 1000) {
    return Math.round(100 - ((co2 - 800) / 200) * 15);
  }
  if (co2 <= 1400) {
    return Math.round(85 - ((co2 - 1000) / 400) * 35);
  }
  if (co2 <= 2000) {
    return Math.round(50 - ((co2 - 1400) / 600) * 40);
  }
  return 10;
};

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

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

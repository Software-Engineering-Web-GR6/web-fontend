import type { ThresholdConfig } from '../types/threshold';

export type SensorStatus = 'normal' | 'warning' | 'danger';

export function getTemperatureStatus(temp: number, thresholds: ThresholdConfig): SensorStatus {
  if (temp > thresholds.maxTemperature || temp < thresholds.minTemperature) {
    return 'danger';
  }
  const warningMargin = (thresholds.maxTemperature - thresholds.minTemperature) * 0.1;
  if (
    temp > thresholds.maxTemperature - warningMargin ||
    temp < thresholds.minTemperature + warningMargin
  ) {
    return 'warning';
  }
  return 'normal';
}

export function getHumidityStatus(humidity: number, thresholds: ThresholdConfig): SensorStatus {
  if (humidity > thresholds.maxHumidity || humidity < thresholds.minHumidity) {
    return 'danger';
  }
  const warningMargin = (thresholds.maxHumidity - thresholds.minHumidity) * 0.1;
  if (
    humidity > thresholds.maxHumidity - warningMargin ||
    humidity < thresholds.minHumidity + warningMargin
  ) {
    return 'warning';
  }
  return 'normal';
}

export function computeComfortIndex(temp: number, humidity: number): number {
  // Heat Index approximation
  return Math.round(temp - 0.55 * (1 - humidity / 100) * (temp - 14.5));
}

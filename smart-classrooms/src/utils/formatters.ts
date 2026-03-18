export function formatTemperature(value: number): string {
  return `${value.toFixed(1)}°C`;
}

export function formatHumidity(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('vi-VN');
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('vi-VN');
}

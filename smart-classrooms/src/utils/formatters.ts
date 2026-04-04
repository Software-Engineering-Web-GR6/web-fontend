const TIMESTAMP_HAS_TIMEZONE_REGEX = /(Z|[+-]\d{2}:\d{2})$/i;

export const normalizeTimestamp = (timestamp: string): string => {
  const value = timestamp.trim();
  if (!value) {
    return timestamp;
  }

  return TIMESTAMP_HAS_TIMEZONE_REGEX.test(value) ? value : `${value}Z`;
};

const parseTimestamp = (timestamp: string): Date => {
  return new Date(normalizeTimestamp(timestamp));
};

// Format timestamp to readable date
export const formatDate = (timestamp: string): string => {
  const date = parseTimestamp(timestamp);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Format timestamp to readable time
export const formatTime = (timestamp: string): string => {
  const date = parseTimestamp(timestamp);
  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Format timestamp to full datetime
export const formatDateTime = (timestamp: string): string => {
  const date = parseTimestamp(timestamp);
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Format temperature
export const formatTemp = (temp: number): string => {
  return `${temp.toFixed(1)}°C`;
};

// Format humidity
export const formatHumidity = (humidity: number): string => {
  return `${humidity.toFixed(1)}%`;
};

// Format relative time
export const formatRelativeTime = (timestamp: string): string => {
  const now = new Date();
  const date = parseTimestamp(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Vừa xong";
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return formatDate(timestamp);
};

// Format chart axis label
export const formatChartTime = (timestamp: string): string => {
  const date = parseTimestamp(timestamp);
  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

export const buildThirtySecondStepLabels = (count: number, endTimestamp?: string): string[] => {
  const end = endTimestamp ? parseTimestamp(endTimestamp) : new Date();
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(end);
    date.setSeconds(end.getSeconds() - (count - 1 - index) * 30);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  });
};

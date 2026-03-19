// Constants
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";
export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "ws://localhost:8000/ws/alerts";

// Sensor Constants
export const DEFAULT_TEMP = 25;
export const DEFAULT_HUMIDITY = 60;
export const HISTORY_LIMIT = 50;

// Comfort Index Constants
export const COMFORT_TEMP_MIN = 20;
export const COMFORT_TEMP_MAX = 26;
export const COMFORT_HUMIDITY_MIN = 40;
export const COMFORT_HUMIDITY_MAX = 60;

// UI Constants
export const SIDEBAR_WIDTH = "280px";
export const HEADER_HEIGHT = "64px";

// Chart Colors
export const CHART_COLORS = {
  temp: "#f97316",
  humidity: "#3b82f6",
  primary: "#6366f1",
  success: "#22c55e",
  warning: "#eab308",
  danger: "#ef4444",
};

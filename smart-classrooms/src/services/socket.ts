import { SOCKET_URL } from "../utils/constants";
import type { SensorData } from "../types";
import { normalizeTimestamp } from "../utils/formatters";

class SocketService {
  private socket: WebSocket | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  connect(): void {
    if (
      this.socket &&
      (this.socket.readyState === WebSocket.OPEN ||
        this.socket.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    const wsUrl = SOCKET_URL.startsWith("ws")
      ? SOCKET_URL
      : SOCKET_URL.replace(/^http/, "ws");

    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      console.log("WebSocket connected");
    };

    this.socket.onclose = () => {
      console.log("WebSocket disconnected");
      this.socket = null;
    };

    this.socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    this.socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (
          payload?.event === "new_alert" ||
          payload?.event === "resolved_alert"
        ) {
          this.notifyListeners("alertEvent", payload);
        }
        const sensorData = mapMessageToSensorData(payload);
        if (sensorData) {
          this.notifyListeners("sensorData", sensorData);
        }
      } catch {
        // ignore non-json payloads
      }
    };
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.listeners.clear();
  }

  onSensorData(callback: (data: SensorData) => void): () => void {
    return this.subscribe("sensorData", callback);
  }

  onAlertEvent(
    callback: (data: { event: string; alert: Record<string, unknown> }) => void,
  ): () => void {
    return this.subscribe("alertEvent", callback);
  }

  private subscribe(
    event: string,
    callback: (data: any) => void,
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  private notifyListeners(event: string, data: any): void {
    this.listeners.get(event)?.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in socket listener for ${event}:`, error);
      }
    });
  }

  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }
}

export const socketService = new SocketService();
export default socketService;

function mapMessageToSensorData(payload: unknown): SensorData | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const data = payload as Record<string, unknown>;

  if (data.event === "sensor_reading" && data.reading && typeof data.reading === "object") {
    const reading = data.reading as Record<string, unknown>;
    if (
      typeof reading.temperature === "number" &&
      typeof reading.humidity === "number"
    ) {
      return {
        roomId: typeof reading.room_id === "number" ? reading.room_id : undefined,
        temp: reading.temperature,
        humidity: reading.humidity,
        co2: typeof reading.co2 === "number" ? reading.co2 : 800,
        timestamp:
          typeof reading.recorded_at === "string"
            ? normalizeTimestamp(reading.recorded_at)
            : new Date().toISOString(),
      };
    }
  }

  if (typeof data.temp === "number" && typeof data.humidity === "number") {
    return {
      temp: data.temp,
      humidity: data.humidity,
      co2: typeof data.co2 === "number" ? data.co2 : 800,
      timestamp:
        typeof data.timestamp === "string"
          ? normalizeTimestamp(data.timestamp)
          : new Date().toISOString(),
    };
  }

  if (typeof data.temperature === "number" && typeof data.humidity === "number") {
    return {
      temp: data.temperature,
      humidity: data.humidity,
      co2: typeof data.co2 === "number" ? data.co2 : 800,
      timestamp:
        typeof data.recorded_at === "string"
          ? normalizeTimestamp(data.recorded_at)
          : new Date().toISOString(),
    };
  }

  return null;
}

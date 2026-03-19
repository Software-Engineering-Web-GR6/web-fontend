import { SOCKET_URL } from "../utils/constants";
import type { SensorData } from "../types";

class SocketService {
  private socket: WebSocket | null = null;
  private listeners: Map<string, Set<(data: SensorData) => void>> = new Map();

  connect(): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
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
    };

    this.socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    this.socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
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

  private subscribe(
    event: string,
    callback: (data: SensorData) => void,
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  private notifyListeners(event: string, data: SensorData): void {
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

  if (typeof data.temp === "number" && typeof data.humidity === "number") {
    return {
      temp: data.temp,
      humidity: data.humidity,
      co2: typeof data.co2 === "number" ? data.co2 : 800,
      timestamp:
        typeof data.timestamp === "string"
          ? data.timestamp
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
          ? data.recorded_at
          : new Date().toISOString(),
    };
  }

  return null;
}

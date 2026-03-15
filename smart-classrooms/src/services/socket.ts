import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "../utils/constants";
import type { SensorData } from "../types";

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<(data: SensorData) => void>> = new Map();

  // Connect to socket server
  connect(): void {
    if (this.socket?.connected) return;

    this.socket = io(SOCKET_URL, {
      transports: ["websocket"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on("connect", () => {
      console.log("Socket connected:", this.socket?.id);
    });

    this.socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    this.socket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    // Listen for sensor data
    this.socket.on("sensorData", (data: SensorData) => {
      this.notifyListeners("sensorData", data);
    });
  }

  // Disconnect from socket server
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
  }

  // Subscribe to sensor data
  onSensorData(callback: (data: SensorData) => void): () => void {
    return this.subscribe("sensorData", callback);
  }

  // Subscribe to a specific event
  private subscribe(
    event: string,
    callback: (data: SensorData) => void,
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  // Notify all listeners for an event
  private notifyListeners(event: string, data: SensorData): void {
    this.listeners.get(event)?.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in socket listener for ${event}:`, error);
      }
    });
  }

  // Check if connected
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  // Get socket ID
  getSocketId(): string | undefined {
    return this.socket?.id;
  }
}

// Export singleton instance
export const socketService = new SocketService();
export default socketService;

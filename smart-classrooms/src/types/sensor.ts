// Sensor Types
export interface SensorData {
  temp: number;
  humidity: number;
  timestamp: string;
}

export interface SensorHistory {
  id: string;
  temp: number;
  humidity: number;
  timestamp: string;
}

export interface SensorState {
  temp: number;
  humidity: number;
  history: SensorHistory[];
  isConnected: boolean;
  setSensorData: (data: SensorData) => void;
  addHistory: (data: SensorHistory) => void;
  setConnected: (connected: boolean) => void;
}

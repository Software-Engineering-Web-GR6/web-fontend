// Sensor Types
export interface SensorData {
  temp: number;
  humidity: number;
  co2: number;
  timestamp: string;
}

export interface SensorHistory {
  id: string;
  temp: number;
  humidity: number;
  co2: number;
  timestamp: string;
}

export interface SensorState {
  temp: number;
  humidity: number;
  co2: number;
  history: SensorHistory[];
  isConnected: boolean;
  setSensorData: (data: SensorData) => void;
  addHistory: (data: SensorHistory) => void;
  setConnected: (connected: boolean) => void;
}

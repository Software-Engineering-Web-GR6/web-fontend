// Sensor Types
export interface SensorData {
  roomId?: number;
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
  setHistory: (history: SensorHistory[]) => void;
  addHistory: (data: SensorHistory) => void;
  reset: () => void;
  setConnected: (connected: boolean) => void;
}

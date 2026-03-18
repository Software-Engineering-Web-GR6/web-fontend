export interface SensorReading {
  roomId: string;
  temperature: number;
  humidity: number;
  timestamp: string;
}

export interface SensorHistory {
  roomId: string;
  readings: SensorReading[];
}

export type AlertType = 'high_temp' | 'high_humidity' | 'device_fault' | 'info';

export type AlertStatus = 'new' | 'acknowledged' | 'resolved';

export interface Alert {
  id: string;
  roomId: string;
  type: AlertType;
  message: string;
  status: AlertStatus;
  timestamp: string;
}

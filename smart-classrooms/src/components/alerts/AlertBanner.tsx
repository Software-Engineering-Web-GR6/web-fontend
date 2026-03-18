import type { Alert } from '../../types/alert';

interface AlertBannerProps {
  alert: Alert;
  onDismiss?: () => void;
}

const typeEmoji: Record<Alert['type'], string> = {
  high_temp: '🌡️',
  high_humidity: '💧',
  device_fault: '⚠️',
  info: 'ℹ️',
};

export function AlertBanner({ alert, onDismiss }: AlertBannerProps) {
  return (
    <div className="flex items-start gap-3 bg-red-50 border border-red-300 rounded-lg p-3">
      <span className="text-xl">{typeEmoji[alert.type]}</span>
      <div className="flex-1">
        <p className="text-sm font-medium text-red-800">{alert.message}</p>
        <p className="text-xs text-red-600">Phòng: {alert.roomId}</p>
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className="text-red-400 hover:text-red-600 text-lg leading-none">
          ×
        </button>
      )}
    </div>
  );
}

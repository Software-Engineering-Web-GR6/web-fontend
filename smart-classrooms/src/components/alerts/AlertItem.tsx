import type { Alert } from '../../types/alert';
import { Badge } from '../ui/Badge';
import { formatDateTime } from '../../utils/formatters';

interface AlertItemProps {
  alert: Alert;
  onAcknowledge?: () => void;
  onResolve?: () => void;
}

const statusColor: Record<Alert['status'], 'red' | 'yellow' | 'green'> = {
  new: 'red',
  acknowledged: 'yellow',
  resolved: 'green',
};

const statusLabel: Record<Alert['status'], string> = {
  new: 'Mới',
  acknowledged: 'Đã xem',
  resolved: 'Đã xử lý',
};

export function AlertItem({ alert, onAcknowledge, onResolve }: AlertItemProps) {
  return (
    <div className="flex items-start gap-3 p-3 border-b border-gray-100 last:border-0">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-gray-800">{alert.message}</span>
          <Badge label={statusLabel[alert.status]} color={statusColor[alert.status]} />
        </div>
        <p className="text-xs text-gray-500">
          Phòng {alert.roomId} · {formatDateTime(alert.timestamp)}
        </p>
      </div>
      <div className="flex gap-2">
        {alert.status === 'new' && onAcknowledge && (
          <button
            onClick={onAcknowledge}
            className="text-xs text-blue-600 hover:underline"
          >
            Xác nhận
          </button>
        )}
        {alert.status !== 'resolved' && onResolve && (
          <button
            onClick={onResolve}
            className="text-xs text-green-600 hover:underline"
          >
            Xử lý xong
          </button>
        )}
      </div>
    </div>
  );
}

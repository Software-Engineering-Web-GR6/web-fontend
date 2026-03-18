import { Card, CardHeader } from '../../components/ui/Card';
import { AlertItem } from '../../components/alerts/AlertItem';
import { demoAlerts } from '../../utils/demoData';

const ROOM_ID = 'A101';

export function UserAlerts() {
  const alerts = demoAlerts.filter((a) => a.roomId === ROOM_ID);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-800">Cảnh báo – Phòng {ROOM_ID}</h1>
      <Card>
        <CardHeader title="Danh sách cảnh báo" subtitle="Chỉ xem – không thể xử lý" />
        <div>
          {alerts.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center">Không có cảnh báo nào.</p>
          ) : (
            alerts.map((alert) => <AlertItem key={alert.id} alert={alert} />)
          )}
        </div>
      </Card>
    </div>
  );
}

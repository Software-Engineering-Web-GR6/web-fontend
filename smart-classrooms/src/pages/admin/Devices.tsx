import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { demoDevices } from '../../utils/demoData';

export function AdminDevices() {
  const devices = Object.values(demoDevices);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-800">Quản lý thiết bị</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {devices.map((device) => (
          <Card key={device.roomId}>
            <CardHeader
              title={`Phòng ${device.roomId}`}
              action={
                <Badge
                  label={device.manual ? 'Thủ công' : 'Tự động'}
                  color={device.manual ? 'yellow' : 'green'}
                />
              }
            />
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>🌀 Quạt:</span>
                <Badge
                  label={device.fanOn ? 'Đang chạy' : 'Tắt'}
                  color={device.fanOn ? 'blue' : 'gray'}
                />
              </div>
              <div className="flex justify-between">
                <span>🪟 Cửa sổ:</span>
                <Badge
                  label={device.windowOpen ? 'Mở' : 'Đóng'}
                  color={device.windowOpen ? 'blue' : 'gray'}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

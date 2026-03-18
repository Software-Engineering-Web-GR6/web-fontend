import { Card, CardHeader } from '../../components/ui/Card';
import { HistoryChart } from '../../components/charts/HistoryChart';
import { generateDemoReadings } from '../../utils/demoData';

const ROOM_ID = 'A101';

export function UserHistory() {
  const history = generateDemoReadings(ROOM_ID, 50);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-800">Lịch sử – Phòng {ROOM_ID}</h1>
      <Card>
        <CardHeader title="Biểu đồ lịch sử nhiệt độ & độ ẩm" subtitle="50 mẫu gần nhất" />
        <HistoryChart data={history} />
      </Card>
      <Card>
        <CardHeader title="Bảng dữ liệu" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-200">
                <th className="pb-2">Thời gian</th>
                <th className="pb-2">Nhiệt độ</th>
                <th className="pb-2">Độ ẩm</th>
              </tr>
            </thead>
            <tbody>
              {[...history].reverse().slice(0, 10).map((r, i) => (
                <tr key={i} className="border-b border-gray-100 last:border-0">
                  <td className="py-1.5 text-gray-600">
                    {new Date(r.timestamp).toLocaleString('vi-VN')}
                  </td>
                  <td className="py-1.5 text-red-600 font-medium">
                    {r.temperature.toFixed(1)}°C
                  </td>
                  <td className="py-1.5 text-blue-600 font-medium">
                    {r.humidity.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

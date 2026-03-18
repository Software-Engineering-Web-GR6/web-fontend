import { Card, CardHeader } from '../../components/ui/Card';
import { TempCard } from '../../components/sensors/TempCard';
import { HumidityCard } from '../../components/sensors/HumidityCard';
import { ComfortIndex } from '../../components/sensors/ComfortIndex';
import { TempLineChart } from '../../components/charts/TempLineChart';
import { HumidityChart } from '../../components/charts/HumidityChart';
import { getTemperatureStatus, getHumidityStatus } from '../../utils/thresholdLogic';
import { DEFAULT_THRESHOLDS } from '../../utils/constants';
import { generateDemoReadings } from '../../utils/demoData';

const ROOM_ID = 'A101';

export function UserDashboard() {
  const history = generateDemoReadings(ROOM_ID);
  const latest = history[history.length - 1];
  const thresholds = { ...DEFAULT_THRESHOLDS, roomId: ROOM_ID };
  const tempStatus = getTemperatureStatus(latest.temperature, thresholds);
  const humStatus = getHumidityStatus(latest.humidity, thresholds);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-800">Dashboard – Phòng {ROOM_ID}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TempCard roomId={ROOM_ID} temperature={latest.temperature} status={tempStatus} />
        <HumidityCard roomId={ROOM_ID} humidity={latest.humidity} status={humStatus} />
        <ComfortIndex temperature={latest.temperature} humidity={latest.humidity} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Biểu đồ nhiệt độ" subtitle={ROOM_ID} />
          <TempLineChart data={history} />
        </Card>
        <Card>
          <CardHeader title="Biểu đồ độ ẩm" subtitle={ROOM_ID} />
          <HumidityChart data={history} />
        </Card>
      </div>
    </div>
  );
}

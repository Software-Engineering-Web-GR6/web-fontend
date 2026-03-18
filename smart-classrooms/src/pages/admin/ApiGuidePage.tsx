/**
 * src/pages/admin/ApiGuidePage.tsx
 * ─────────────────────────────────
 * Trang hướng dẫn các file lấy dữ liệu real-time và gọi API.
 * Truy cập tại: /admin/api-guide
 */

interface FileEntry {
  path: string;
  type: 'service' | 'hook' | 'store';
  protocol: string;
  purpose: string;
  events?: string[];
  endpoints?: string[];
}

const files: FileEntry[] = [
  {
    path: 'src/services/api.ts',
    type: 'service',
    protocol: 'REST (Axios)',
    purpose: 'Khởi tạo Axios instance dùng chung cho toàn bộ ứng dụng. Đặt baseURL, timeout, header mặc định.',
    endpoints: ['Biến môi trường: VITE_API_URL=http://localhost:8000/api'],
  },
  {
    path: 'src/services/socket.ts',
    type: 'service',
    protocol: 'WebSocket (Socket.IO)',
    purpose: 'Khởi tạo Socket.IO client singleton. Kết nối đến backend và xử lý reconnect tự động.',
    events: ['room:subscribe → đăng ký nhận data của phòng', 'room:unsubscribe → hủy đăng ký'],
    endpoints: ['Biến môi trường: VITE_SOCKET_URL=http://localhost:8000'],
  },
  {
    path: 'src/services/sensorApi.ts',
    type: 'service',
    protocol: 'REST (Axios)',
    purpose: 'Gọi API lấy lịch sử và dữ liệu mới nhất của cảm biến.',
    endpoints: [
      'GET /sensors/:roomId/history → lịch sử chuỗi thời gian',
      'GET /sensors/:roomId/latest → bản đọc mới nhất',
    ],
  },
  {
    path: 'src/services/deviceApi.ts',
    type: 'service',
    protocol: 'REST (Axios)',
    purpose: 'Gọi API điều khiển thiết bị (quạt, cửa sổ).',
    endpoints: [
      'GET /devices/:roomId → trạng thái hiện tại',
      'POST /devices/command → gửi lệnh bật/tắt',
    ],
  },
  {
    path: 'src/services/thresholdApi.ts',
    type: 'service',
    protocol: 'REST (Axios)',
    purpose: 'Đọc và cập nhật cấu hình ngưỡng cảnh báo.',
    endpoints: [
      'GET /thresholds/:roomId → lấy ngưỡng hiện tại',
      'PUT /thresholds/:roomId → cập nhật ngưỡng',
    ],
  },
  {
    path: 'src/hooks/useSensor.ts',
    type: 'hook',
    protocol: 'WebSocket + REST',
    purpose: 'Kết hợp Socket.IO (cập nhật liên tục) và REST API (lịch sử ban đầu). Lưu dữ liệu vào sensorStore.',
    events: [
      '"sensor:update" ← server push dữ liệu cảm biến mới',
    ],
  },
  {
    path: 'src/hooks/useAlerts.ts',
    type: 'hook',
    protocol: 'WebSocket + REST',
    purpose: 'Tải cảnh báo cũ từ REST API khi mount, rồi lắng nghe cảnh báo mới qua WebSocket.',
    events: [
      '"alert:new" ← server thông báo cảnh báo mới',
    ],
  },
  {
    path: 'src/hooks/useDeviceControl.ts',
    type: 'hook',
    protocol: 'REST + WebSocket',
    purpose: 'Gửi lệnh điều khiển qua REST API và nhận cập nhật tự động (tự bật/tắt khi vượt ngưỡng) qua WebSocket.',
    events: [
      '"device:update" ← server cập nhật trạng thái thiết bị',
    ],
  },
  {
    path: 'src/hooks/useThresholds.ts',
    type: 'hook',
    protocol: 'REST',
    purpose: 'Đọc và lưu cấu hình ngưỡng cảnh báo. Lưu vào thresholdStore.',
    endpoints: [
      'GET /thresholds/:roomId (khi mount)',
      'PUT /thresholds/:roomId (khi lưu)',
    ],
  },
];

const typeColor: Record<FileEntry['type'], string> = {
  service: 'bg-blue-100 text-blue-800',
  hook: 'bg-green-100 text-green-800',
  store: 'bg-purple-100 text-purple-800',
};

const typeLabel: Record<FileEntry['type'], string> = {
  service: 'Service',
  hook: 'Hook',
  store: 'Store',
};

const protocolColor: Record<string, string> = {
  'REST (Axios)': 'bg-orange-50 border-orange-200',
  'WebSocket (Socket.IO)': 'bg-violet-50 border-violet-200',
  'WebSocket + REST': 'bg-teal-50 border-teal-200',
  'REST + WebSocket': 'bg-teal-50 border-teal-200',
  REST: 'bg-orange-50 border-orange-200',
};

export function ApiGuidePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-700 text-white rounded-lg p-5">
        <div className="flex items-start gap-4">
          <span className="text-4xl">🔌</span>
          <div>
            <h1 className="text-xl font-bold mb-1">Kết nối Real-time & API</h1>
            <p className="text-teal-100 text-sm leading-relaxed">
              Tổng hợp các file xử lý lấy dữ liệu real-time (WebSocket/Socket.IO) và gọi REST API.
              Khi backend sẵn sàng, chỉ cần thay dữ liệu demo bằng các hook tương ứng.
            </p>
          </div>
        </div>
      </div>

      {/* Architecture diagram */}
      <div className="bg-white rounded-lg shadow p-5">
        <h2 className="font-semibold text-gray-800 mb-4">Luồng dữ liệu</h2>
        <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-xs leading-relaxed overflow-x-auto">
          <pre>{`
  ┌──────────────────────────────────────────────────────┐
  │                  BACKEND  (FastAPI/Node.js)           │
  │   REST API  ──► GET/POST /api/...                     │
  │   Socket.IO ──► emit("sensor:update", data)           │
  │                 emit("alert:new", alert)               │
  │                 emit("device:update", state)          │
  └──────────────────────────────────────────────────────┘
            │ HTTP              │ WebSocket
            ▼                  ▼
  ┌────────────────────┐  ┌─────────────────────┐
  │  src/services/     │  │  src/services/       │
  │  api.ts (Axios)    │  │  socket.ts (Socket.IO│
  │  sensorApi.ts      │  │  singleton)           │
  │  deviceApi.ts      │  └─────────┬───────────┘
  │  thresholdApi.ts   │            │
  └────────┬───────────┘            │
           │                        │
           └──────────┬─────────────┘
                      ▼
  ┌──────────────────────────────────────────────────────┐
  │                 src/hooks/                            │
  │  useSensor.ts        → sensor:update + REST history   │
  │  useAlerts.ts        → alert:new + REST /alerts       │
  │  useDeviceControl.ts → device:update + REST command   │
  │  useThresholds.ts    → REST GET/PUT /thresholds       │
  └──────────────────────────┬───────────────────────────┘
                             │ setState
                             ▼
  ┌──────────────────────────────────────────────────────┐
  │                 src/store/ (Zustand)                  │
  │  sensorStore   deviceStore   alertStore   threshold   │
  └──────────────────────────┬───────────────────────────┘
                             │ read state
                             ▼
  ┌──────────────────────────────────────────────────────┐
  │              React Components / Pages                 │
  │  Dashboard, Alerts, Settings, Devices, ...            │
  └──────────────────────────────────────────────────────┘
`}</pre>
        </div>
      </div>

      {/* File list */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Danh sách file</h2>
        <div className="space-y-3">
          {files.map((f) => (
            <div
              key={f.path}
              className={`rounded-lg border p-4 ${protocolColor[f.protocol] ?? 'bg-gray-50 border-gray-200'}`}
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <code className="text-sm font-bold text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-300">
                    {f.path}
                  </code>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColor[f.type]}`}>
                    {typeLabel[f.type]}
                  </span>
                  <span className="text-xs text-gray-500">{f.protocol}</span>
                </div>
              </div>
              <p className="text-sm text-gray-700 mt-2">{f.purpose}</p>
              {f.endpoints && f.endpoints.length > 0 && (
                <ul className="mt-2 space-y-0.5">
                  {f.endpoints.map((e) => (
                    <li key={e} className="text-xs text-gray-600 font-mono">
                      <span className="text-orange-600">▶</span> {e}
                    </li>
                  ))}
                </ul>
              )}
              {f.events && f.events.length > 0 && (
                <ul className="mt-2 space-y-0.5">
                  {f.events.map((e) => (
                    <li key={e} className="text-xs text-gray-600 font-mono">
                      <span className="text-violet-600">⚡</span> {e}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Usage example */}
      <div className="bg-white rounded-lg shadow p-5">
        <h2 className="font-semibold text-gray-800 mb-3">
          Ví dụ: dùng hook trong Dashboard
        </h2>
        <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-sm overflow-x-auto">
          <pre>{`// src/pages/admin/Dashboard.tsx
import { useSensor }         from '../../hooks/useSensor';
import { useDeviceControl }  from '../../hooks/useDeviceControl';
import { useAlerts }         from '../../hooks/useAlerts';

export function AdminDashboard() {
  const [selectedRoom, setSelectedRoom] = useState('A101');

  // ✅ Real-time: Socket.IO + REST API
  const { latest, history, isConnected } = useSensor(selectedRoom);
  const { device, toggleFan, toggleWindow } = useDeviceControl(selectedRoom);
  const { alerts } = useAlerts();

  if (!latest) return <p>Đang kết nối...</p>;

  return (
    <>
      <span>{isConnected ? '🟢 Đang kết nối' : '🔴 Mất kết nối'}</span>
      <TempCard temperature={latest.temperature} />
      <TempLineChart data={history} />
      <FanControl device={device} onToggle={toggleFan} />
    </>
  );
}`}</pre>
        </div>
      </div>

      {/* .env example */}
      <div className="bg-white rounded-lg shadow p-5">
        <h2 className="font-semibold text-gray-800 mb-3">
          Cấu hình biến môi trường (.env)
        </h2>
        <div className="bg-gray-900 text-yellow-300 rounded-lg p-4 font-mono text-sm">
          <p className="text-gray-500"># .env.local – không commit file này</p>
          <p>VITE_API_URL=http://localhost:8000/api</p>
          <p>VITE_SOCKET_URL=http://localhost:8000</p>
        </div>
      </div>
    </div>
  );
}

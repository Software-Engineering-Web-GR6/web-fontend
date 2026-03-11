```batch
smart-classroom/
├── public/
│   └── index.html
│
├── src/
│   ├── main.tsx                    # Entry point
│   ├── App.tsx                     # Root component + routing
│   │
│   ├── components/                 # UI components tái sử dụng
│   │   ├── ui/                     # Base components (Button, Badge, Card...)
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Badge.tsx
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx         # Navigation sidebar
│   │   │   ├── Header.tsx          # Top bar (status, clock)
│   │   │   └── Layout.tsx          # Wrapper chính
│   │   ├── charts/
│   │   │   ├── TempLineChart.tsx   # Biểu đồ nhiệt độ realtime
│   │   │   ├── HumidityChart.tsx
│   │   │   └── HistoryChart.tsx    # Biểu đồ lịch sử đầy đủ
│   │   ├── sensors/
│   │   │   ├── TempCard.tsx        # Card hiển thị nhiệt độ
│   │   │   ├── HumidityCard.tsx
│   │   │   └── ComfortIndex.tsx    # Chỉ số tiện nghi
│   │   ├── devices/
│   │   │   ├── DeviceCard.tsx      # Card điều khiển thiết bị
│   │   │   ├── FanControl.tsx      # Điều khiển quạt
│   │   │   └── WindowControl.tsx   # Điều khiển cửa sổ
│   │   └── alerts/
│   │       ├── AlertBanner.tsx     # Banner cảnh báo khẩn
│   │       └── AlertItem.tsx       # Item trong danh sách log
│   │
├── pages/
│   |   ├── admin/
│   │   |   ├── Dashboard.tsx        # Xem tất cả phòng học
│   │   |   ├── Settings.tsx         # Cấu hình ngưỡng, thiết bị
│   │   |   ├── Alerts.tsx           # Quản lý & xử lý cảnh báo
│   │   |   ├── Devices.tsx          # Quản lý thiết bị phần cứng
│   │   |   └── Users.tsx            # Quản lý tài khoản user
│   │   |
│   |   └── user/
│   |       ├── Dashboard.tsx        # Chỉ xem phòng học của mình
│   |       ├── History.tsx          # Xem lịch sử nhiệt độ
│   |       └── Alerts.tsx           # Chỉ xem cảnh báo (không xử lý)
├── routes/
|   |   ├── index.tsx                # Kết hợp tất cả routes
|   |   ├── AdminRoutes.tsx          # Bọc PrivateRoute kiểm tra role=admin
|   |   └── UserRoutes.tsx           # Bọc PrivateRoute kiểm tra role=user
│   │
│   ├── hooks/                      # Custom hooks
│   │   ├── useSensor.ts            # Subscribe data từ WebSocket/MQTT
│   │   ├── useThresholds.ts        # Đọc/lưu cấu hình ngưỡng
│   │   ├── useAlerts.ts            # Logic sinh & quản lý cảnh báo
│   │   └── useDeviceControl.ts     # Gửi lệnh bật/tắt thiết bị
│   │
│   ├── services/                   # Giao tiếp với backend
│   │   ├── socket.ts               # Khởi tạo Socket.IO client
│   │   ├── api.ts                  # Axios instance + base config
│   │   ├── sensorApi.ts            # GET lịch sử sensor data
│   │   ├── deviceApi.ts            # POST lệnh điều khiển
│   │   └── thresholdApi.ts         # GET/PUT cấu hình ngưỡng
│   │
│   ├── store/                      # Zustand state management
│   │   ├── sensorStore.ts          # State: temp, humidity, history[]
│   │   ├── deviceStore.ts          # State: fanOn, windowOpen, manual
│   │   ├── alertStore.ts           # State: alerts[], unreadCount
│   │   └── thresholdStore.ts       # State: thresholds config
│   │
│   ├── types/                      # TypeScript interfaces
│   │   ├── sensor.ts               # SensorReading, SensorHistory
│   │   ├── device.ts               # DeviceState, DeviceCommand
│   │   ├── alert.ts                # Alert, AlertType
│   │   └── threshold.ts            # ThresholdConfig
│   │
│   ├── utils/
│   │   ├── thresholdLogic.ts       # Hàm so sánh ngưỡng → trạng thái
│   │   ├── formatters.ts           # Format số, thời gian
│   │   └── constants.ts            # DEFAULT_THRESHOLDS, COLORS...
│   │
│   └── styles/
│       ├── globals.css             # CSS variables, reset
│       └── theme.ts                # Màu sắc, typography tokens
│
├── .env                            # VITE_API_URL, VITE_SOCKET_URL
├── package.json
├── tsconfig.json
└── vite.config.ts
```

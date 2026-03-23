# Smart Classrooms Frontend

Frontend React + Vite cho hệ thống Smart Classroom.

## Tính năng chính

- Đăng nhập bằng backend JWT
- Giao diện admin và user tách riêng
- Dashboard phân tầng theo `tòa -> tầng -> phòng`
- User xem dữ liệu theo quyền `room + shift + day`
- Dữ liệu sensor lấy từ API và realtime qua WebSocket
- Cảnh báo lấy từ backend và hiển thị qua chuông thông báo
- Quản lý rules tự động hóa trong phần cài đặt
- Quản lý thiết bị theo nhóm và theo từng thiết bị
- Đồng bộ chế độ `tự động / thủ công` theo từng phòng
- Hồ sơ tài khoản và đổi mật khẩu

## Yêu cầu

- Node.js 18+
- npm

## Chạy frontend

### Cách nhanh trên Windows

PowerShell có thể chặn `npm.ps1`, nên có thể dùng script có sẵn:

```powershell
cd e:\baitapCNPM\frontend\smart-classrooms
.\run-dev.cmd
```

Script này sẽ:

- dùng `npm.cmd`
- tự cài dependencies nếu thiếu
- chạy Vite tại `http://127.0.0.1:5173`

### Chạy thủ công

CMD:

```cmd
cd /d e:\baitapCNPM\frontend\smart-classrooms
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

Nếu đã cài môi trường rồi:

```cmd
cd /d e:\baitapCNPM\frontend\smart-classrooms
npm run dev -- --host 127.0.0.1 --port 5173
```

PowerShell:

```powershell
cd e:\baitapCNPM\frontend\smart-classrooms
cmd /c npm install
cmd /c npm run dev -- --host 127.0.0.1 --port 5173
```

## Build production

```cmd
cd /d e:\baitapCNPM\frontend\smart-classrooms
npm.cmd run build
```

## Kết nối backend

Frontend mặc định dùng:

- API: `http://127.0.0.1:8000`
- WebSocket: `ws://127.0.0.1:8000/ws/alerts`

Có thể override bằng `.env`:

```env
VITE_API_URL=http://127.0.0.1:8000
VITE_SOCKET_URL=ws://127.0.0.1:8000/ws/alerts
```

## Tài khoản demo

Nếu backend đang seed mặc định:

- Email: `admin@example.com`
- Password: `admin123`

## Luồng chạy đầy đủ

1. Chạy backend
2. Chạy frontend
3. Chạy simulator nếu muốn có dữ liệu cảm biến tự động

Backend docs:

- `http://127.0.0.1:8000/docs`

Frontend local:

- `http://127.0.0.1:5173`

## Cấu trúc chính

```text
smart-classrooms/
|-- public/
|-- src/
|   |-- main.tsx                    # Entry point
|   |-- App.tsx                     # Root component
|   |-- components/                 # UI components
|   |-- hooks/                      # Custom hooks
|   |-- pages/                      # Trang admin và user
|   |-- routes/                     # Route config
|   |-- services/                   # API, socket, backend services
|   |-- store/                      # Zustand state
|   |-- types/                      # TypeScript types
|   |-- utils/                      # Helper functions
|   `-- styles/                     # Theme, CSS globals
|-- package.json
|-- tsconfig.json
`-- vite.config.ts
```

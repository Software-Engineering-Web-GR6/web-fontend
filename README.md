# Frontend Workspace

Workspace frontend cho hệ thống Smart Classroom.

Trong thư mục này, ứng dụng chính nằm tại:

- `frontend/smart-classrooms`

## Công nghệ sử dụng

- React
- Vite
- TypeScript
- Zustand
- Axios
- Recharts
- WebSocket

## Tính năng hiện tại

- Đăng nhập bằng JWT từ backend
- Giao diện admin và user tách riêng
- Dashboard phân tầng theo `tòa -> tầng -> phòng`
- Phân quyền user theo `room + shift + day`
- Quản lý thiết bị theo từng phòng
- Chế độ `tự động / thủ công` được đồng bộ với backend
- Cảnh báo realtime qua WebSocket
- Hồ sơ tài khoản và đổi mật khẩu

## Cấu trúc thư mục

```text
frontend/
|-- README.md
`-- smart-classrooms/
    |-- public/
    |-- src/
    |-- package.json
    |-- tsconfig.json
    `-- vite.config.ts
```

## Chạy ứng dụng

Xem chi tiết tại:

- `frontend/smart-classrooms/README.md`

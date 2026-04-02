# Smart Classrooms Frontend

Frontend React + Vite cho he thong Smart Classroom.

## Tinh nang chinh

- Dang nhap bang JWT tu backend
- Tach giao dien admin va user
- Dashboard theo toa, tang va phong
- Du lieu sensor lay tu API va cap nhat realtime qua WebSocket
- Hien thi canh bao realtime tu backend
- Quan ly thiet bi theo nhom va theo tung thiet bi
- Dong bo che do tu dong va thu cong theo tung phong
- Ho so tai khoan, doi mat khau va lich hoc theo tuan

## Yeu cau

- Node.js 18+
- npm

## Cai dat

```bash
cd e:/baitapCNPM/frontend-demo2/smart-classrooms
npm install
```

Neu PowerShell chan `npm.ps1`, dung `npm.cmd` thay cho `npm`.

## Chay development

```bash
cd e:/baitapCNPM/frontend-demo2/smart-classrooms
npm run dev -- --host 127.0.0.1 --port 5173
```

Frontend local: `http://127.0.0.1:5173`

## Build production

```bash
cd e:/baitapCNPM/frontend-demo2/smart-classrooms
npm run build
```

## Cau hinh moi truong

Tao file `.env` tu `.env.example` neu can thay doi dia chi backend:

```env
VITE_API_URL=http://127.0.0.1:8000
VITE_SOCKET_URL=ws://127.0.0.1:8000/ws/alerts
```

## Ket noi backend

- API mac dinh: `http://127.0.0.1:8000`
- WebSocket mac dinh: `ws://127.0.0.1:8000/ws/alerts`
- Swagger backend: `http://127.0.0.1:8000/docs`

## Cau truc chinh

```text
smart-classrooms/
|-- public/
|-- src/
|   |-- components/
|   |-- hooks/
|   |-- pages/
|   |-- routes/
|   |-- services/
|   |-- store/
|   |-- utils/
|   `-- styles/
|-- package.json
|-- tsconfig.json
`-- vite.config.ts
```

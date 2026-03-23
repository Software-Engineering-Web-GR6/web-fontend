# Smart Classrooms Frontend

Frontend React + Vite cho he thong Smart Classroom.

## Tinh nang chinh

- Dang nhap bang backend JWT
- Giao dien admin va user tach rieng
- Dashboard phan tang theo `toa -> tang -> phong`
- User xem du lieu theo quyen `room + shift + day`
- Du lieu sensor lay tu API va realtime qua WebSocket
- Canh bao lay tu backend va hien thi qua chuong thong bao
- Quan ly rules tu dong hoa trong phan cai dat
- Quan ly thiet bi theo nhom va theo tung thiet bi
- Dong bo che do `tu dong / thu cong` theo tung phong
- Ho so tai khoan va doi mat khau

## Yeu cau

- Node.js 18+
- npm

## Chay frontend

### Cach nhanh tren Windows

PowerShell co the chan `npm.ps1`, nen co the dung script co san:

```powershell
cd e:\baitapCNPM\frontend\smart-classrooms
.\run-dev.cmd
```

Script nay se:

- dung `npm.cmd`
- tu cai dependencies neu thieu
- chay Vite tai `http://127.0.0.1:5173`

### Chay thu cong

CMD:

```cmd
cd /d e:\baitapCNPM\frontend\smart-classrooms
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

Neu da cai moi truong roi:

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

## Ket noi backend

Frontend mac dinh dung:

- API: `http://127.0.0.1:8000`
- WebSocket: `ws://127.0.0.1:8000/ws/alerts`

Co the override bang file `.env`:

```env
VITE_API_URL=http://127.0.0.1:8000
VITE_SOCKET_URL=ws://127.0.0.1:8000/ws/alerts
```

Repo nay da co file `.env.example`. Moi nguoi trong nhom chi can copy thanh `.env` neu can doi host hoac port.

## Tai khoan demo

Neu backend dang seed mac dinh:

- Email: `admin@example.com`
- Password: `admin123`

## Luong chay day du

1. Chay backend
2. Chay frontend
3. Chay simulator neu muon co du lieu cam bien tu dong

Backend docs:

- `http://127.0.0.1:8000/docs`

Frontend local:

- `http://127.0.0.1:5173`

## Cau truc chinh

```text
smart-classrooms/
|-- public/
|-- src/
|   |-- main.tsx                    # Entry point
|   |-- App.tsx                     # Root component
|   |-- components/                 # UI components
|   |-- hooks/                      # Custom hooks
|   |-- pages/                      # Trang admin va user
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

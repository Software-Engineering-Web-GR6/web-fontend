/**
 * src/services/socket.ts
 * ──────────────────────
 * Khởi tạo Socket.IO client DUY NHẤT cho toàn ứng dụng.
 * Import singleton này vào các hook để lắng nghe / gửi sự kiện real-time.
 *
 * Biến môi trường cần đặt trong .env:
 *   VITE_SOCKET_URL=http://localhost:8000
 */

import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:8000';

export const socket = io(SOCKET_URL, {
  autoConnect: false,   // Chỉ kết nối khi gọi socket.connect() trong hook
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
  transports: ['websocket'],
});

export default socket;

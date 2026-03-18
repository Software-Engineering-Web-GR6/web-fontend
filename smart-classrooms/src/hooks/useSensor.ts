/**
 * src/hooks/useSensor.ts
 * ──────────────────────
 * Hook lấy dữ liệu cảm biến real-time qua WebSocket (Socket.IO).
 *
 * Sự kiện lắng nghe từ server:
 *   - "sensor:update"  → { roomId, temperature, humidity, timestamp }
 *
 * Dữ liệu được lưu vào Zustand (sensorStore) để các component khác đọc.
 *
 * Cách dùng trong component:
 *   const { latest, history, isConnected } = useSensor('A101');
 */

import { useEffect, useState } from 'react';
import { socket } from '../services/socket';
import { useSensorStore } from '../store/sensorStore';
import { getSensorHistory } from '../services/sensorApi';
import type { SensorReading } from '../types/sensor';

export function useSensor(roomId: string) {
  const { readings, history, setReading, appendHistory } = useSensorStore();
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    // 1. Tải lịch sử ban đầu từ REST API
    getSensorHistory(roomId)
      .then((data) => {
        data.readings.forEach((r) => appendHistory(r));
      })
      .catch(() => {
        // Backend chưa sẵn sàng – bỏ qua lỗi, dùng dữ liệu demo
      });

    // 2. Kết nối WebSocket và đăng ký lắng nghe sự kiện
    socket.connect();

    function onConnect() {
      setIsConnected(true);
      // Yêu cầu server gửi data của phòng cụ thể
      socket.emit('room:subscribe', { roomId });
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    // Server gửi bản đọc mới nhất qua sự kiện "sensor:update"
    function onSensorUpdate(reading: SensorReading) {
      if (reading.roomId !== roomId) return;
      setReading(reading);
      appendHistory(reading);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('sensor:update', onSensorUpdate);

    return () => {
      socket.emit('room:unsubscribe', { roomId });
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('sensor:update', onSensorUpdate);
    };
  }, [roomId]);   // eslint-disable-line react-hooks/exhaustive-deps

  return {
    latest: readings[roomId] ?? null,
    history: history[roomId] ?? [],
    isConnected,
  };
}

/**
 * src/hooks/useAlerts.ts
 * ──────────────────────
 * Hook quản lý cảnh báo – kết hợp REST API (lấy cảnh báo cũ) và
 * WebSocket (nhận cảnh báo mới real-time).
 *
 * Sự kiện lắng nghe từ server:
 *   - "alert:new"  → Alert object mới xuất hiện
 *
 * Dữ liệu được lưu vào Zustand (alertStore).
 *
 * Cách dùng:
 *   const { alerts, unreadCount, acknowledge, resolve } = useAlerts();
 */

import { useEffect } from 'react';
import api from '../services/api';
import { socket } from '../services/socket';
import { useAlertStore } from '../store/alertStore';
import type { Alert } from '../types/alert';

export function useAlerts() {
  const { alerts, unreadCount, addAlert, acknowledge, resolve } = useAlertStore();

  useEffect(() => {
    // 1. Tải danh sách cảnh báo hiện có từ REST API
    api.get<Alert[]>('/alerts')
      .then((res) => res.data.forEach((a) => addAlert(a)))
      .catch(() => {
        // Backend chưa sẵn sàng – bỏ qua
      });

    // 2. Lắng nghe cảnh báo mới qua WebSocket
    function onNewAlert(alert: Alert) {
      addAlert(alert);
    }

    socket.on('alert:new', onNewAlert);

    return () => {
      socket.off('alert:new', onNewAlert);
    };
  }, []);   // eslint-disable-line react-hooks/exhaustive-deps

  return { alerts, unreadCount, acknowledge, resolve };
}

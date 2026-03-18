/**
 * src/hooks/useDeviceControl.ts
 * ─────────────────────────────
 * Hook điều khiển thiết bị – gửi lệnh qua REST API và đồng bộ
 * trạng thái về Zustand (deviceStore).
 *
 * Cách dùng:
 *   const { device, toggleFan, toggleWindow, isLoading } = useDeviceControl('A101');
 */

import { useEffect, useState } from 'react';
import { getDeviceState, sendDeviceCommand } from '../services/deviceApi';
import { useDeviceStore } from '../store/deviceStore';
import { socket } from '../services/socket';
import type { DeviceState } from '../types/device';

export function useDeviceControl(roomId: string) {
  const { devices, setDevice } = useDeviceStore();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // 1. Tải trạng thái thiết bị hiện tại từ REST API
    getDeviceState(roomId)
      .then((state) => setDevice(state))
      .catch(() => {
        // Backend chưa sẵn sàng – bỏ qua
      });

    // 2. Lắng nghe cập nhật trạng thái thiết bị real-time qua WebSocket
    //    (ví dụ: thiết bị tự động bật/tắt do ngưỡng cảnh báo)
    function onDeviceUpdate(state: DeviceState) {
      if (state.roomId === roomId) setDevice(state);
    }

    socket.on('device:update', onDeviceUpdate);

    return () => {
      socket.off('device:update', onDeviceUpdate);
    };
  }, [roomId]);   // eslint-disable-line react-hooks/exhaustive-deps

  async function toggleFan(on: boolean) {
    setIsLoading(true);
    try {
      await sendDeviceCommand({
        roomId,
        device: 'fan',
        action: on ? 'on' : 'off',
      });
      setDevice({ ...currentDevice, fanOn: on, manual: true });
    } finally {
      setIsLoading(false);
    }
  }

  async function toggleWindow(open: boolean) {
    setIsLoading(true);
    try {
      await sendDeviceCommand({
        roomId,
        device: 'window',
        action: open ? 'open' : 'close',
      });
      setDevice({ ...currentDevice, windowOpen: open, manual: true });
    } finally {
      setIsLoading(false);
    }
  }

  const currentDevice: DeviceState = devices[roomId] ?? {
    roomId,
    fanOn: false,
    windowOpen: false,
    manual: false,
  };

  return { device: currentDevice, toggleFan, toggleWindow, isLoading };
}

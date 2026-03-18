/**
 * src/hooks/useThresholds.ts
 * ──────────────────────────
 * Hook đọc và lưu cấu hình ngưỡng cảnh báo qua REST API.
 *
 * Cách dùng:
 *   const { thresholds, updateThresholds, isSaving } = useThresholds('A101');
 */

import { useEffect, useState } from 'react';
import { getThreshold, updateThreshold } from '../services/thresholdApi';
import { useThresholdStore } from '../store/thresholdStore';
import type { ThresholdConfig } from '../types/threshold';

export function useThresholds(roomId: string) {
  const { getThreshold: getFromStore, setThreshold } = useThresholdStore();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Tải cấu hình ngưỡng từ REST API khi mount
    getThreshold(roomId)
      .then((config) => setThreshold(config))
      .catch(() => {
        // Backend chưa sẵn sàng – dùng giá trị mặc định đã có trong store
      });
  }, [roomId]);   // eslint-disable-line react-hooks/exhaustive-deps

  async function updateThresholds(config: ThresholdConfig) {
    setIsSaving(true);
    setError(null);
    try {
      const updated = await updateThreshold(config);
      setThreshold(updated);
    } catch {
      setError('Không thể lưu cấu hình. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  }

  return {
    thresholds: getFromStore(roomId),
    updateThresholds,
    isSaving,
    error,
  };
}

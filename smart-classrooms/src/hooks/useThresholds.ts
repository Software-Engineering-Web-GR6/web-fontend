import { useThresholdStore } from "../store";
import type { Threshold } from "../types/threshold";
import { thresholdApi } from "../services";
import { useState, useCallback } from "react";

export const useThresholds = () => {
  const {
    tempMax,
    tempMin,
    humidityMax,
    humidityMin,
    setThresholds,
    resetThresholds,
  } = useThresholdStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchThresholds = useCallback(async () => {
    try {
      setLoading(true);
      const data = await thresholdApi.get();
      setThresholds(data);
    } catch (err) {
      setError("Failed to fetch thresholds");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [setThresholds]);

  const updateThresholds = useCallback(
    async (newThresholds: Partial<Threshold>) => {
      try {
        setLoading(true);
        const data = await thresholdApi.update(newThresholds);
        setThresholds(data);
        return data;
      } catch (err) {
        setError("Failed to update thresholds");
        console.error(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setThresholds],
  );

  const reset = useCallback(async () => {
    try {
      setLoading(true);
      const data = await thresholdApi.reset();
      resetThresholds();
      return data;
    } catch (err) {
      setError("Failed to reset thresholds");
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [resetThresholds]);

  return {
    thresholds: { tempMax, tempMin, humidityMax, humidityMin },
    loading,
    error,
    fetchThresholds,
    updateThresholds,
    reset,
    setLocalThresholds: setThresholds,
  };
};

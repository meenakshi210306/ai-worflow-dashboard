"use client";

import { useCallback, useEffect, useState } from "react";

import { fetchDashboardOverview } from "../services/api/dashboard";
import { useAuthStore } from "../store/auth-store";
import type { DashboardOverview } from "../types/dashboard";

export function useDashboardOverview() {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const accessToken = useAuthStore((state) => state.accessToken);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  const loadOverview = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const overview = await fetchDashboardOverview();
      setData(overview);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load dashboard overview");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (!accessToken) {
      setIsLoading(false);
      return;
    }

    void loadOverview();
  }, [accessToken, isHydrated, loadOverview]);

  return {
    data,
    isLoading,
    error,
    refresh: loadOverview
  };
}

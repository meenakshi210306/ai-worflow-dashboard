"use client";

import { useCallback, useEffect, useState } from "react";

import { fetchWorkflowSuggestions } from "../services/api/ai";
import { useAuthStore } from "../store/auth-store";
import type { WorkflowSuggestion } from "../types/dashboard";

export function useWorkflowSuggestions() {
  const [data, setData] = useState<WorkflowSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const accessToken = useAuthStore((state) => state.accessToken);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  const loadSuggestions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const suggestions = await fetchWorkflowSuggestions();
      setData(suggestions);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load workflow suggestions");
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

    void loadSuggestions();
  }, [accessToken, isHydrated, loadSuggestions]);

  return {
    data,
    isLoading,
    error,
    refresh: loadSuggestions
  };
}

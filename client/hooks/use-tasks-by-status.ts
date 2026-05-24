"use client";

import { useEffect, useState } from "react";
import { getTasksByStatus } from "../services/api/tasks";
import { useAuthStore } from "../store/auth-store";
import type { Task } from "../services/api/tasks";

type UseTasksByStatusState = {
  data: Record<"TODO" | "IN_PROGRESS" | "DONE", Task[]>;
  isLoading: boolean;
  error: string | null;
};

export function useTasksByStatus() {
  const [refreshIndex, setRefreshIndex] = useState(0);
  const [state, setState] = useState<UseTasksByStatusState>({
    data: {
      TODO: [],
      IN_PROGRESS: [],
      DONE: []
    },
    isLoading: false,
    error: null
  });

  const isHydrated = useAuthStore((state) => state.isHydrated);
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    if (!isHydrated || !accessToken) {
      return;
    }

    async function loadTasks() {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const [todo, inProgress, done] = await Promise.all([
          getTasksByStatus("TODO"),
          getTasksByStatus("IN_PROGRESS"),
          getTasksByStatus("DONE")
        ]);

        setState({
          data: {
            TODO: todo,
            IN_PROGRESS: inProgress,
            DONE: done
          },
          isLoading: false,
          error: null
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load tasks";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: message
        }));
      }
    }

    loadTasks();
  }, [isHydrated, accessToken, refreshIndex]);

  return {
    ...state,
    refetch: () => setRefreshIndex((value) => value + 1)
  };
}

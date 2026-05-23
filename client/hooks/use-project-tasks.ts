"use client";

import { useEffect, useState } from "react";
import { getProjectTasks } from "../services/api/tasks";
import { useAuthStore } from "../store/auth-store";
import type { Task } from "../services/api/tasks";

type UseProjectTasksState = {
  data: Record<"TODO" | "IN_PROGRESS" | "DONE", Task[]>;
  isLoading: boolean;
  error: string | null;
};

export function useProjectTasks(projectId: string) {
  const [state, setState] = useState<UseProjectTasksState>({
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
    if (!isHydrated || !accessToken || !projectId) {
      return;
    }

    async function loadTasks() {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const tasks = await getProjectTasks(projectId);
        
        const todo = tasks.filter((t) => t.status === "TODO");
        const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS");
        const done = tasks.filter((t) => t.status === "DONE");

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
        const message = err instanceof Error ? err.message : "Failed to load project tasks";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: message
        }));
      }
    }

    loadTasks();
  }, [isHydrated, accessToken, projectId]);

  return state;
}

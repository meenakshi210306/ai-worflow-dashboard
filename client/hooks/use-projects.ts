"use client";

import { useEffect, useState } from "react";
import { getProjects } from "../services/api/projects";
import { useAuthStore } from "../store/auth-store";
import type { Project } from "../services/api/projects";

type UseProjectsState = {
  data: Project[] | null;
  isLoading: boolean;
  error: string | null;
};

export function useProjects() {
  const [state, setState] = useState<UseProjectsState>({
    data: null,
    isLoading: false,
    error: null
  });

  const isHydrated = useAuthStore((state) => state.isHydrated);
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    if (!isHydrated || !accessToken) {
      return;
    }

    async function loadProjects() {
      setState({ data: null, isLoading: true, error: null });

      try {
        const projects = await getProjects();
        setState({ data: projects, isLoading: false, error: null });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load projects";
        setState({ data: null, isLoading: false, error: message });
      }
    }

    loadProjects();
  }, [isHydrated, accessToken]);

  return state;
}

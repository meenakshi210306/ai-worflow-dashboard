import { api } from "../../lib/api";
import type { Project } from "./projects";
import type { Task } from "./tasks";
import type { WorkflowSuggestion } from "../../types/dashboard";

export async function searchAll(query: string) {
  const response = await api.get<{
    success: boolean;
    data: {
      projects: Project[];
      tasks: Task[];
      workflows: WorkflowSuggestion[];
    };
  }>("/api/search", {
    params: { q: query }
  });

  return response.data.data;
}

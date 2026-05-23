import { api } from "../../lib/api";
import type { GeneratedWorkflow, WorkflowSuggestion } from "../../types/dashboard";

export type GenerateWorkflowPayload = {
  prompt: string;
  projectId?: string;
};

export async function generateWorkflow(payload: GenerateWorkflowPayload) {
  const response = await api.post<{
    success: boolean;
    message: string;
    data: {
      suggestion: { id: string; prompt: string; result: GeneratedWorkflow; createdAt: string };
      workflow: GeneratedWorkflow;
    };
  }>("/api/ai/generate-workflow", payload);

  return response.data.data;
}

export async function fetchWorkflowSuggestions() {
  const response = await api.get<{ success: boolean; data: WorkflowSuggestion[] }>("/api/ai/suggestions");

  return response.data.data;
}

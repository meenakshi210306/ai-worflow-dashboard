import { api } from "../../lib/api";

export type Project = {
  id: string;
  name: string;
  description?: string | null;
  status: "ACTIVE" | "ARCHIVED";
  ownerId: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateProjectPayload = {
  name: string;
  description?: string;
};

export async function createProject(payload: CreateProjectPayload) {
  const response = await api.post<{
    success: boolean;
    message: string;
    data: Project;
  }>("/api/projects", payload);

  return response.data.data;
}

export async function getProjects() {
  const response = await api.get<{
    success: boolean;
    data: Project[];
  }>("/api/projects");

  return response.data.data;
}

export async function getProject(projectId: string) {
  const response = await api.get<{
    success: boolean;
    data: Project;
  }>(`/api/projects/${projectId}`);

  return response.data.data;
}

export async function updateProject(
  projectId: string,
  payload: Partial<CreateProjectPayload> & { status?: "ACTIVE" | "ARCHIVED" }
) {
  const response = await api.put<{
    success: boolean;
    message: string;
    data: Project;
  }>(`/api/projects/${projectId}`, payload);

  return response.data.data;
}

export async function deleteProject(projectId: string) {
  const response = await api.delete<{
    success: boolean;
    message: string;
  }>(`/api/projects/${projectId}`);

  return response.data;
}

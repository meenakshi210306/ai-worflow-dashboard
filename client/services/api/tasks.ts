import { api } from "../../lib/api";

export type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate?: string | null;
  projectId: string;
  createdById: string;
  assigneeId?: string | null;
  createdAt: string;
  updatedAt: string;
  project?: {
    id: string;
    name: string;
  };
  createdBy?: {
    id: string;
    name?: string;
    email: string;
  };
  assignee?: {
    id: string;
    name?: string;
    email: string;
  } | null;
};

export type CreateTaskPayload = {
  projectId: string;
  title: string;
  description?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status?: "TODO" | "IN_PROGRESS" | "DONE";
  dueDate?: string;
};

export type UpdateTaskPayload = {
  title?: string;
  description?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status?: "TODO" | "IN_PROGRESS" | "DONE";
  dueDate?: string;
  assigneeId?: string;
};

export async function createTask(payload: CreateTaskPayload) {
  const response = await api.post<{
    success: boolean;
    message: string;
    data: Task;
  }>("/api/tasks", payload);

  return response.data.data;
}

export async function getTasks() {
  const response = await api.get<{
    success: boolean;
    data: Task[];
  }>("/api/tasks");

  return response.data.data;
}

export async function getTasksByStatus(status: "TODO" | "IN_PROGRESS" | "DONE") {
  const response = await api.get<{
    success: boolean;
    data: Task[];
  }>(`/api/tasks/by-status/${status}`);

  return response.data.data;
}

export async function getProjectTasks(projectId: string) {
  const response = await api.get<{
    success: boolean;
    data: Task[];
  }>(`/api/tasks/project/${projectId}`);

  return response.data.data;
}

export async function updateTask(taskId: string, payload: UpdateTaskPayload) {
  const response = await api.put<{
    success: boolean;
    message: string;
    data: Task;
  }>(`/api/tasks/${taskId}`, payload);

  return response.data.data;
}

export async function deleteTask(taskId: string) {
  const response = await api.delete<{
    success: boolean;
    message: string;
  }>(`/api/tasks/${taskId}`);

  return response.data;
}

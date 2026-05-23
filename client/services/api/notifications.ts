import { api } from "../../lib/api";
import type { NotificationsResponse } from "../../types/dashboard";

export async function fetchNotifications() {
  const response = await api.get<{ success: boolean; data: NotificationsResponse }>("/api/notifications");

  return response.data.data;
}

export async function markNotificationRead(notificationId: string) {
  const response = await api.patch<{ success: boolean; data: unknown }>(`/api/notifications/${notificationId}/read`);

  return response.data;
}

export async function markAllNotificationsRead() {
  const response = await api.patch<{ success: boolean; message: string }>("/api/notifications/read-all");

  return response.data;
}

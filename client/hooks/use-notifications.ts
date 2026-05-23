"use client";

import { useCallback, useEffect, useState } from "react";

import { fetchNotifications, markAllNotificationsRead, markNotificationRead } from "../services/api/notifications";
import { useAuthStore } from "../store/auth-store";
import type { NotificationItem } from "../types/dashboard";

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const accessToken = useAuthStore((state) => state.accessToken);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await fetchNotifications();
      setNotifications(response.notifications);
      setUnreadCount(response.unreadCount);
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

    void loadNotifications();
  }, [accessToken, isHydrated, loadNotifications]);

  const readNotification = useCallback(async (notificationId: string) => {
    await markNotificationRead(notificationId);

    setNotifications((current) =>
      current.map((notification) =>
        notification.id === notificationId ? { ...notification, isRead: true } : notification
      )
    );
    setUnreadCount((current) => Math.max(current - 1, 0));
  }, []);

  const readAllNotifications = useCallback(async () => {
    await markAllNotificationsRead();

    setNotifications((current) => current.map((notification) => ({ ...notification, isRead: true })));
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    isLoading,
    refresh: loadNotifications,
    readNotification,
    readAllNotifications
  };
}

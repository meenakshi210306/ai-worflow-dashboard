"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { DashboardNavbar } from "./dashboard-navbar";
import { DashboardSidebar } from "./dashboard-sidebar";
import { NotificationsDrawer } from "./modals/notifications-drawer";
import { useNotifications } from "../hooks/use-notifications";
import { useDashboardUiStore } from "../store/dashboard-ui-store";
import { useToastStore } from "../store/toast-store";

type DashboardShellProps = {
  children: ReactNode;
};

export function DashboardShell({ children }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hasFreshAlert, setHasFreshAlert] = useState(false);
  const { notifications, unreadCount, isLoading, readAllNotifications, readNotification } = useNotifications({
    autoRefresh: true,
    refreshIntervalMs: 12000
  });
  const pushToast = useToastStore((state) => state.pushToast);
  const isNotificationsOpen = useDashboardUiStore((state) => state.isNotificationsOpen);
  const openNotifications = useDashboardUiStore((state) => state.openNotifications);
  const closeNotifications = useDashboardUiStore((state) => state.closeNotifications);
  const hasInitializedRef = useRef(false);
  const previousUnreadRef = useRef(0);
  const previousIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const currentIds = new Set(notifications.map((notification) => notification.id));

    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      previousUnreadRef.current = unreadCount;
      previousIdsRef.current = currentIds;
      return;
    }

    if (unreadCount > previousUnreadRef.current) {
      const newlyReceived = notifications.find(
        (notification) => !previousIdsRef.current.has(notification.id)
      );

      pushToast({
        title: "New notification received",
        description: newlyReceived?.title ?? `You have ${unreadCount} unread notifications.`,
        tone: "info"
      });
      setHasFreshAlert(true);
    }

    previousUnreadRef.current = unreadCount;
    previousIdsRef.current = currentIds;
  }, [isLoading, notifications, pushToast, unreadCount]);

  function handleAlertsClick() {
    setHasFreshAlert(false);
    openNotifications();
  }

  function handleCloseSidebar() {
    setMobileOpen(false);
  }

  return (
    <div className="min-h-screen lg:flex">
      <DashboardSidebar mobileOpen={mobileOpen} onClose={handleCloseSidebar} />

      <div className="flex min-h-screen flex-1 flex-col px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6">
          <DashboardNavbar
            onMenuClick={() => setMobileOpen(true)}
            onAlertsClick={handleAlertsClick}
            unreadCount={unreadCount}
            hasFreshAlert={hasFreshAlert}
          />
          <main className="flex-1">{children}</main>
        </div>
      </div>

      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        notifications={notifications}
        unreadCount={unreadCount}
        isLoading={isLoading}
        onClose={closeNotifications}
        onReadAll={readAllNotifications}
        onReadNotification={readNotification}
      />
    </div>
  );
}

"use client";

import { useState, type ReactNode } from "react";

import { DashboardNavbar } from "./dashboard-navbar";
import { DashboardSidebar } from "./dashboard-sidebar";
import { NotificationsDrawer } from "./modals/notifications-drawer";
import { useNotifications } from "../hooks/use-notifications";
import { useDashboardUiStore } from "../store/dashboard-ui-store";

type DashboardShellProps = {
  children: ReactNode;
};

export function DashboardShell({ children }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { notifications, unreadCount, isLoading, readAllNotifications, readNotification } = useNotifications();
  const isNotificationsOpen = useDashboardUiStore((state) => state.isNotificationsOpen);
  const openNotifications = useDashboardUiStore((state) => state.openNotifications);
  const closeNotifications = useDashboardUiStore((state) => state.closeNotifications);

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
            onAlertsClick={openNotifications}
            unreadCount={unreadCount}
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

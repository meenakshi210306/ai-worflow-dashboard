"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCheck, ExternalLink, X } from "lucide-react";

import type { NotificationItem } from "../../types/dashboard";

type NotificationsDrawerProps = {
  isOpen: boolean;
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading?: boolean;
  onClose: () => void;
  onReadAll: () => Promise<void> | void;
  onReadNotification: (notificationId: string) => Promise<void> | void;
};

export function NotificationsDrawer({
  isOpen,
  notifications,
  unreadCount,
  isLoading,
  onClose,
  onReadAll,
  onReadNotification
}: NotificationsDrawerProps) {
  const receivedCount = notifications.length;
  const readCount = Math.max(receivedCount - unreadCount, 0);

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-slate-950/40"
          onClick={onClose}
        >
          <motion.aside
            initial={{ x: 360 }}
            animate={{ x: 0 }}
            exit={{ x: 360 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="ml-auto flex h-full w-full max-w-xl flex-col bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.22em] text-slate-500">Alerts</p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-950">Notifications</h2>
                <p className="mt-2 text-sm text-slate-500">
                  You have received {receivedCount} notification{receivedCount === 1 ? "" : "s"}.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onReadAll}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
                >
                  <CheckCheck className="h-4 w-4" />
                  Mark all read
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-2xl border border-slate-200 bg-white p-2 text-slate-600 transition hover:border-slate-300 hover:text-slate-950"
                  aria-label="Close notifications"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between px-6 py-4 text-sm text-slate-500">
              <span>{receivedCount} received</span>
              <span>{unreadCount} unread</span>
              <span>{readCount} read</span>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-6">
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }, (_, index) => (
                    <div key={index} className="animate-pulse rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                      <div className="h-4 w-32 rounded-full bg-slate-200" />
                      <div className="mt-3 h-3 w-3/4 rounded-full bg-slate-200" />
                      <div className="mt-2 h-3 w-1/2 rounded-full bg-slate-200" />
                    </div>
                  ))}
                </div>
              ) : notifications.length ? (
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <article
                      key={notification.id}
                      className={`rounded-[1.5rem] border p-4 transition ${
                        notification.isRead ? "border-slate-200 bg-slate-50" : "border-slate-300 bg-white shadow-soft"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="rounded-2xl bg-slate-950 p-2 text-white">
                          <Bell className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="font-semibold text-slate-950">{notification.title}</h3>
                              <p className="mt-1 text-sm leading-6 text-slate-600">{notification.message}</p>
                              <div className="mt-2 flex flex-wrap gap-2">
                                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                                  Received
                                </span>
                                <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${notification.isRead ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                                  {notification.isRead ? "Read" : "Unread"}
                                </span>
                                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                  {notification.type}
                                </span>
                              </div>
                            </div>
                            {!notification.isRead ? (
                              <button
                                type="button"
                                onClick={() => onReadNotification(notification.id)}
                                className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white transition hover:bg-slate-800"
                              >
                                Mark read
                              </button>
                            ) : null}
                          </div>
                          <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-500">
                            <span>{new Date(notification.createdAt).toLocaleString()}</span>
                            {notification.actionUrl ? (
                              <a href={notification.actionUrl} className="inline-flex items-center gap-1 font-semibold text-slate-700 hover:text-slate-950">
                                Open <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="flex h-full min-h-[24rem] flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-6 text-center">
                  <div className="rounded-full bg-white p-4 text-slate-700 shadow-sm">
                    <Bell className="h-6 w-6" />
                  </div>
                  <p className="mt-4 text-lg font-semibold text-slate-950">No notifications yet</p>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                    You&apos;ll see workflow updates, deadline reminders, and project changes here as the app is used.
                  </p>
                </div>
              )}
            </div>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

"use client";

import Link from "next/link";
import { ArrowUpRight, Bell, CheckCheck } from "lucide-react";

import { useNotifications } from "../../../hooks/use-notifications";

export default function NotificationsPage() {
  const { notifications, unreadCount, isLoading, readAllNotifications, readNotification } = useNotifications();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-soft backdrop-blur lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-slate-500">Notifications</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">Activity inbox</h1>
          <p className="mt-2 text-sm text-slate-600">Manage recent alerts, workflow updates, and deadline reminders.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={readAllNotifications}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </button>
          <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
            Back to overview <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-[1.5rem] border border-white/70 bg-white/85 px-5 py-4 text-sm text-slate-500 shadow-soft backdrop-blur">
        <span>{unreadCount} unread</span>
        <span>{notifications.length} notifications</span>
      </div>

      {isLoading ? <div className="h-72 animate-pulse rounded-[2rem] border border-white/70 bg-white/75 shadow-soft" /> : null}

      <div className="space-y-3">
        {notifications.map((notification) => (
          <article
            key={notification.id}
            className={`rounded-[2rem] border p-5 shadow-soft backdrop-blur transition hover:-translate-y-0.5 ${
              notification.isRead ? "border-white/70 bg-white/85" : "border-slate-300 bg-white"
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-slate-950 p-3 text-white">
                <Bell className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-950">{notification.title}</h2>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{notification.message}</p>
                  </div>
                  {!notification.isRead ? (
                    <button
                      type="button"
                      onClick={() => readNotification(notification.id)}
                      className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      Mark read
                    </button>
                  ) : (
                    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      Read
                    </span>
                  )}
                </div>
                <div className="mt-4 flex items-center justify-between gap-3 text-xs text-slate-500">
                  <span>{new Date(notification.createdAt).toLocaleString()}</span>
                  {notification.actionUrl ? <a href={notification.actionUrl} className="font-semibold text-slate-700 hover:text-slate-950">Open workflow</a> : null}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {!isLoading && notifications.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/70 p-10 text-center text-slate-600 shadow-soft">
          No notifications yet. Alerts will appear here when workflows are generated or updated.
        </div>
      ) : null}
    </div>
  );
}

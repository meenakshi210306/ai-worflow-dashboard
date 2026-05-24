"use client";

import { Bell, LogOut, Menu, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { logoutAuthSession } from "../lib/auth";
import { useAuthStore } from "../store/auth-store";
import { searchAll } from "../services/api/search";

type DashboardNavbarProps = {
  onMenuClick: () => void;
  onAlertsClick: () => void;
  unreadCount: number;
  hasFreshAlert?: boolean;
};

export function DashboardNavbar({ onMenuClick, onAlertsClick, unreadCount, hasFreshAlert = false }: DashboardNavbarProps) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const [searchQuery, setSearchQuery] = useState("");

  async function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!searchQuery.trim()) {
      return;
    }

    try {
      const results = await searchAll(searchQuery);
      
      // If we have projects, navigate to the first one
      if (results.projects && results.projects.length > 0) {
        router.push(`/dashboard/projects?search=${encodeURIComponent(searchQuery)}`);
        return;
      }

      // If we have tasks, navigate to tasks with search
      if (results.tasks && results.tasks.length > 0) {
        router.push(`/dashboard/tasks?search=${encodeURIComponent(searchQuery)}`);
        return;
      }

      // If we have workflows, navigate to AI section with search
      if (results.workflows && results.workflows.length > 0) {
        router.push(`/dashboard?search=${encodeURIComponent(searchQuery)}`);
        return;
      }

      // Show a toast or message if no results found
      // For now, just navigate to projects page
      router.push(`/dashboard/projects?search=${encodeURIComponent(searchQuery)}`);
    } catch (error) {
      console.error("Search failed:", error);
    }
  }

  async function handleLogout() {
    try {
      await logoutAuthSession();
    } finally {
      clearSession();
      router.replace("/login");
    }
  }

  return (
    <header className="flex flex-col gap-4 rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-soft backdrop-blur lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:text-slate-950 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-slate-500">Dashboard</p>
          <h1 className="mt-1 font-[family:var(--font-heading)] text-3xl font-semibold text-slate-950">
            Welcome back{user?.name ? `, ${user.name}` : ""}
          </h1>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <form onSubmit={handleSearch} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-500">
          <Search className="h-4 w-4" />
          <input
            type="search"
            placeholder="Search projects, tasks, AI"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 sm:w-72"
          />
        </form>

        <button
          type="button"
          onClick={onAlertsClick}
          className={`inline-flex h-11 items-center justify-center gap-2 rounded-2xl border bg-white px-4 text-sm font-semibold transition hover:text-slate-950 ${
            hasFreshAlert
              ? "border-amber-300 text-amber-700 shadow-[0_0_0_3px_rgba(251,191,36,0.2)] animate-pulse"
              : "border-slate-200 text-slate-700 hover:border-slate-300"
          }`}
        >
          <span className="relative inline-flex items-center justify-center">
            <Bell className="h-4 w-4" />
            {unreadCount > 0 ? (
              <span className="absolute -right-2 -top-2 inline-flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {unreadCount}
              </span>
            ) : null}
          </span>
          Alerts
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </header>
  );
}

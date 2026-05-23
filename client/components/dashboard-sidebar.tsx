"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { BarChart3, Bot, FolderKanban, LayoutDashboard, Settings2, Sparkles, CheckSquare, Bell } from "lucide-react";

import { useAuthStore } from "../store/auth-store";

type SidebarItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
};

const navigationItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/projects", label: "Projects", icon: FolderKanban },
  { href: "/dashboard/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/dashboard/ai-suggestions", label: "AI Suggestions", icon: Sparkles },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings2 },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell }
] as const satisfies readonly SidebarItem[];

type DashboardSidebarProps = {
  mobileOpen: boolean;
  onClose: () => void;
};

export function DashboardSidebar({ mobileOpen, onClose }: DashboardSidebarProps) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

  const content = (
    <div className="flex h-full flex-col border-r border-white/70 bg-white/85 p-6 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-soft">
          <Bot className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-950">AI Workflow</p>
          <p className="text-xs text-slate-500">Automation Dashboard</p>
        </div>
      </div>

      <div className="mt-8 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-500">Workspace</p>
        <p className="mt-3 text-lg font-semibold text-slate-950">Startup operations</p>
        <p className="mt-2 text-sm text-slate-600">
          {user?.name ? `${user.name}'s team` : "Team workspace"}
        </p>
      </div>

      <nav className="mt-8 space-y-1">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          const baseClasses = `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
            isActive ? "bg-slate-950 text-white shadow-soft" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
          }`;

          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onClose}
              className={baseClasses}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-[1.5rem] border border-slate-200 bg-gradient-to-br from-sky-50 to-white p-4">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-500">AI mode</p>
        <p className="mt-2 text-sm text-slate-700">Workflow suggestions, task breakdowns, and productivity insights will live here.</p>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden h-screen w-80 lg:sticky lg:top-0 lg:block">{content}</aside>

      {mobileOpen ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-slate-950/40 lg:hidden"
          onClick={onClose}
        >
          <motion.aside
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="h-full w-[320px] max-w-[85vw]"
            onClick={(event) => event.stopPropagation()}
          >
            {content}
          </motion.aside>
        </motion.div>
      ) : null}
    </>
  );
}

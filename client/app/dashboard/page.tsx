"use client";

import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Rocket, Sparkles, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";

import { MetricCard } from "../../components/dashboard/metric-card";
import { WorkflowGeneratorModal } from "../../components/modals/workflow-generator-modal";
import { useDashboardOverview } from "../../hooks/use-dashboard-overview";

export default function DashboardPage() {
  const { data, isLoading, error, refresh } = useDashboardOverview();
  const [isWorkflowOpen, setIsWorkflowOpen] = useState(false);

  const metrics = useMemo(
    () => [
      {
        label: "Total projects",
        value: data?.stats.totalProjects ?? 0,
        note: "Live workspace count",
        icon: <Rocket className="h-5 w-5" />,
        tone: "blue" as const
      },
      {
        label: "Open tasks",
        value: data?.stats.openTasks ?? 0,
        note: "Needs attention today",
        icon: <CheckCircle2 className="h-5 w-5" />,
        tone: "emerald" as const
      },
      {
        label: "AI suggestions",
        value: data?.stats.aiSuggestions ?? 0,
        note: "Stored in PostgreSQL",
        icon: <Sparkles className="h-5 w-5" />,
        tone: "amber" as const
      }
    ],
    [data]
  );

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-soft backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-slate-500">Projects</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">Active delivery pipeline</h2>
            </div>
            <Link
              href="/dashboard/projects"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
            >
              View projects <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {isLoading && !data ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }, (_, index) => (
                  <div key={index} className="animate-pulse rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                    <div className="h-4 w-40 rounded-full bg-slate-200" />
                    <div className="mt-3 h-3 w-3/4 rounded-full bg-slate-200" />
                    <div className="mt-4 h-2 rounded-full bg-slate-200" />
                  </div>
                ))}
              </div>
            ) : null}

            {data?.projects.slice(0, 3).map((project) => (
              <article key={project.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:shadow-soft">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-950">{project.name}</h3>
                    <p className="mt-1 text-sm text-slate-500">{project.description ?? "No description provided"}</p>
                  </div>
                  <div className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-700 shadow-sm">
                    {project.progress}%
                  </div>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-slate-950 transition-all duration-500" style={{ width: `${project.progress}%` }} />
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>{project.taskCount} tasks</span>
                  <span>{project.completedCount} completed</span>
                </div>
              </article>
            ))}
          </div>
        </article>

        <aside className="space-y-6">
          <article className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-soft backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.22em] text-slate-500">AI workflow</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">Generate execution plans</h2>
              </div>
              <TrendingUp className="h-5 w-5 text-slate-500" />
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Turn a prompt into structured workflow tasks, owners, checkpoints, and a reusable execution plan.
            </p>
            <button
              type="button"
              onClick={() => setIsWorkflowOpen(true)}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <Sparkles className="h-4 w-4" />
              Generate workflow
            </button>
          </article>

          <article className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-soft backdrop-blur">
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-slate-500">Recent activity</p>
            <div className="mt-5 space-y-4">
              {data?.activity.slice(0, 4).map((entry) => (
                <div key={entry.id} className="flex items-start gap-3">
                  <div className="mt-1 h-2.5 w-2.5 rounded-full bg-slate-950" />
                  <div>
                    <p className="text-sm font-medium text-slate-950">{entry.label}</p>
                    <p className="text-xs text-slate-500">{new Date(entry.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </aside>
      </section>

      {error ? (
        <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          Failed to load dashboard data: {error}
        </div>
      ) : null}

      <WorkflowGeneratorModal
        isOpen={isWorkflowOpen}
        onClose={() => setIsWorkflowOpen(false)}
        onGenerated={() => {
          void refresh();
        }}
      />
    </div>
  );
}
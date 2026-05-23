"use client";

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Link from "next/link";
import { ArrowUpRight, BarChart3, CheckCircle2, Loader2, Sparkles, TrendingUp } from "lucide-react";

import { MetricCard } from "../../../components/dashboard/metric-card";
import { useDashboardOverview } from "../../../hooks/use-dashboard-overview";

export default function AnalyticsPage() {
  const { data, isLoading, error } = useDashboardOverview();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-soft backdrop-blur lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-slate-500">Analytics</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">Performance dashboard</h1>
          <p className="mt-2 text-sm text-slate-600">Visualize delivery progress, workflow generation, and activity trends.</p>
        </div>
        <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950">
          Back to overview <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Completed tasks"
          value={data?.stats.completedTasks ?? 0}
          note="Tasks delivered to done"
          icon={<CheckCircle2 className="h-5 w-5" />}
          tone="emerald"
        />
        <MetricCard
          label="AI usage"
          value={data?.stats.aiSuggestions ?? 0}
          note="Workflow plans generated"
          icon={<Sparkles className="h-5 w-5" />}
          tone="amber"
        />
        <MetricCard
          label="Open work"
          value={data?.stats.openTasks ?? 0}
          note="Tasks still in motion"
          icon={<TrendingUp className="h-5 w-5" />}
          tone="blue"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-soft backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-slate-500">Task completion trend</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">Delivery velocity</h2>
            </div>
            <BarChart3 className="h-5 w-5 text-slate-500" />
          </div>
          <div className="mt-6 h-72">
            {isLoading && !data ? (
              <div className="flex h-full items-center justify-center text-slate-500">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.trends ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="completedTasks" stroke="#0f172a" strokeWidth={3} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="workflows" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </article>

        <article className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-soft backdrop-blur">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-slate-500">AI activity</p>
          <div className="mt-5 h-72">
            {isLoading && !data ? (
              <div className="flex h-full items-center justify-center text-slate-500">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.trends ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="activities" fill="#334155" radius={[12, 12, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-soft backdrop-blur">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-slate-500">Recent activity</p>
          <div className="mt-5 space-y-4">
            {data?.activity.slice(0, 5).map((entry) => (
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

        <article className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-soft backdrop-blur">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-slate-500">Project mix</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {data?.projects.slice(0, 4).map((project) => (
              <div key={project.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-950">{project.name}</p>
                <p className="mt-1 text-xs text-slate-500">{project.progress}% complete</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      {error ? <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">{error}</div> : null}
    </div>
  );
}

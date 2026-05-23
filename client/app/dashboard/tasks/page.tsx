"use client";

import Link from "next/link";
import { ArrowUpRight, Circle } from "lucide-react";

import { useTasksByStatus } from "../../../hooks/use-tasks-by-status";

const statusLabels = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  DONE: "Done"
} as const;

const statusTone = {
  TODO: "bg-slate-100 text-slate-700",
  IN_PROGRESS: "bg-sky-100 text-sky-700",
  DONE: "bg-emerald-100 text-emerald-700"
} as const;

export default function TasksPage() {
  const { data, isLoading, error } = useTasksByStatus();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-soft backdrop-blur lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-slate-500">Tasks</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">Execution queue</h1>
          <p className="mt-2 text-sm text-slate-600">Monitor work in flight by status and priority.</p>
        </div>
        <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950">
          Back to overview <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      {isLoading && !data.TODO.length ? <div className="h-72 animate-pulse rounded-[2rem] border border-white/70 bg-white/75 shadow-soft" /> : null}

      <div className="grid gap-4 xl:grid-cols-3">
        {(Object.keys(statusLabels) as Array<keyof typeof statusLabels>).map((status) => {
          const tasks = data[status] ?? [];

          return (
            <section key={status} className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-soft backdrop-blur">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.22em] text-slate-500">{statusLabels[status]}</p>
                  <h2 className="mt-2 text-xl font-semibold text-slate-950">{tasks.length} tasks</h2>
                </div>
                <div className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone[status]}`}>
                  <Circle className="mr-1 inline-block h-3 w-3 fill-current" />
                  {status}
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {tasks.length ? tasks.map((task) => (
                  <article key={task.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:shadow-soft">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-slate-950">{task.title}</h3>
                        <p className="mt-1 text-sm text-slate-600">{task.project?.name ?? "No project"}</p>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                        {task.priority}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                      <span>{task.assignee?.name ?? "Unassigned"}</span>
                      <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}</span>
                    </div>
                  </article>
                )) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500">
                    No tasks in this state.
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>

      {error ? <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">{error}</div> : null}
    </div>
  );
}

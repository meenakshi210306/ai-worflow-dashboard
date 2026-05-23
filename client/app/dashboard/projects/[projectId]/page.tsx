"use client";

import Link from "next/link";
import { ArrowLeft, Circle } from "lucide-react";
import { use } from "react";
import { useProjectTasks } from "../../../../hooks/use-project-tasks";
import { useProjects } from "../../../../hooks/use-projects";

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

export default function ProjectDetailsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.projectId;
  
  const { data: projectsData } = useProjects();
  const project = projectsData?.find((p) => p.id === projectId);
  
  const { data, isLoading, error } = useProjectTasks(projectId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-soft backdrop-blur lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Link href="/dashboard/projects" className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900">
            <ArrowLeft className="h-4 w-4" /> Back to projects
          </Link>
          <p className="mt-4 text-sm font-medium uppercase tracking-[0.22em] text-slate-500">Project Details</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">{project?.name || "Loading project..."}</h1>
          <p className="mt-2 text-sm text-slate-600">{project?.description || "Project execution queue"}</p>
        </div>
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

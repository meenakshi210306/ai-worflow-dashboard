"use client";

import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Circle, PencilLine, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";

import { TaskEditorModal } from "../../../components/modals/task-editor-modal";
import { useProjects } from "../../../hooks/use-projects";
import { useTasksByStatus } from "../../../hooks/use-tasks-by-status";
import type { Task } from "../../../services/api/tasks";
import { deleteTask, updateTask } from "../../../services/api/tasks";
import { useToastStore } from "../../../store/toast-store";

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
  const { data, isLoading, error, refetch } = useTasksByStatus();
  const { data: projects } = useProjects();
  const pushToast = useToastStore((state) => state.pushToast);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [mutatingTaskId, setMutatingTaskId] = useState<string | null>(null);

  async function changeTaskStatus(task: Task, status: Task["status"]) {
    setMutatingTaskId(task.id);

    try {
      await updateTask(task.id, { status });
      pushToast({
        title: "Task updated",
        description: `Moved \"${task.title}\" to ${statusLabels[status]}.`,
        tone: "success"
      });
      refetch();
    } catch (taskError) {
      pushToast({
        title: "Task update failed",
        description: taskError instanceof Error ? taskError.message : "Unable to update task",
        tone: "error"
      });
    } finally {
      setMutatingTaskId(null);
    }
  }

  async function handleDeleteTask(task: Task) {
    const confirmed = window.confirm(`Delete task \"${task.title}\"? This cannot be undone.`);
    if (!confirmed) {
      return;
    }

    setMutatingTaskId(task.id);

    try {
      await deleteTask(task.id);
      pushToast({
        title: "Task deleted",
        description: `Removed "${task.title}" from the queue.`,
        tone: "success"
      });
      refetch();
    } catch (taskError) {
      pushToast({
        title: "Task delete failed",
        description: taskError instanceof Error ? taskError.message : "Unable to delete task",
        tone: "error"
      });
    } finally {
      setMutatingTaskId(null);
    }
  }

  return (
    <div className="space-y-6">
      <TaskEditorModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSaved={refetch}
        projects={projects ?? []}
        task={editingTask}
      />

      <div className="flex flex-col gap-4 rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-soft backdrop-blur lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-slate-500">Tasks</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">Execution queue</h1>
          <p className="mt-2 text-sm text-slate-600">Monitor work in flight by status and priority.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsTaskModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" /> Add task
          </button>
          <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950">
            Back to overview <ArrowUpRight className="h-4 w-4" />
          </Link>
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
                        <p className="mt-1 text-sm text-slate-600">{task.project?.name ?? "No project"}</p>
                        {task.description ? <p className="mt-2 text-sm text-slate-500">{task.description}</p> : null}
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                        {task.priority}
                      </span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {(Object.keys(statusLabels) as Array<keyof typeof statusLabels>).map((status) => (
                        <button
                          key={status}
                          type="button"
                          disabled={mutatingTaskId === task.id}
                          onClick={() => changeTaskStatus(task, status)}
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition ${
                            task.status === status
                              ? "bg-slate-950 text-white"
                              : "bg-white text-slate-600 hover:bg-slate-100"
                          } disabled:cursor-not-allowed disabled:opacity-50`}
                        >
                          {task.status === status ? <CheckCircle2 className="h-3.5 w-3.5" /> : <RotateCcw className="h-3.5 w-3.5" />}
                          {statusLabels[status]}
                        </button>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                      <span>{task.assignee?.name ?? "Unassigned"}</span>
                      <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}</span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-200 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingTask(task);
                          setIsTaskModalOpen(true);
                        }}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
                      >
                        <PencilLine className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button
                        type="button"
                        disabled={mutatingTaskId === task.id}
                        onClick={() => handleDeleteTask(task)}
                        className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
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

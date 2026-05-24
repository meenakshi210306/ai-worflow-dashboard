"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { PencilLine, Plus, Save, X } from "lucide-react";

import type { Project } from "../../services/api/projects";
import type { Task } from "../../services/api/tasks";
import { createTask, updateTask } from "../../services/api/tasks";
import { useToastStore } from "../../store/toast-store";

const taskEditorSchema = z.object({
  projectId: z.string().min(1, "Select a project"),
  title: z.string().trim().min(1, "Task title is required").max(200),
  description: z.string().trim().max(1000).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
  dueDate: z.string().optional()
});

type TaskEditorForm = z.infer<typeof taskEditorSchema>;

type TaskEditorModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
  projects: Project[];
  defaultProjectId?: string;
  task?: Task | null;
};

function formatDateTimeLocal(value?: string | null) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const pad = (number: number) => String(number).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function TaskEditorModal({
  isOpen,
  onClose,
  onSaved,
  projects,
  defaultProjectId,
  task
}: TaskEditorModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pushToast = useToastStore((state) => state.pushToast);
  const isEditing = useMemo(() => Boolean(task), [task]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<TaskEditorForm>({
    resolver: zodResolver(taskEditorSchema as never),
    defaultValues: {
      projectId: defaultProjectId ?? projects[0]?.id ?? "",
      title: "",
      description: "",
      priority: "MEDIUM",
      status: "TODO",
      dueDate: ""
    }
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    reset({
      projectId: task?.projectId ?? defaultProjectId ?? projects[0]?.id ?? "",
      title: task?.title ?? "",
      description: task?.description ?? "",
      priority: task?.priority ?? "MEDIUM",
      status: task?.status ?? "TODO",
      dueDate: formatDateTimeLocal(task?.dueDate ?? null)
    });
  }, [defaultProjectId, isOpen, projects, reset, task]);

  async function onSubmit(values: TaskEditorForm) {
    setIsSubmitting(true);

    try {
      if (isEditing && task) {
        await updateTask(task.id, {
          title: values.title,
          description: values.description || undefined,
          priority: values.priority,
          status: values.status,
          dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : undefined
        });

        pushToast({
          title: "Task updated",
          description: `Task "${values.title}" updated successfully.`,
          tone: "success"
        });
      } else {
        await createTask({
          projectId: values.projectId,
          title: values.title,
          description: values.description || undefined,
          priority: values.priority,
          status: values.status,
          dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : undefined
        });

        pushToast({
          title: "Task created",
          description: `Task "${values.title}" created successfully.`,
          tone: "success"
        });
      }

      reset({
        projectId: defaultProjectId ?? projects[0]?.id ?? "",
        title: "",
        description: "",
        priority: "MEDIUM",
        status: "TODO",
        dueDate: ""
      });
      onSaved?.();
      onClose();
    } catch (error) {
      pushToast({
        title: isEditing ? "Task update failed" : "Task creation failed",
        description: error instanceof Error ? error.message : "Unable to save task",
        tone: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 24, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="flex w-full max-w-2xl flex-col overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-slate-950 p-3 text-white">
                  {isEditing ? <PencilLine className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">
                    {isEditing ? "Edit task" : "Create task"}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {isEditing ? "Update status, priority, and details." : "Add a task manually to any project."}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5 px-6 py-6 md:grid-cols-2">
              {!isEditing ? (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-950">Project</label>
                  <select
                    {...register("projectId")}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-950 transition focus:border-slate-950 focus:outline-none focus:ring-1 focus:ring-slate-950"
                  >
                    <option value="">Select project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                  {errors.projectId ? <p className="mt-1 text-sm text-rose-600">{errors.projectId.message}</p> : null}
                </div>
              ) : null}

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-950">Task title</label>
                <input
                  type="text"
                  {...register("title")}
                  placeholder="Describe the task"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-950 placeholder-slate-400 transition focus:border-slate-950 focus:outline-none focus:ring-1 focus:ring-slate-950"
                />
                {errors.title ? <p className="mt-1 text-sm text-rose-600">{errors.title.message}</p> : null}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-950">Description</label>
                <textarea
                  {...register("description")}
                  placeholder="Optional task details"
                  rows={4}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-950 placeholder-slate-400 transition focus:border-slate-950 focus:outline-none focus:ring-1 focus:ring-slate-950"
                />
                {errors.description ? <p className="mt-1 text-sm text-rose-600">{errors.description.message}</p> : null}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-950">Priority</label>
                <select
                  {...register("priority")}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-950 transition focus:border-slate-950 focus:outline-none focus:ring-1 focus:ring-slate-950"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
                {errors.priority ? <p className="mt-1 text-sm text-rose-600">{errors.priority.message}</p> : null}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-950">Status</label>
                <select
                  {...register("status")}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-950 transition focus:border-slate-950 focus:outline-none focus:ring-1 focus:ring-slate-950"
                >
                  <option value="TODO">To do</option>
                  <option value="IN_PROGRESS">In progress</option>
                  <option value="DONE">Done</option>
                </select>
                {errors.status ? <p className="mt-1 text-sm text-rose-600">{errors.status.message}</p> : null}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-950">Due date</label>
                <input
                  type="datetime-local"
                  {...register("dueDate")}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-950 transition focus:border-slate-950 focus:outline-none focus:ring-1 focus:ring-slate-950"
                />
              </div>

              <div className="md:col-span-2 flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {isSubmitting ? (isEditing ? "Saving..." : "Creating...") : isEditing ? "Save task" : "Create task"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

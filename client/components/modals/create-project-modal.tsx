"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { createProject } from "../../services/api/projects";
import { useToastStore } from "../../store/toast-store";

const createProjectSchema = z.object({
  name: z.string().trim().min(1, "Project name is required").max(100),
  description: z.string().trim().max(500).optional()
});

type CreateProjectForm = z.infer<typeof createProjectSchema>;

type CreateProjectModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
};

export function CreateProjectModal({ isOpen, onClose, onCreated }: CreateProjectModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pushToast = useToastStore((state) => state.pushToast);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<CreateProjectForm>({
    resolver: zodResolver(createProjectSchema as never),
    defaultValues: {
      name: "",
      description: ""
    }
  });

  async function onSubmit(values: CreateProjectForm) {
    setIsSubmitting(true);

    try {
      await createProject(values);
      pushToast({
        title: "Project created",
        description: `Project "${values.name}" created successfully.`,
        tone: "success"
      });
      reset();
      onClose();
      onCreated?.();
    } catch (error) {
      pushToast({
        title: "Project creation failed",
        description: error instanceof Error ? error.message : "Unable to create project",
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
            className="flex w-full max-w-md flex-col overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-slate-950 p-3 text-white">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">Create project</h2>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 px-6 py-6">
              <div>
                <label className="block text-sm font-medium text-slate-950">Project name</label>
                <input
                  type="text"
                  {...register("name")}
                  placeholder="Enter project name"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-950 placeholder-slate-400 transition focus:border-slate-950 focus:outline-none focus:ring-1 focus:ring-slate-950"
                />
                {errors.name && <p className="mt-1 text-sm text-rose-600">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-950">Description</label>
                <textarea
                  {...register("description")}
                  placeholder="Optional project description"
                  rows={4}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-950 placeholder-slate-400 transition focus:border-slate-950 focus:outline-none focus:ring-1 focus:ring-slate-950"
                />
                {errors.description && <p className="mt-1 text-sm text-rose-600">{errors.description.message}</p>}
              </div>

              <div className="flex gap-3 pt-4">
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
                  className="flex-1 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Create project"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

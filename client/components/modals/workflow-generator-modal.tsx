"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Bot, Loader2, Sparkles, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";

import { generateWorkflow } from "../../services/api/ai";
import { useToastStore } from "../../store/toast-store";
import type { GeneratedWorkflow } from "../../types/dashboard";
import { z } from "zod";

const workflowPromptSchema = z.object({
  prompt: z.string().trim().min(10, "Describe the workflow in at least 10 characters").max(1000)
});

type WorkflowPromptForm = z.infer<typeof workflowPromptSchema>;

type WorkflowGeneratorModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onGenerated?: (workflow: GeneratedWorkflow) => void;
};

export function WorkflowGeneratorModal({ isOpen, onClose, onGenerated }: WorkflowGeneratorModalProps) {
  const [generatedWorkflow, setGeneratedWorkflow] = useState<GeneratedWorkflow | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pushToast = useToastStore((state) => state.pushToast);
  const params = useParams();
  const projectId = params?.projectId as string | undefined;

  const defaultPrompt = useMemo(() => "Create onboarding workflow for a startup client", []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<WorkflowPromptForm>({
    resolver: zodResolver(workflowPromptSchema as never),
    defaultValues: { prompt: defaultPrompt }
  });

  useEffect(() => {
    if (!isOpen) {
      setGeneratedWorkflow(null);
      reset({ prompt: defaultPrompt });
    }
  }, [defaultPrompt, isOpen, reset]);

  async function onSubmit(values: WorkflowPromptForm) {
    setIsSubmitting(true);

    try {
      const response = await generateWorkflow({
        ...values,
        projectId
      });
      setGeneratedWorkflow(response.workflow);
      onGenerated?.(response.workflow);
      pushToast({
        title: "Workflow generated",
        description: `${response.workflow.tasks.length} tasks were created from your prompt.`,
        tone: "success"
      });
    } catch (error) {
      pushToast({
        title: "Workflow generation failed",
        description: error instanceof Error ? error.message : "Unable to generate workflow",
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
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 px-4 py-4 sm:items-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 24, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-slate-950 p-3 text-white">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.22em] text-slate-500">AI workflow generator</p>
                  <h2 className="text-xl font-semibold text-slate-950">Generate an execution plan</h2>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl border border-slate-200 bg-white p-2 text-slate-600 transition hover:border-slate-300 hover:text-slate-950"
                aria-label="Close workflow generator"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid flex-1 gap-6 overflow-y-auto p-6 lg:grid-cols-[0.9fr_1.1fr]">
              <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                <div>
                  <label htmlFor="workflow-prompt" className="text-sm font-medium text-slate-700">
                    Workflow prompt
                  </label>
                  <textarea
                    id="workflow-prompt"
                    rows={8}
                    placeholder="Create onboarding workflow for a startup client"
                    className="mt-2 w-full rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
                    {...register("prompt")}
                  />
                  {errors.prompt ? <p className="mt-2 text-sm text-rose-600">{errors.prompt.message}</p> : null}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {isSubmitting ? "Generating workflow..." : "Generate workflow"}
                </button>

                <p className="text-xs leading-5 text-slate-500">
                  The backend uses OpenAI when configured and stores every generated workflow in PostgreSQL.
                </p>
              </form>

              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                {generatedWorkflow ? (
                  <div className="space-y-5">
                    <div>
                      <p className="text-sm font-medium uppercase tracking-[0.22em] text-slate-500">Generated result</p>
                      <h3 className="mt-2 text-2xl font-semibold text-slate-950">{generatedWorkflow.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{generatedWorkflow.summary}</p>
                    </div>

                    <div className="space-y-3">
                      {generatedWorkflow.tasks.map((task) => (
                        <article key={task.title} className="rounded-2xl border border-white bg-white p-4 shadow-sm">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h4 className="font-semibold text-slate-950">{task.title}</h4>
                              <p className="mt-1 text-sm text-slate-600">{task.description}</p>
                            </div>
                            <div className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                              {task.priority}
                            </div>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                            <span className="rounded-full bg-slate-100 px-3 py-1">Owner: {task.owner}</span>
                            <span className="rounded-full bg-slate-100 px-3 py-1">ETA: {task.eta}</span>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full min-h-[24rem] flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-slate-300 bg-white px-6 text-center">
                    <div className="rounded-full bg-slate-950 p-4 text-white shadow-soft">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <p className="mt-4 text-lg font-semibold text-slate-950">Generated workflow preview</p>
                    <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                      Your AI plan will appear here with concrete tasks, owners, and timing once the backend responds.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

"use client";

import { Sparkles } from "lucide-react";
import { useState } from "react";

import { WorkflowGeneratorModal } from "../../../components/modals/workflow-generator-modal";
import { useWorkflowSuggestions } from "../../../hooks/use-workflow-suggestions";

export default function AiSuggestionsPage() {
  const { data, isLoading, error, refresh } = useWorkflowSuggestions();
  const [isWorkflowOpen, setIsWorkflowOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-soft backdrop-blur lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-slate-500">AI Suggestions</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">Workflow generation center</h1>
          <p className="mt-2 text-sm text-slate-600">Generate structured execution plans and review the latest saved outputs.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsWorkflowOpen(true)}
          className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <Sparkles className="h-4 w-4" />
          Generate workflow
        </button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }, (_, index) => (
            <div key={index} className="h-64 animate-pulse rounded-[2rem] border border-white/70 bg-white/75 shadow-soft" />
          ))}
        </div>
      ) : null}

      <div className="grid gap-4">
        {data.map((suggestion) => (
          <article key={suggestion.id} className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-soft backdrop-blur transition hover:-translate-y-0.5 hover:shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.22em] text-slate-500">{new Date(suggestion.createdAt).toLocaleString()}</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">{suggestion.result.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{suggestion.result.summary}</p>
              </div>
              <Sparkles className="h-5 w-5 text-slate-500" />
            </div>

            <div className="mt-5 grid gap-3 lg:grid-cols-2">
              {suggestion.result.tasks.map((task) => (
                <div key={task.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-950">{task.title}</h3>
                      <p className="mt-1 text-sm text-slate-600">{task.description}</p>
                    </div>
                    <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                      {task.priority}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                    <span className="rounded-full bg-white px-3 py-1 shadow-sm">Owner: {task.owner}</span>
                    <span className="rounded-full bg-white px-3 py-1 shadow-sm">ETA: {task.eta}</span>
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>

      {!isLoading && data.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/70 p-10 text-center text-slate-600 shadow-soft">
          No generated workflows yet. Open the generator and create the first plan.
        </div>
      ) : null}

      {error ? <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">{error}</div> : null}

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

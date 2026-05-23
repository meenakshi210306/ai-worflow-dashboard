"use client";

import Link from "next/link";
import { ArrowUpRight, FolderKanban, Plus } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

import { useProjects } from "../../../hooks/use-projects";
import { CreateProjectModal } from "../../../components/modals/create-project-modal";

export default function ProjectsPage() {
  const { data, isLoading, error } = useProjects();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  // Filter projects based on search query
  const filteredProjects = data?.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  ) ?? null;

  return (
    <div className="space-y-6">
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={() => {
          // Refresh projects
          window.location.reload();
        }}
      />

      <div className="flex flex-col gap-4 rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-soft backdrop-blur lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-slate-500">Projects</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">Delivery workspace</h1>
          <p className="mt-2 text-sm text-slate-600">Track every active board with progress, ownership, and delivery state.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            Add project
          </button>
          <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950">
            Back to overview <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {isLoading && !data ? <div className="h-72 animate-pulse rounded-[2rem] border border-white/70 bg-white/75 shadow-soft" /> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {data?.map((project) => (
          <Link href={`/dashboard/projects/${project.id}`} key={project.id}>
            <article className="h-full rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-soft backdrop-blur transition hover:-translate-y-0.5 hover:shadow-xl">
              <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                  <FolderKanban className="h-3.5 w-3.5" />
                  {project.status}
                </div>
                <h2 className="mt-4 text-2xl font-semibold text-slate-950">{project.name}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{project.description ?? "No description provided"}</p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Created</p>
                <p className="mt-2 text-sm font-medium text-slate-950">{new Date(project.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Updated</p>
                <p className="mt-2 text-sm font-medium text-slate-950">{new Date(project.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>
          </article>
          </Link>
        ))}
      </div>

      {!isLoading && (!data || data.length === 0) ? (
        <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/70 p-10 text-center text-slate-600 shadow-soft">
          No projects yet. Create your first workspace board to start tracking delivery.
        </div>
      ) : null}

      {error ? <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">{error}</div> : null}
    </div>
  );
}

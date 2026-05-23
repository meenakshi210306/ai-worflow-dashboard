const stats = [
  { label: "Active projects", value: "12" },
  { label: "Tasks in motion", value: "48" },
  { label: "AI suggestions", value: "26" }
];

const phases = [
  {
    title: "Phase 1",
    description: "Project foundation, TypeScript, Tailwind, Express, Prisma, and Docker setup."
  },
  {
    title: "Phase 2",
    description: "Authentication with JWT, password hashing, and protected routes."
  },
  {
    title: "Phase 3",
    description: "Dashboard UI, navigation, analytics cards, and reusable components."
  }
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-dashboard-grid bg-[length:40px_40px]">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl items-center px-6 py-12 lg:px-10">
        <section className="grid w-full gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="flex flex-col justify-center gap-6">
            <div className="inline-flex w-fit items-center rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm backdrop-blur">
              AI Workflow Automation Dashboard
            </div>
            <div className="max-w-2xl space-y-4">
              <h1 className="font-[family:var(--font-heading)] text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
                Build and manage intelligent workflows with startup-grade clarity.
              </h1>
              <p className="max-w-xl text-lg leading-8 text-slate-600">
                A production-ready foundation for projects, tasks, AI-generated suggestions, activity logs, and analytics.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href="#roadmap"
                className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                View roadmap
              </a>
              <a
                href="#architecture"
                className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-400"
              >
                Explore architecture
              </a>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-3xl border border-white/70 bg-white/75 p-5 shadow-soft backdrop-blur">
                  <div className="text-3xl font-semibold text-slate-950">{stat.value}</div>
                  <div className="mt-1 text-sm text-slate-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur">
            <div className="rounded-3xl bg-slate-950 p-6 text-white">
              <div className="text-sm uppercase tracking-[0.24em] text-slate-300">Workspace overview</div>
              <div className="mt-4 space-y-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-sm text-slate-300">Current sprint</div>
                  <div className="mt-1 text-xl font-semibold">Foundation build</div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-sm text-slate-300">Backend</div>
                    <div className="mt-1 font-semibold">Express + Prisma</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-sm text-slate-300">Frontend</div>
                    <div className="mt-1 font-semibold">Next.js App Router</div>
                  </div>
                </div>
              </div>
            </div>

            <div id="architecture" className="mt-6 space-y-4">
              <h2 className="font-[family:var(--font-heading)] text-2xl font-semibold text-slate-950">Phase 1 architecture</h2>
              <div className="space-y-3">
                {phases.map((phase) => (
                  <div key={phase.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">{phase.title}</div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{phase.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

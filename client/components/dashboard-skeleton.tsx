export function DashboardSkeleton() {
  return (
    <main className="min-h-screen px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <div className="h-24 animate-pulse rounded-[2rem] border border-white/70 bg-white/75 shadow-soft" />
        <div className="grid gap-4 md:grid-cols-3">
          <div className="h-36 animate-pulse rounded-[1.75rem] border border-white/70 bg-white/75 shadow-soft" />
          <div className="h-36 animate-pulse rounded-[1.75rem] border border-white/70 bg-white/75 shadow-soft" />
          <div className="h-36 animate-pulse rounded-[1.75rem] border border-white/70 bg-white/75 shadow-soft" />
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="h-80 animate-pulse rounded-[2rem] border border-white/70 bg-white/75 shadow-soft" />
          <div className="h-80 animate-pulse rounded-[2rem] border border-white/70 bg-white/75 shadow-soft" />
        </div>
      </div>
    </main>
  );
}

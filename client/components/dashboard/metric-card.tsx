import type { ReactNode } from "react";
import { motion } from "framer-motion";

import { AnimatedCounter } from "./animated-counter";

type MetricCardProps = {
  label: string;
  value: number;
  note: string;
  icon: ReactNode;
  tone?: "blue" | "emerald" | "amber";
};

const toneStyles = {
  blue: "from-sky-50 to-white text-sky-700 border-sky-100",
  emerald: "from-emerald-50 to-white text-emerald-700 border-emerald-100",
  amber: "from-amber-50 to-white text-amber-700 border-amber-100"
} as const;

export function MetricCard({ label, value, note, icon, tone = "blue" }: MetricCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`rounded-[1.75rem] border bg-gradient-to-br p-6 shadow-soft backdrop-blur ${toneStyles[tone]}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-slate-500">{label}</p>
          <div className="mt-4 text-4xl font-semibold text-slate-950">
            <AnimatedCounter value={value} />
          </div>
        </div>
        <div className="rounded-2xl border border-white/70 bg-white/80 p-3 text-slate-700 shadow-sm">{icon}</div>
      </div>
      <p className="mt-3 text-sm text-slate-500">{note}</p>
    </motion.article>
  );
}

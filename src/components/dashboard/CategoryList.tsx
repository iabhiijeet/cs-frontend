"use client";

import { useState } from "react";
import { motion } from "motion/react";
import CountUp from "@/components/dashboard/CountUp";
import { EASE } from "@/lib/animations";
import { useDashboardContext } from "@/hooks/useDashboardContext";

export default function CategoryList({ delay = 0 }: { delay?: number }) {
  const { data: { CATEGORIES } } = useDashboardContext();
  const [hover, setHover] = useState<number | null>(null);

  // Sophisticated bar colors — navy → teal → indigo progression
  const BAR_COLORS = [
    { from: "#1e3a5f", to: "#2563eb" },
    { from: "#0e4c6e", to: "#0891b2" },
    { from: "#312e81", to: "#6366f1" },
    { from: "#1e3a5f", to: "#3b82f6" },
    { from: "#134e4a", to: "#0d9488" },
    { from: "#1e1b4b", to: "#8b5cf6" },
  ];

  return (
    <div className="flex flex-col">
      <div className="mb-[4px] flex justify-end">
        <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400">tCO₂e</span>
      </div>

      <div className="flex flex-col gap-[20px]">
        {CATEGORIES.map((c: any, i: number) => {
          const bar = BAR_COLORS[i % BAR_COLORS.length];
          return (
            <motion.div
              key={c.name}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.05 * i + delay }}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              className="group cursor-default"
            >
              <div className="mb-[7px] flex items-baseline justify-between gap-[12px]">
                <span className={`flex min-w-0 items-baseline gap-[8px] text-[13px] font-medium transition-colors duration-200 ${hover === i ? "text-slate-900" : "text-slate-600"}`}>
                  <span className="truncate">{c.name}</span>
                  <span className="shrink-0 rounded-[4px] bg-slate-100 px-[5px] py-[1px] text-[10px] font-semibold text-slate-500">{c.scope}</span>
                </span>
                <span className="flex shrink-0 items-baseline gap-[8px]">
                  <span className={`text-[11px] tabular-nums font-medium ${c.trend < 0 ? "text-emerald-600" : "text-slate-400"}`}>
                    {c.trend > 0 ? "+" : ""}{c.trend}%
                  </span>
                  <span className={`text-[13px] font-semibold tabular-nums transition-colors duration-200 ${hover === i ? "text-slate-900" : "text-slate-700"}`}>
                    <CountUp value={c.value} delay={delay + 0.1 * i} />
                  </span>
                </span>
              </div>
              <div className="h-[5px] w-full overflow-hidden rounded-full bg-slate-100">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(c.value / CATEGORIES[0].value) * 100}%` }}
                  transition={{ duration: 1, ease: EASE, delay: 0.1 * i + delay }}
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${bar.from}, ${bar.to})`,
                    opacity: hover === i ? 1 : 0.75,
                  }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { EASE } from "@/lib/animations";

export interface BarDatum {
  label: string;
  value: number;
  color?: string;
}

interface VerticalBarsProps {
  data: BarDatum[];
  height?: number;
  delay?: number;
  suffix?: string;
  gridLines?: number;
}

export default function VerticalBars({ data, height = 220, delay = 0, suffix = "", gridLines = 4 }: VerticalBarsProps) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...data.map((d) => d.value));
  const niceMax = Math.ceil(max / 100) * 100;

  return (
    <div className="flex gap-[0px]">

      {/* ── Chart area ── */}
      <div className="flex-1 overflow-x-auto">
        <div style={{ minWidth: `${data.length * 70}px` }}>
          <div className="relative pt-[36px]" style={{ height }}>
            {/* Grid lines */}
            {Array.from({ length: gridLines }).map((_, i) => {
              const t = i / (gridLines - 1);
              return (
                <div
                  key={i}
                  className="absolute inset-x-0 h-px border-t border-dashed border-slate-200/70"
                  style={{ top: `calc(36px + ${t * (height - 36)}px)` }}
                />
              );
            })}

            {/* Bars */}
            <div className="absolute inset-x-0 bottom-0 top-[36px] flex items-end gap-[8px] md:gap-[12px]">
              {data.map((d, i) => {
                const pct = (d.value / niceMax) * 100;
                const active = hover === i;
                return (
                  <div
                    key={d.label}
                    className="group flex h-full min-w-0 flex-1 cursor-default flex-col justify-end"
                    onMouseEnter={() => setHover(i)}
                    onMouseLeave={() => setHover(null)}
                  >
                    <div className="relative flex h-full flex-col justify-end">
                      <AnimatePresence>
                        {active && (
                          <motion.div
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 4 }}
                            transition={{ duration: 0.15 }}
                            className="pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-[8px] border border-indigo-100/60 bg-white/90 backdrop-blur-md px-[9px] py-[4px] text-[11px] font-semibold tabular-nums text-indigo-700 shadow-[0_6px_20px_rgba(55,48,163,0.12)]"
                            style={{ bottom: "calc(100% + 8px)" }}
                          >
                            {d.value.toLocaleString()}{suffix}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${pct}%` }}
                        transition={{ duration: 0.9, ease: EASE, delay: delay + i * 0.08 }}
                        className="relative w-full overflow-hidden rounded-t-[6px]"
                        style={{
                          background: active
                            ? d.color ?? "#4f46e5"
                            : `linear-gradient(180deg, ${d.color ?? "#6366f1"}, ${d.color ?? "#4f46e5"}90)`,
                          opacity: active ? 1 : 0.85,
                          transition: "opacity 0.2s",
                        }}
                      >
                        <div className="absolute inset-x-0 top-0 h-[2px] bg-white/30" />
                      </motion.div>
                    </div>

                    <p
                      className={`mt-[8px] truncate text-center text-[10.5px] font-medium transition-colors duration-200 ${
                        active ? "text-indigo-600" : "text-slate-400"
                      }`}
                    >
                      {d.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

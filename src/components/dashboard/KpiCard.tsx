"use client";

import { motion } from "motion/react";
import { ArrowDownRight, ArrowUpRight } from "@phosphor-icons/react";
import CountUp from "@/components/dashboard/CountUp";
import { EASE } from "@/lib/animations";

export interface Kpi {
  label: string;
  value: number;
  decimals?: number;
  suffix?: string;
  delta: number;
  deltaLabel: string;
  good: boolean;
  spark: number[];
}

export default function KpiCard({ kpi, delay }: { kpi: Kpi; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE, delay }}
      whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(55,48,163,0.08)" }}
      className="group flex flex-col rounded-[20px] border border-white/60 bg-white/70 backdrop-blur-2xl p-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300"
    >
      <p className="text-[13px] font-semibold uppercase tracking-[0.06em] text-slate-500">{kpi.label}</p>

      <div className="mt-[16px] flex flex-col gap-[8px]">
        <p className="text-[28px] xl:text-[32px] font-bold leading-none tracking-tight tabular-nums text-slate-900">
          <CountUp value={kpi.value} decimals={kpi.decimals ?? 0} suffix={kpi.suffix} delay={delay + 0.15} />
        </p>

        <div className="flex items-center justify-between gap-[8px]">
          <span
            className={`flex shrink-0 items-center gap-[2px] rounded-full px-[8px] py-[3px] text-[11.5px] font-bold tabular-nums ${
              kpi.good
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-600"
            }`}
          >
            {kpi.delta >= 0 ? <ArrowUpRight size={11} weight="bold" /> : <ArrowDownRight size={11} weight="bold" />}
            {Math.abs(kpi.delta)}%
          </span>
          <span className="text-[12.5px] font-medium text-slate-500">{kpi.deltaLabel}</span>
        </div>
      </div>
    </motion.div>
  );
}

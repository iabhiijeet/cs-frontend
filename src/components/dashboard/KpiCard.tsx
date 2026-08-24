"use client";

import { motion } from "motion/react";
import { ArrowDownRight, ArrowUpRight } from "@phosphor-icons/react";
import CountUp from "@/components/dashboard/CountUp";
import Sparkline from "@/components/dashboard/Sparkline";
import { EASE } from "@/lib/animations";
import type { Kpi } from "@/lib/demo-data";

export default function KpiCard({ kpi, delay }: { kpi: Kpi; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE, delay }}
      whileHover={{ y: -3, boxShadow: "0 8px 24px rgba(15,23,42,0.10)" }}
      className="group flex flex-col rounded-[16px] border border-slate-100 bg-white p-[20px] shadow-[0_1px_4px_rgba(15,23,42,0.06)] transition-shadow"
    >
      <div className="flex items-center justify-between gap-[8px]">
        <p className="text-[12px] font-medium uppercase tracking-[0.06em] text-slate-400">{kpi.label}</p>
        <span
          className={`flex shrink-0 items-center gap-[2px] rounded-full px-[7px] py-[2px] text-[10.5px] font-semibold tabular-nums ${
            kpi.good
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-600"
          }`}
        >
          {kpi.delta >= 0 ? <ArrowUpRight size={11} weight="bold" /> : <ArrowDownRight size={11} weight="bold" />}
          {Math.abs(kpi.delta)}%
        </span>
      </div>

      <div className="mt-[14px] flex items-end justify-between gap-[12px]">
        <p className="text-[28px] font-bold leading-none tracking-[-1px] tabular-nums text-slate-900">
          <CountUp value={kpi.value} decimals={kpi.decimals ?? 0} suffix={kpi.suffix} delay={delay + 0.15} />
        </p>
        <Sparkline data={kpi.spark} color={kpi.good ? "#0e7490" : "#dc2626"} />
      </div>

      <p className="mt-[10px] text-[11.5px] text-slate-400">{kpi.deltaLabel}</p>
    </motion.div>
  );
}

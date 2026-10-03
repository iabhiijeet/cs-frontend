"use client";

import { useDashboardContext } from "@/hooks/useDashboardContext";
import { CheckCircle, ClockCounterClockwise, WarningCircle, FileText, PauseCircle, Calculator, Prohibit } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { EASE } from "@/lib/animations";

export default function ActivityStatsPanel({ delay = 0 }: { delay?: number }) {
  const { data: { ACTIVITY_STATS } } = useDashboardContext();

  const stats = [
    { label: "Total", value: ACTIVITY_STATS.total, icon: <FileText size={16} />, color: "text-slate-500", bg: "bg-slate-100" },
    { label: "Draft", value: ACTIVITY_STATS.draft, icon: <PauseCircle size={16} />, color: "text-slate-400", bg: "bg-slate-50" },
    { label: "Submitted", value: ACTIVITY_STATS.submitted, icon: <ClockCounterClockwise size={16} />, color: "text-cyan-700", bg: "bg-cyan-50" },
    { label: "Under Review", value: ACTIVITY_STATS.underReview, icon: <WarningCircle size={16} />, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Verified", value: ACTIVITY_STATS.verified, icon: <CheckCircle size={16} />, color: "text-teal-700", bg: "bg-teal-50" },
    { label: "Calculated", value: ACTIVITY_STATS.calculated, icon: <Calculator size={16} />, color: "text-emerald-700", bg: "bg-emerald-50" },
    { label: "Rejected", value: ACTIVITY_STATS.rejected, icon: <Prohibit size={16} />, color: "text-red-500", bg: "bg-red-50" },
  ];

  return (
    <div className="grid grid-cols-2 gap-[10px] sm:grid-cols-4 lg:grid-cols-7">
      {stats.map((stat, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE, delay: delay + i * 0.05 }}
          className="flex flex-col gap-[10px] rounded-[14px] border border-slate-100 bg-white p-[14px] shadow-[0_1px_3px_rgba(15,23,42,0.05)]"
        >
          <div className={`flex h-[32px] w-[32px] items-center justify-center rounded-[8px] ${stat.bg} ${stat.color}`}>
            {stat.icon}
          </div>
          <div>
            <span className="block text-[11px] font-medium uppercase tracking-[0.05em] text-slate-400">{stat.label}</span>
            <span className="block text-[20px] font-bold text-slate-900 leading-tight">{stat.value}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

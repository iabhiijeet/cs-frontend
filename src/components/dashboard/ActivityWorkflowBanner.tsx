"use client";

import { motion } from "framer-motion";
import { Info, ArrowRight, CheckCircle, Clock, Sparkle } from "@phosphor-icons/react";

interface ActivityWorkflowBannerProps {
  draftCount: number;
}

export default function ActivityWorkflowBanner({ draftCount }: ActivityWorkflowBannerProps) {
  if (draftCount === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center rounded-xl border border-teal-200 bg-teal-50/70 p-4 shadow-sm"
    >
      <div className="flex gap-3">
        <div className="mt-0.5 flex shrink-0 items-center justify-center rounded-full bg-teal-100 p-1.5 text-teal-700">
          <Info size={16} weight="bold" />
        </div>
        <div>
          <h3 className="text-[14px] font-bold text-teal-900">
            You have {draftCount} draft {draftCount === 1 ? "activity" : "activities"} waiting
          </h3>
          <p className="mt-1 text-[13px] text-teal-800/80 max-w-[500px]">
            Data in draft status is not included in your carbon footprint. Submit these items for review so your administrator can verify and calculate them.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-lg bg-white/80 px-3 py-2 text-[11px] font-semibold text-slate-500 shadow-sm border border-teal-100 shrink-0">
        <span className="flex items-center gap-1 text-amber-600">
          <Clock size={12} weight="fill" /> 1. Draft
        </span>
        <ArrowRight size={10} className="text-slate-300" weight="bold" />
        <span className="flex items-center gap-1 text-teal-700">
          <Sparkle size={12} weight="fill" /> 2. Submit
        </span>
        <ArrowRight size={10} className="text-slate-300" weight="bold" />
        <span className="flex items-center gap-1 text-emerald-600">
          <CheckCircle size={12} weight="fill" /> 3. Verified & Calculated
        </span>
      </div>
    </motion.div>
  );
}

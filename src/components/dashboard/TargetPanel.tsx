"use client";

import { motion } from "motion/react";
import Link from "next/link";
import CountUp from "@/components/dashboard/CountUp";
import { EASE } from "@/lib/animations";
import { useDashboardContext } from "@/hooks/useDashboardContext";
import { PencilSimple, Target as TargetIcon } from "@phosphor-icons/react";

export default function TargetPanel({ delay = 0 }: { delay?: number }) {
  const { data: { TARGETS, TOTAL_12M } } = useDashboardContext();

  if (!TARGETS || TARGETS.length < 2) {
    return (
      <div className="flex h-full flex-col items-center justify-center border border-dashed border-slate-200 rounded-[14px] bg-slate-50 p-6 text-center">
        <TargetIcon size={24} className="mb-3 text-slate-300" />
        <p className="text-[13.5px] font-semibold text-slate-800 mb-1">No Targets Set</p>
        <p className="text-[12px] text-slate-500 mb-4">Establish a baseline and set targets to track progress here.</p>
        <Link href="/targets" className="rounded-full bg-slate-900 px-[14px] py-[6px] text-[12px] font-medium text-white hover:bg-slate-700 transition-colors">
          Set Target
        </Link>
      </div>
    );
  }

  const baseline = TARGETS[0];
  const target = TARGETS[TARGETS.length - 1];

  const baselineVal = baseline.value;
  const targetVal = target.value;

  const reductionRequired = baselineVal - targetVal;
  const reductionAchieved = baselineVal - TOTAL_12M;

  const reductionProgress = reductionRequired > 0
    ? Math.max(0, Math.min(100, (reductionAchieved / reductionRequired) * 100))
    : 0;

  const reductionPct = Math.round(((baselineVal - targetVal) / baselineVal) * 100);
  const onTrack = reductionProgress >= 40;

  return (
    <div className="flex h-full flex-col">
      <div className="mb-[14px] flex justify-end">
        <div className="flex items-center gap-[8px]">
          <a
            href="/targets"
            className="flex items-center gap-[4px] rounded-full border border-slate-200 px-[10px] py-[4px] text-[11px] font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            <PencilSimple size={11} />
            Edit target
          </a>
          <span className={`rounded-full px-[9px] py-[3px] text-[11px] font-semibold ${onTrack ? "bg-teal-50 text-teal-700" : "bg-amber-50 text-amber-700"}`}>
            {reductionProgress >= 100 ? "Target Achieved" : onTrack ? "On track" : "Needs attention"}
          </span>
        </div>
      </div>

      <div className="mt-[24px] flex items-baseline gap-[8px]">
        <p className="text-[36px] font-bold leading-none tracking-[-1.5px] tabular-nums text-slate-900">
          <CountUp value={reductionProgress} decimals={0} suffix="%" delay={delay + 0.2} />
        </p>
        <p className="text-[13px] text-slate-500">of ↓{reductionPct}% target met</p>
      </div>

      {/* Progress bar */}
      <div className="mt-[20px]">
        <div className="h-[8px] w-full overflow-hidden rounded-full bg-slate-100">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${reductionProgress}%` }}
            transition={{ duration: 1.4, ease: EASE, delay: delay + 0.3 }}
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #0f766e, #06b6d4)" }}
          />
        </div>

        <div className="mt-[16px] flex items-start justify-between gap-[8px]">
          {TARGETS.map((tgt: any, i: number) => {
            const isComplete = TOTAL_12M <= tgt.value;
            return (
              <div key={tgt.label} className="flex flex-col items-start">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 22, delay: delay + 0.4 + i * 0.15 }}
                  className={`h-[10px] w-[10px] rounded-full border-2 ${isComplete ? "border-teal-500 bg-teal-500" : "border-slate-300 bg-white"}`}
                />
                <p className="mt-[8px] text-[10px] font-semibold uppercase tracking-[0.06em] text-slate-400">{tgt.label}</p>
                <p className="text-[12.5px] font-semibold tabular-nums text-slate-800">
                  <CountUp value={tgt.value} delay={delay + 0.5 + i * 0.1} />
                  <span className="text-[10.5px] font-normal text-slate-400"> {tgt.unit}</span>
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE, delay: delay + 0.5 }}
        className="mt-auto flex items-center gap-[10px] rounded-[10px] border border-slate-100 bg-slate-50 px-[14px] py-[10px]"
      >
        <span className={`h-[8px] w-[8px] shrink-0 rounded-full ${onTrack ? "bg-teal-500" : "bg-amber-400"}`} />
        <p className="text-[12px] leading-snug text-slate-600">
          Current pace puts you <span className="font-semibold text-slate-900">{reductionProgress >= 100 ? "beyond" : reductionProgress > 0 ? "ahead of" : "behind"}</span> the baseline trajectory.
        </p>
      </motion.div>
    </div>
  );
}

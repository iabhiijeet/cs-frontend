"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  CheckCircle,
  Plus,
  ShieldCheck,
  ChartLineUp,
  Buildings,
  ArrowRight,
  Sparkle,
  Info,
  Clock,
  Lightning,
  Eye,
  X,
} from "@phosphor-icons/react";
import { getActivityData } from "@/lib/api";
import { EASE } from "@/lib/animations";
import type { TabId } from "@/components/dashboard/Sidebar";

interface CarbonJourneyStepperProps {
  onNavigate?: (tab: TabId) => void;
  onOpenGuide?: () => void;
}

export default function CarbonJourneyStepper({
  onNavigate,
  onOpenGuide,
}: CarbonJourneyStepperProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<any[]>([]);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await getActivityData();
        if (res.success && res.data) {
          setActivities(res.data);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totalCount = activities.length;
  const pendingReviewCount = activities.filter(
    (a) => a.status === "SUBMITTED" || a.status === "UNDER_REVIEW" || a.status === "DRAFT"
  ).length;
  const verifiedCount = activities.filter(
    (a) => a.status === "VERIFIED" || a.status === "CALCULATED"
  ).length;

  // Determine current active step (1 to 4)
  let currentStep = 2; // Step 1 (Setup) is already done
  let nextAction = {
    label: "+ Add Activity Data",
    onClick: () => router.push("/activity-data/add"),
    hint: "Log bills & fuel consumption",
  };

  if (totalCount === 0) {
    currentStep = 2;
    nextAction = {
      label: "+ Add Activity Data",
      onClick: () => router.push("/activity-data/add"),
      hint: "Log your first utility or fuel bill",
    };
  } else if (pendingReviewCount > 0 && verifiedCount === 0) {
    currentStep = 3;
    nextAction = {
      label: "Audit & Verify Data",
      onClick: () => router.push("/review"),
      hint: `${pendingReviewCount} entry awaiting verification`,
    };
  } else if (verifiedCount > 0) {
    currentStep = 4;
    nextAction = {
      label: "+ Log More Data",
      onClick: () => router.push("/activity-data/add"),
      hint: "Emissions calculating in real-time",
    };
  }

  const steps = [
    {
      index: 1,
      name: "Setup",
      done: true,
      path: "/setup",
    },
    {
      index: 2,
      name: "Activity Data",
      count: totalCount > 0 ? totalCount : undefined,
      done: totalCount > 0,
      active: currentStep === 2,
      path: "/activity-data",
    },
    {
      index: 3,
      name: "Review & Audit",
      count: pendingReviewCount > 0 ? pendingReviewCount : undefined,
      done: verifiedCount > 0,
      active: currentStep === 3,
      path: "/review",
    },
    {
      index: 4,
      name: "Carbon Footprint",
      done: verifiedCount > 0,
      active: currentStep === 4,
      path: "/",
    },
  ];

  if (collapsed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center justify-between rounded-xl border border-teal-200/90 bg-white/90 px-4 py-2 text-xs shadow-xs"
      >
        <div className="flex items-center gap-2">
          <Sparkle size={14} className="text-teal-600" weight="fill" />
          <span className="font-bold text-slate-800">
            Workflow Guide:{" "}
            <span className="text-teal-700 font-extrabold">
              Step {currentStep} of 4 ({nextAction.hint})
            </span>
          </span>
        </div>
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="rounded-lg bg-teal-50 border border-teal-200 px-3 py-1 font-bold text-teal-900 hover:bg-teal-100 transition-colors cursor-pointer"
        >
          Expand Guide ▾
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE }}
      className="relative flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 rounded-2xl border border-teal-100/90 bg-white/95 px-4 py-3.5 sm:px-5 shadow-[0_4px_24px_rgba(13,148,136,0.04)] backdrop-blur-xl"
    >
      {/* ── Left: Milestone Status & Title ── */}
      <div className="flex items-center gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-2xs">
          <Sparkle size={16} weight="fill" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-teal-700">
              Workflow Guide
            </span>
            <span className="rounded-full bg-teal-50 border border-teal-200 px-2 py-0.2 text-[10px] font-bold text-teal-900">
              {currentStep === 4 ? "Live Active" : `Step ${currentStep} of 4`}
            </span>
          </div>
          <p className="text-xs font-bold text-slate-800 tracking-tight leading-none mt-0.5">
            {nextAction.hint}
          </p>
        </div>
      </div>

      {/* ── Center: Connected Minimalist Stepper Track ── */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 sm:py-0">
        {steps.map((s, i) => (
          <React.Fragment key={s.index}>
            <button
              type="button"
              onClick={() => router.push(s.path)}
              className={`group flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs transition-all cursor-pointer whitespace-nowrap ${
                s.active
                  ? "bg-teal-50 border border-teal-300 font-bold text-teal-950 shadow-2xs"
                  : s.done
                  ? "bg-slate-50 hover:bg-teal-50/60 border border-slate-200/80 text-slate-700 font-semibold"
                  : "bg-transparent text-slate-400 font-medium"
              }`}
            >
              <span
                className={`flex size-4.5 items-center justify-center rounded-full text-[10px] font-black ${
                  s.done
                    ? "bg-teal-600 text-white"
                    : s.active
                    ? "bg-teal-600 text-white"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {s.done ? "✓" : s.index}
              </span>
              <span>{s.name}</span>
              {s.count !== undefined && s.count > 0 && (
                <span className="ml-0.5 rounded-full bg-teal-100 border border-teal-200 px-1.5 text-[9.5px] font-black text-teal-900 tabular-nums">
                  {s.count}
                </span>
              )}
            </button>
            {i < steps.length - 1 && (
              <div className="h-px w-3 sm:w-4 bg-slate-200 shrink-0" />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* ── Right: Direct Action CTA + Guide ── */}
      <div className="flex items-center justify-between lg:justify-end gap-2 shrink-0 border-t lg:border-t-0 pt-2 lg:pt-0 border-slate-100">
        {onOpenGuide && (
          <button
            type="button"
            onClick={onOpenGuide}
            className="flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-teal-700 hover:bg-teal-50/60 transition-colors cursor-pointer"
            title="Open 3-step Quick Start Walkthrough"
          >
            <Info size={14} weight="bold" />
            <span className="hidden sm:inline">Guide</span>
          </button>
        )}

        <button
          type="button"
          onClick={nextAction.onClick}
          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs hover:from-teal-500 hover:via-cyan-500 hover:to-sky-500 transition-all cursor-pointer active:scale-[0.98]"
        >
          <span>{nextAction.label}</span>
          <ArrowRight size={12} weight="bold" />
        </button>

        <button
          type="button"
          onClick={() => setCollapsed(true)}
          className="flex size-7 items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Minimize banner"
        >
          <X size={13} weight="bold" />
        </button>
      </div>
    </motion.div>
  );
}

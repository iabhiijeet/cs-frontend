"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckCircle,
  Circle,
  ArrowRight,
  Buildings,
  Gauge,
  CalendarBlank,
  ChartBar,
  Spinner,
  ClipboardText,
} from "@phosphor-icons/react";
import { fetchAPI, getReportingPeriods, getActivityData } from "@/lib/api";
import { EASE } from "@/lib/animations";

type StepId = "onboarding" | "activity" | "period";

interface SetupStep {
  id: StepId;
  icon: React.ReactNode;
  title: string;
  description: string;
  action: string;
  href: string;
}

const STEPS: SetupStep[] = [
  {
    id: "onboarding",
    icon: <ClipboardText size={24} weight="duotone" />,
    title: "Complete University Profile",
    description:
      "Tell us about your university — name, size, campus count, and fiscal year. This sets up your carbon tracking baseline.",
    action: "Start Onboarding",
    href: "/onboarding",
  },
  {
    id: "activity",
    icon: <Gauge size={24} weight="duotone" />,
    title: "Add Your First Activity Data",
    description:
      "Log your Scope 1 (direct) and Scope 2 (purchased electricity) emission sources for your campus buildings.",
    action: "Add Activity Data",
    href: "/activity-data",
  },
  {
    id: "period",
    icon: <CalendarBlank size={24} weight="duotone" />,
    title: "Confirm Reporting Period",
    description:
      "Review the default reporting period and confirm the dates match your university's fiscal year.",
    action: "Review Periods",
    href: "/reporting-periods",
  },
];

export default function SetupPage() {
  const router = useRouter();
  const [completedSteps, setCompletedSteps] = useState<Set<StepId>>(new Set());
  const [loading, setLoading] = useState(true);
  const [orgName, setOrgName] = useState("");
  const [navigating, setNavigating] = useState<StepId | null>(null);

  useEffect(() => {
    async function checkProgress() {
      try {
        setLoading(true);
        const completed = new Set<StepId>();

        // Check if onboarding is done (org has a profile)
        const onbRes = await fetchAPI("/onboarding").catch(() => null);
        if (onbRes?.success && onbRes?.data) {
          completed.add("onboarding");
        }

        // Check if any activity data exists
        const actRes = await getActivityData().catch(() => null);
        if (actRes?.success && actRes.data?.length > 0) {
          completed.add("activity");
        }

        // Check if a reporting period exists
        const perRes = await getReportingPeriods().catch(() => null);
        if (perRes?.success && perRes.data?.length > 0) {
          completed.add("period");
        }

        setCompletedSteps(completed);

        // Get org name for welcome message
        const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            setOrgName(parsed.organisationName || parsed.name || "");
          } catch {}
        }
      } catch {
        // Non-fatal
      } finally {
        setLoading(false);
      }
    }
    checkProgress();
  }, []);

  const allComplete = completedSteps.size === STEPS.length;

  const handleNavigate = (step: SetupStep) => {
    setNavigating(step.id);
    if (typeof window !== "undefined") {
      localStorage.setItem("setup_return", "true");
    }
    router.push(step.href);
  };

  const handleGoToDashboard = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("setup_return");
    }
    router.push("/dashboard");
  };

  return (
    <div className="relative min-h-screen bg-[#f8faf9] dark:bg-[#0a0e0c] flex flex-col items-center justify-center px-4 py-16 overflow-hidden">
      {/* Background orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-[10%] top-[-10%] h-[500px] w-[500px] rounded-full bg-emerald-400/10 blur-[130px]" />
        <div className="absolute right-[5%] top-[20%] h-[500px] w-[500px] rounded-full bg-teal-300/10 blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[25%] h-[450px] w-[450px] rounded-full bg-green-300/8 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-[640px]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mb-10 text-center"
        >
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 shadow-lg shadow-emerald-500/20">
            <ChartBar size={28} weight="bold" className="text-white" />
          </div>

          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            Getting Started
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {orgName ? `Welcome, ${orgName}!` : "Welcome to CarbonSynq"}
          </h1>
          <p className="mt-3 text-[0.9375rem] leading-6 text-slate-500 dark:text-slate-400">
            Complete these 3 steps to activate your carbon tracking dashboard.
          </p>
        </motion.div>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">
              {completedSteps.size} of {STEPS.length} steps complete
            </span>
            <span className="text-xs font-medium text-emerald-600">
              {Math.round((completedSteps.size / STEPS.length) * 100)}%
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800">
            <motion.div
              className="h-full rounded-full bg-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${(completedSteps.size / STEPS.length) * 100}%` }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.3 }}
            />
          </div>
        </motion.div>

        {/* Steps */}
        <div className="flex flex-col gap-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-[96px] animate-pulse rounded-2xl bg-white/60 dark:bg-white/5"
              />
            ))
          ) : (
            STEPS.map((step, idx) => {
              const done = completedSteps.has(step.id);
              const isNavigating = navigating === step.id;
              // Lock steps that require previous step to be done
              const isLocked = idx > 0 && !completedSteps.has(STEPS[idx - 1].id);

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + idx * 0.1, duration: 0.45, ease: EASE }}
                  className={`group relative flex items-start gap-4 rounded-2xl border p-5 transition-all duration-200 ${
                    done
                      ? "border-emerald-200 bg-emerald-50/80 dark:border-emerald-800/50 dark:bg-emerald-950/30"
                      : isLocked
                        ? "border-slate-100 bg-slate-50/50 dark:border-slate-800/30 dark:bg-slate-900/20 opacity-60"
                        : "border-slate-200/80 bg-white dark:border-slate-700/50 dark:bg-slate-800/40 hover:border-emerald-200 hover:shadow-md hover:shadow-emerald-500/5"
                  }`}
                >
                  {/* Status icon */}
                  <div
                    className={`mt-0.5 shrink-0 ${
                      done ? "text-emerald-500" : "text-slate-300 dark:text-slate-600"
                    }`}
                  >
                    {done ? (
                      <CheckCircle size={28} weight="fill" />
                    ) : (
                      <Circle size={28} weight="regular" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${done ? "text-emerald-500" : "text-slate-400"}`}>
                        Step {idx + 1}
                      </span>
                      {done && (
                        <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          Complete
                        </span>
                      )}
                      {isLocked && (
                        <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-400">
                          Complete Step {idx} first
                        </span>
                      )}
                    </div>
                    <h3 className="text-[15px] font-semibold text-slate-800 dark:text-slate-100">
                      {step.title}
                    </h3>
                    <p className="mt-0.5 text-[13px] leading-5 text-slate-500 dark:text-slate-400">
                      {step.description}
                    </p>
                  </div>

                  {/* Action button */}
                  <button
                    onClick={() => !isLocked && handleNavigate(step)}
                    disabled={isNavigating || isLocked}
                    className={`shrink-0 flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[12.5px] font-semibold transition-all duration-150 ${
                      isLocked
                        ? "cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600"
                        : done
                          ? "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-slate-900 text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
                    }`}
                  >
                    {isNavigating ? (
                      <Spinner size={14} className="animate-spin" />
                    ) : (
                      <>
                        {done ? "Review" : step.action}
                        <ArrowRight size={13} weight="bold" />
                      </>
                    )}
                  </button>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <AnimatePresence>
            {allComplete && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 dark:border-emerald-800/50 dark:bg-emerald-950/40 px-5 py-4"
              >
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                  🎉 All steps complete! Your workspace is ready.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={handleGoToDashboard}
            disabled={!allComplete}
            className={`inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold shadow-md transition-all duration-150 ${
              allComplete
                ? "bg-emerald-600 text-white shadow-emerald-500/20 hover:bg-emerald-700 cursor-pointer"
                : "bg-slate-700/50 text-slate-400 shadow-none cursor-not-allowed"
            }`}
          >
            <ChartBar size={16} weight="bold" />
            Go to Dashboard
            <ArrowRight size={14} weight="bold" />
          </button>

          {!allComplete && (
            <p className="mt-2 text-xs text-slate-400">
              Complete all 3 steps above to unlock the dashboard.
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}

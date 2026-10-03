"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ArrowRight,
  Gauge,
  CalendarBlank,
  ChartBar,
  Spinner,
  ClipboardText,
  ShieldCheck,
  Sparkle,
  Lock,
  GlobeHemisphereWest,
} from "@phosphor-icons/react";
import { fetchAPI, getReportingPeriods, getActivityData } from "@/lib/api";
import { EASE } from "@/lib/animations";

type StepId = "onboarding" | "activity" | "period";

interface SetupStep {
  id: StepId;
  stepNum: string;
  category: string;
  icon: typeof ClipboardText;
  title: string;
  description: string;
  action: string;
  href: string;
  timeEst: string;
  gradient: string;
}

const STEPS: SetupStep[] = [
  {
    id: "onboarding",
    stepNum: "01",
    category: "Entity Profile",
    icon: ClipboardText,
    title: "Complete Organization Profile",
    description:
      "Configure entity hierarchy, facilities, employee headcount, and reporting currency to establish your carbon baseline.",
    action: "Start Onboarding",
    href: "/onboarding",
    timeEst: "~2 mins",
    gradient: "from-teal-600 to-cyan-600",
  },
  {
    id: "activity",
    stepNum: "02",
    category: "Emissions Ledger",
    icon: Gauge,
    title: "Add Your First Activity Data",
    description:
      "Ingest Scope 1 (fuel combustion) and Scope 2 (purchased grid electricity) meter records across designated facilities.",
    action: "Add Activity Data",
    href: "/activity-data",
    timeEst: "~3 mins",
    gradient: "from-cyan-600 to-sky-600",
  },
  {
    id: "period",
    stepNum: "03",
    category: "Accounting Period",
    icon: CalendarBlank,
    title: "Confirm Reporting Period",
    description:
      "Review and activate your standard annual reporting cycle aligned with fiscal and regulatory compliance frameworks.",
    action: "Review Periods",
    href: "/reporting-periods",
    timeEst: "~1 min",
    gradient: "from-teal-600 to-emerald-600",
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

        // 1. Check if onboarding is done
        const onbRes = await fetchAPI("/onboarding").catch(() => null);
        if (onbRes?.success && onbRes?.data) {
          completed.add("onboarding");
        }

        // 2. Check if any activity data exists
        const actRes = await getActivityData().catch(() => null);
        if (actRes?.success && actRes.data?.length > 0) {
          completed.add("activity");
        }

        // 3. Check if a reporting period exists
        const perRes = await getReportingPeriods().catch(() => null);
        if (perRes?.success && perRes.data?.length > 0) {
          completed.add("period");
        }

        setCompletedSteps(completed);

        // Get organization name from storage
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
  const progressPercent = Math.round((completedSteps.size / STEPS.length) * 100);

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
    <div className="min-h-screen w-full bg-gradient-to-b from-[#f0fbf9] via-[#f8fafc] to-[#edf9f7] text-slate-900 flex flex-col font-sans antialiased selection:bg-teal-500/20 relative overflow-x-hidden">
      {/* ── Background Ambient Lighting & Glows ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -left-[10%] top-[-10%] h-[550px] w-[550px] rounded-full bg-gradient-to-br from-teal-400/18 via-cyan-400/12 to-transparent blur-[140px]" />
        <div className="absolute right-[-5%] top-[15%] h-[520px] w-[520px] rounded-full bg-gradient-to-bl from-sky-400/18 via-teal-300/12 to-transparent blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[30%] h-[480px] w-[480px] rounded-full bg-emerald-300/12 blur-[130px]" />
        <div
          className="absolute inset-0 opacity-[0.45]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1.5px 1.5px, rgba(13,148,136,0.14) 1.5px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      {/* ── Top Enterprise Header Bar ── */}
      <header className="relative z-30 flex h-16 w-full items-center justify-between border-b border-teal-100/90 bg-white/85 px-6 sm:px-10 backdrop-blur-md">
        <Link href="/" className="inline-flex items-center gap-3 group">
          <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200 p-1.5 shadow-2xs group-hover:border-teal-400 transition-colors">
            <Image
              src="/cr.webp"
              alt="CarbonSynq"
              width={26}
              height={26}
              className="size-5.5 object-contain"
              unoptimized
            />
          </div>
          <div>
            <span className="text-base font-extrabold tracking-tight text-slate-900 block leading-none">
              CarbonSynq
            </span>
            <span className="text-[9.5px] font-bold tracking-wider uppercase bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mt-0.5 block">
              Enterprise Setup
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-gradient-to-r from-teal-50 via-cyan-50/80 to-teal-50 px-3 py-1 text-xs font-semibold text-teal-900 shadow-2xs">
            <span className="size-1.5 rounded-full bg-teal-500 animate-pulse" />
            <span>Workspace Provisioning</span>
          </div>

          <Link
            href="/dashboard"
            className="text-xs font-semibold text-slate-600 hover:text-teal-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-teal-50/60"
          >
            Skip to Dashboard
          </Link>
        </div>
      </header>

      {/* ── Main Content Area ── */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-10 sm:py-14">
        <div className="w-full max-w-[760px] mx-auto">
          {/* Hero Title & Subtext */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-1.5 rounded-full border border-teal-200/90 bg-gradient-to-r from-teal-50 via-cyan-50 to-teal-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-teal-800 shadow-2xs mb-3">
              <Sparkle size={13} weight="fill" className="text-teal-600" />
              <span>Activation Checklist</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900">
              {orgName ? (
                <>
                  Set up{" "}
                  <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600 bg-clip-text text-transparent">
                    {orgName}
                  </span>
                </>
              ) : (
                <>
                  Activate your{" "}
                  <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600 bg-clip-text text-transparent">
                    Carbon Workspace
                  </span>
                </>
              )}
            </h1>
            <p className="mt-2.5 text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed font-normal">
              Complete these 3 foundational milestones to initialize Scope 1 &amp; 2 baseline calculations and unlock full audit traceability.
            </p>
          </motion.div>

          {/* ── UNIFIED EXECUTIVE SETUP CARD ── */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE, delay: 0.1 }}
            className="rounded-2xl border border-teal-100/90 bg-white/95 backdrop-blur-xl shadow-[0_12px_40px_rgba(13,148,136,0.08),0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden"
          >
            {/* Progress Card Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-teal-50/70 via-cyan-50/40 to-slate-50/60 border-b border-teal-100/80">
              <div className="flex items-center justify-between gap-4 mb-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 block">
                    Workspace Readiness
                  </span>
                  <span className="text-sm sm:text-base font-extrabold text-slate-900">
                    {completedSteps.size} of {STEPS.length} Milestones Completed
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-black px-3.5 py-1 rounded-full shadow-2xs ${
                      allComplete
                        ? "bg-gradient-to-r from-teal-600 to-cyan-600 text-white"
                        : "bg-teal-50 border border-teal-200 text-teal-800"
                    }`}
                  >
                    {progressPercent}% Complete
                  </span>
                </div>
              </div>

              {/* Progress Bar Track */}
              <div className="h-2.5 w-full rounded-full bg-teal-100/60 overflow-hidden p-0.5">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-teal-600 via-cyan-500 to-sky-500 shadow-[0_0_12px_rgba(13,148,136,0.4)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.7, ease: EASE, delay: 0.2 }}
                />
              </div>
            </div>

            {/* Step List Items */}
            <div className="divide-y divide-teal-50">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-6 animate-pulse flex items-center gap-4">
                    <div className="size-10 rounded-xl bg-teal-50" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-48 bg-slate-100 rounded" />
                      <div className="h-3 w-full bg-slate-100 rounded" />
                    </div>
                    <div className="h-9 w-24 bg-teal-50 rounded-xl" />
                  </div>
                ))
              ) : (
                STEPS.map((step, idx) => {
                  const done = completedSteps.has(step.id);
                  const isNavigating = navigating === step.id;
                  const isLocked = idx > 0 && !completedSteps.has(STEPS[idx - 1].id);

                  return (
                    <div
                      key={step.id}
                      className={`p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200 ${
                        done
                          ? "bg-gradient-to-r from-teal-50/30 via-cyan-50/20 to-transparent hover:from-teal-50/50 hover:via-cyan-50/30"
                          : isLocked
                            ? "bg-slate-50/40 opacity-60"
                            : "hover:bg-gradient-to-r hover:from-teal-50/40 hover:to-transparent"
                      }`}
                    >
                      {/* Left: Index + Icon + Info */}
                      <div className="flex items-start gap-3.5 sm:gap-4 min-w-0">
                        {/* Status / Index Badge */}
                        <div
                          className={`flex size-10.5 shrink-0 items-center justify-center rounded-xl border text-xs font-black transition-all ${
                            done
                              ? `bg-gradient-to-br ${step.gradient} border-teal-500 text-white shadow-[0_4px_12px_rgba(13,148,136,0.3)]`
                              : isLocked
                                ? "bg-slate-100 border-slate-200 text-slate-400"
                                : "bg-white border-teal-200 text-teal-800 shadow-2xs ring-2 ring-teal-500/15"
                          }`}
                        >
                          {done ? (
                            <Check size={20} weight="bold" />
                          ) : (
                            <span>{step.stepNum}</span>
                          )}
                        </div>

                        {/* Text Information */}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="text-[10.5px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50/80 border border-teal-200/70 px-2 py-0.5 rounded">
                              {step.category}
                            </span>
                            {done && (
                              <span className="inline-flex items-center gap-1 rounded bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                                Verified
                              </span>
                            )}
                            {isLocked && (
                              <span className="inline-flex items-center gap-1 rounded bg-slate-100 border border-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
                                <Lock size={10} weight="bold" /> Requires Step {idx}
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400 font-medium">
                              · {step.timeEst}
                            </span>
                          </div>

                          <h3 className="text-sm sm:text-base font-bold text-slate-900">
                            {step.title}
                          </h3>
                          <p className="mt-1 text-xs text-slate-600 leading-relaxed max-w-xl font-normal">
                            {step.description}
                          </p>
                        </div>
                      </div>

                      {/* Right: Action Button */}
                      <div className="sm:shrink-0 flex sm:justify-end">
                        <button
                          type="button"
                          onClick={() => !isLocked && handleNavigate(step)}
                          disabled={isNavigating || isLocked}
                          className={`h-9.5 px-4.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer w-full sm:w-auto ${
                            isLocked
                              ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                              : done
                                ? "border border-teal-200 bg-teal-50/60 hover:bg-teal-600 hover:text-white hover:border-teal-600 text-teal-900 shadow-2xs"
                                : "bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600 hover:from-teal-500 hover:via-cyan-500 hover:to-sky-500 text-white shadow-[0_4px_14px_rgba(13,148,136,0.25)]"
                          }`}
                        >
                          {isNavigating ? (
                            <>
                              <Spinner size={14} className="animate-spin" />
                              <span>Loading…</span>
                            </>
                          ) : (
                            <>
                              <span>{done ? "Review" : step.action}</span>
                              <ArrowRight size={13} weight="bold" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Card Footer Security / Audit Banner */}
            <div className="px-6 py-3.5 bg-gradient-to-r from-teal-50/50 via-slate-50 to-cyan-50/30 border-t border-teal-100/70 flex flex-wrap items-center justify-between text-xs text-slate-600 font-medium gap-2">
              <span className="flex items-center gap-1.5 text-teal-800">
                <ShieldCheck size={15} className="text-teal-600" />
                Immutable GHG Protocol Audit Ledger
              </span>
              <span className="text-slate-400 text-[11px]">
                All inputs encrypted via 256-bit AES
              </span>
            </div>
          </motion.div>

          {/* ── BOTTOM PRIMARY DASHBOARD LAUNCH CTA ── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="mt-8 text-center"
          >
            <button
              type="button"
              onClick={handleGoToDashboard}
              disabled={!allComplete}
              className={`h-11 px-8 rounded-xl text-sm font-bold transition-all inline-flex items-center justify-center gap-2 cursor-pointer ${
                allComplete
                  ? "bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600 hover:from-teal-500 hover:via-cyan-500 hover:to-sky-500 text-white shadow-[0_8px_25px_rgba(13,148,136,0.3)] active:scale-[0.99]"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300/60 shadow-none"
              }`}
            >
              <ChartBar size={17} weight="bold" />
              <span>Launch Carbon Dashboard</span>
              <ArrowRight size={15} weight="bold" />
            </button>

            {!allComplete && (
              <p className="mt-2.5 text-xs text-slate-500 font-medium">
                Complete the milestones above to activate your organization&apos;s workspace.
              </p>
            )}

            {/* Compliance Footer Badges */}
            <div className="mt-10 pt-6 border-t border-teal-100/80 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-semibold">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-teal-600" />
                SOC 2 Type II
              </span>
              <span className="flex items-center gap-1.5">
                <GlobeHemisphereWest size={14} className="text-cyan-600" />
                ISO 14064 Standard
              </span>
              <span className="flex items-center gap-1.5">
                <Check size={14} weight="bold" className="text-emerald-600" />
                BRSR &amp; GHG Protocol Ready
              </span>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

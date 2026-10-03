"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, PencilLine, Sparkles, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PAGES, STAGE_LABELS } from "../_lib/onboardingPages";
import { UNIVERSITY_PAGES, UNIVERSITY_STAGE_LABELS } from "../_lib/onboardingPagesUniversity";
import { pageSummary, universityPageSummary } from "../_lib/onboardingSummaries";
import type { OnboardingData, OrgType } from "../_types/onboarding";

interface ReviewScreenProps {
  data: OnboardingData;
  completedPages: string[];
  onEdit: (pageKey: string) => void;
  onBack: () => void;
  onComplete: () => void;
  submitting: boolean;
  orgType?: OrgType;
}

interface StageGroup {
  stageIndex: number;
  label: string;
  pages: typeof PAGES;
}

export function ReviewScreen({
  data,
  completedPages,
  onEdit,
  onBack,
  onComplete,
  submitting,
  orgType = "company",
}: ReviewScreenProps) {
  const completedCount = completedPages.length;
  
  const activePages = orgType === "university" ? UNIVERSITY_PAGES : PAGES;
  const activeStageLabels = orgType === "university" ? UNIVERSITY_STAGE_LABELS : STAGE_LABELS;
  
  const groups: StageGroup[] = activeStageLabels.map((label, stageIndex) => ({
    stageIndex,
    label,
    pages: activePages.filter((p) => p.stageIndex === stageIndex),
  })).filter((g) => g.pages.length > 0);

  return (
    <div className="mx-auto w-full max-w-[760px] px-4 pb-40 pt-8 sm:px-6 sm:pt-12 font-sans antialiased text-slate-900">
      <header className="mb-8">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-teal-900 shadow-2xs mb-2.5">
          <Sparkles className="size-3 text-teal-600" />
          <span>Final Review</span>
        </div>

        <h1 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
          Ready to initialize your workspace
        </h1>
        <p className="mt-2 max-w-xl text-xs sm:text-sm leading-relaxed text-slate-600">
          You&apos;ve completed {completedCount} of {activePages.length} configuration sections. Review each
          item below and make any necessary adjustments before creating your live carbon ledger.
        </p>
      </header>

      <div className="space-y-8">
        {groups.map((group, gi) => {
          const groupDone = group.pages.filter((p) =>
            completedPages.includes(p.key)
          ).length;
          return (
            <section key={group.label} className="space-y-3">
              <div className="flex items-center justify-between border-b border-teal-100/90 pb-2.5">
                <h2 className="flex items-center gap-2.5 text-sm sm:text-base font-bold text-slate-900">
                  <span
                    className={cn(
                      "flex size-6 items-center justify-center rounded-full text-xs font-bold",
                      groupDone === group.pages.length
                        ? "bg-teal-600 text-white shadow-2xs"
                        : "border border-slate-300 bg-slate-100 text-slate-500"
                    )}
                  >
                    {group.stageIndex + 1}
                  </span>
                  <span>{group.label}</span>
                </h2>
                <span className="text-xs font-bold tabular-nums text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">
                  {groupDone}/{group.pages.length} Completed
                </span>
              </div>

              <div className="space-y-3">
                {group.pages.map((page, pi) => {
                  const summary = orgType === "university"
                    ? universityPageSummary(page.key, data)
                    : pageSummary(page.key, data);
                  const filled = summary.some((s) => s.value.trim() !== "");
                  const isComplete = completedPages.includes(page.key);
                  return (
                    <motion.div
                      key={page.key}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: gi * 0.03 + pi * 0.03, duration: 0.3 }}
                      className="rounded-2xl border border-teal-100/90 bg-white/95 shadow-xs overflow-hidden"
                    >
                      <div className="flex items-center justify-between gap-3 p-4 sm:p-5 bg-gradient-to-r from-teal-50/30 to-transparent">
                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              "flex size-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold",
                              isComplete
                                ? "bg-teal-600 text-white shadow-2xs"
                                : "border border-slate-300 bg-slate-100 text-slate-500"
                            )}
                          >
                            {isComplete ? (
                              <Check className="size-4 stroke-[3]" />
                            ) : (
                              page.substepIndex + 1
                            )}
                          </span>
                          <div>
                            <h3 className="text-sm font-bold text-slate-900">
                              {page.title}
                            </h3>
                            <p className="text-[11px] font-medium text-slate-500">
                              {filled
                                ? "Details captured"
                                : "Default baseline active"}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(page.key)}
                          className="h-8 px-3 rounded-lg border-teal-200 bg-white hover:bg-teal-50 text-teal-800 font-bold text-xs shadow-2xs"
                        >
                          <PencilLine className="size-3.5 mr-1" />
                          Edit
                        </Button>
                      </div>

                      {summary.length > 0 && (
                        <dl className="grid grid-cols-1 gap-x-6 gap-y-2.5 border-t border-slate-100 px-5 py-4 sm:grid-cols-2 sm:px-6 bg-white">
                          {summary.map((item) => (
                            <div
                              key={item.label}
                              className="flex items-baseline justify-between gap-3 sm:block"
                            >
                              <dt className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
                                {item.label}
                              </dt>
                              <dd
                                className={cn(
                                  "text-xs font-medium text-slate-900 sm:mt-0.5",
                                  !item.value && "italic text-slate-400"
                                )}
                              >
                                {item.value || "Not provided"}
                              </dd>
                            </div>
                          ))}
                        </dl>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <div className="mt-10 flex items-center justify-between gap-3 pt-6 border-t border-teal-100/90">
        <Button
          variant="ghost"
          size="lg"
          onClick={onBack}
          className="text-xs font-bold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="size-4 mr-1" />
          Back to Wizard
        </Button>
        <motion.div whileTap={{ scale: 0.98 }}>
          <Button
            size="lg"
            onClick={onComplete}
            disabled={submitting}
            className="h-11 px-8 rounded-xl bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600 text-white font-bold text-xs shadow-[0_8px_25px_rgba(13,148,136,0.3)] hover:from-teal-500 hover:via-cyan-500 hover:to-sky-500 active:scale-[0.99] cursor-pointer"
          >
            {submitting ? (
              <>
                <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white mr-1.5" />
                Initializing workspace…
              </>
            ) : (
              <>
                <Sparkles className="size-4 mr-1.5" />
                <span>Create Workspace</span>
                <ArrowRight className="size-4 ml-1.5" />
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
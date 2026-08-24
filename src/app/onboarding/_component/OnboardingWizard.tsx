"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";

import {
  createOnboarding,
  getOnboardingStatus,
  updateOnboarding,
} from "@/lib/api";

import { StepSidebar } from "./StepSidebar";
import { StepShell } from "./StepShell";
import { ReviewScreen } from "./ReviewScreen";
import { WelcomeScreen } from "./WelcomeScreen";
import { WorkspaceReady } from "./WorkspaceReady";
import { CompanyIdentityStep } from "./steps/CompanyIdentityStep";
import { UniversityIdentityStep } from "./steps/UniversityIdentityStep";
import { LocationsOperationsStep } from "./steps/LocationsOperationsStep";
import { ReportingComplianceStep } from "./steps/ReportingComplianceStep";
import { DataIntegrationsStep } from "./steps/DataIntegrationsStep";
import { EmissionsProfileStep } from "./steps/EmissionsProfileStep";
import { ValueChainStep } from "./steps/ValueChainStep";
import { StrategyTeamStep } from "./steps/StrategyTeamStep";
import {
  EMPTY_ONBOARDING,
  clearOnboarding,
  loadOnboarding,
  loadOrgType,
  saveOnboarding,
} from "../_lib/onboardingStorage";
import {
  PAGE_INDEX,
  PAGES,
  STAGE_LABELS,
  isLastPageOfStep,
  pageIndexForStep,
} from "../_lib/onboardingPages";
import {
  UNIVERSITY_PAGES,
  UNIVERSITY_PAGE_INDEX,
  UNIVERSITY_STAGE_LABELS,
} from "../_lib/onboardingPagesUniversity";
import { STEP_INDEX, validatePage } from "../_lib/onboardingValidation";
import { validateUniversityPage } from "../_lib/onboardingValidationUniversity";
import type { OnboardingData, OnboardingKey, OrgType } from "../_types/onboarding";
import type { OnboardingRecord } from "@/lib/api";

const WELCOME_INDEX = -1;

type SavedState = "idle" | "saving" | "saved";

// The backend record is authoritative for form values once it exists; the
// local draft (localStorage) only contributes position and progress.
function recordToData(record: OnboardingRecord): OnboardingData {
  return {
    company: record.company,
    locations: record.locations,
    reporting: record.reporting,
    integrations: record.integrations,
    emissions: record.emissions,
    valueChain: record.valueChain,
    strategy: record.strategy,
  };
}

export function OnboardingWizard() {
  const router = useRouter();

  // Determine which wizard to show based on org type chosen at signup
  const [orgType] = React.useState<OrgType>(() => loadOrgType());

  // Pick the right PAGES / PAGE_INDEX / STAGE_LABELS based on orgType
  const ACTIVE_PAGES = orgType === "university" ? UNIVERSITY_PAGES : PAGES;
  const ACTIVE_PAGE_INDEX =
    orgType === "university" ? UNIVERSITY_PAGE_INDEX : PAGE_INDEX;
  const ACTIVE_STAGE_LABELS =
    orgType === "university" ? UNIVERSITY_STAGE_LABELS : STAGE_LABELS;

  const REVIEW_INDEX = ACTIVE_PAGES.length;
  const DONE_INDEX = ACTIVE_PAGES.length + 1;

  const [data, setData] = React.useState<OnboardingData>(() => {
    const saved = loadOnboarding();
    return saved?.data ?? EMPTY_ONBOARDING;
  });
  const [index, setIndex] = React.useState<number>(() => {
    const saved = loadOnboarding();
    if (saved?.finished) return DONE_INDEX;
    if (saved?.currentPageKey && ACTIVE_PAGE_INDEX[saved.currentPageKey] != null)
      return ACTIVE_PAGE_INDEX[saved.currentPageKey];
    if (saved?.currentStep && STEP_INDEX[saved.currentStep] != null)
      return pageIndexForStep(saved.currentStep);
    return WELCOME_INDEX;
  });
  const [direction, setDirection] = React.useState(1);
  const [completedPages, setCompletedPages] = React.useState<string[]>(() => {
    const saved = loadOnboarding();
    if (!saved) return [];
    if (saved.finished) return ACTIVE_PAGES.map((p) => p.key);
    if (saved.completedPages) return saved.completedPages;
    return (saved.completedSteps ?? []).flatMap((step) =>
      ACTIVE_PAGES.filter((p) => p.stepId === step).map((p) => p.key)
    );
  });
  const [furthest, setFurthest] = React.useState<number>(() => {
    const saved = loadOnboarding();
    if (saved?.finished) return DONE_INDEX;
    let idx: number | null = null;
    if (saved?.currentPageKey && ACTIVE_PAGE_INDEX[saved.currentPageKey] != null)
      idx = ACTIVE_PAGE_INDEX[saved.currentPageKey];
    else if (saved?.currentStep && STEP_INDEX[saved.currentStep] != null)
      idx = pageIndexForStep(saved.currentStep);
    return idx != null ? idx : WELCOME_INDEX;
  });
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});
  const [savedState, setSavedState] = React.useState<SavedState>("idle");
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [serverLoad, setServerLoad] = React.useState<
    "loading" | "ready" | "error"
  >("loading");
  const [serverError, setServerError] = React.useState<string | null>(null);

  const currentPage =
    index >= 0 && index < ACTIVE_PAGES.length ? ACTIVE_PAGES[index] : null;
  const currentStepId = currentPage?.stepId ?? null;
  const isWelcome = index === WELCOME_INDEX;
  const isReview = index === REVIEW_INDEX;
  const isDone = index === DONE_INDEX;

  const markDirty = React.useCallback(() => setSavedState("saving"), []);

  React.useEffect(() => {
    const t = window.setTimeout(() => {
      saveOnboarding({
        data,
        currentPageKey: currentPage?.key ?? ACTIVE_PAGES[0].key,
        completedPages,
        ...(isDone ? { finished: true as const } : {}),
      });
      setSavedState("saved");
      const reset = window.setTimeout(() => setSavedState("idle"), 1800);
      return () => window.clearTimeout(reset);
    }, 450);
    return () => window.clearTimeout(t);
  }, [data, completedPages, index, currentPage?.key, isDone, ACTIVE_PAGES]);

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [index]);

  // Load the server-side onboarding record (if any) and prefill the form.
  const loadServerProfile = React.useCallback(async () => {
    setServerLoad("loading");
    const saved = loadOnboarding();
    if (saved?.finished) {
      setServerLoad("ready");
      return;
    }
    const result = await getOnboardingStatus();
    if (result.kind === "completed") {
      setData(recordToData(result.record));
      setServerLoad("ready");
      return;
    }
    if (result.kind === "not-found") {
      setServerLoad("ready");
      return;
    }
    setServerError(result.message);
    setServerLoad("error");
  }, []);

  React.useEffect(() => {
    void loadServerProfile();
  }, [loadServerProfile]);

  const serverBanner =
    serverLoad === "error" ? (
      <div
        role="alert"
        className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
      >
        <span>
          {serverError ?? "Could not load your saved onboarding data."}
        </span>
        <button
          type="button"
          onClick={() => void loadServerProfile()}
          className="rounded-lg border border-destructive/40 px-2.5 py-1 font-medium transition-colors hover:bg-destructive/10"
        >
          Retry
        </button>
      </div>
    ) : null;

  const update = React.useCallback(
    <K extends OnboardingKey>(
      group: K,
      patch: Partial<OnboardingData[K]>
    ) => {
      markDirty();
      setData((prev) => ({ ...prev, [group]: { ...prev[group], ...patch } }));
    },
    [markDirty]
  );

  const errors = React.useMemo(() => {
    if (!currentPage) return {};
    if (orgType === "university") return validateUniversityPage(currentPage.key, data);
    return validatePage(currentPage.key, data);
  }, [currentPage, data, orgType]);

  const err = React.useCallback(
    (field: string) =>
      errors[field] && touched[field] ? errors[field] : undefined,
    [errors, touched]
  );

  const touch = React.useCallback((field: string) => {
    setTouched((prev) => (prev[field] ? prev : { ...prev, [field]: true }));
  }, []);

  const goTo = (next: number, dir: number) => {
    const clamped = Math.max(WELCOME_INDEX, Math.min(next, DONE_INDEX));
    markDirty();
    setDirection(dir);
    setIndex(clamped);
    setFurthest((f) => Math.max(f, clamped));
    setTouched({});
    setSubmitError(null);
  };

  const handleContinue = () => {
    if (currentPage) {
      const pageErrors = orgType === "university" 
        ? validateUniversityPage(currentPage.key, data)
        : validatePage(currentPage.key, data);
      
      if (Object.keys(pageErrors).length > 0) {
        setTouched(
          Object.fromEntries(Object.keys(pageErrors).map((k) => [k, true]))
        );
        return;
      }
      setCompletedPages((prev) =>
        prev.includes(currentPage.key) ? prev : [...prev, currentPage.key]
      );
    }
    goTo(index + 1, 1);
  };

  const handleBack = () => {
    if (index <= WELCOME_INDEX) return;
    goTo(index - 1, -1);
  };

  const handleEdit = (pageKey: string) => {
    const target = ACTIVE_PAGE_INDEX[pageKey];
    if (target == null) return;
    goTo(target, -1);
  };

  const handleComplete = async () => {
    if (submitting) return;
    markDirty();
    setSubmitting(true);
    setSubmitError(null);
    // Onboarding poora hua — bina kisi extra screen ke seedha dashboard bhejo.
    const finish = () => {
      const allKeys = ACTIVE_PAGES.map((p) => p.key);
      setCompletedPages(allKeys);
      saveOnboarding({
        data,
        currentPageKey: ACTIVE_PAGES[ACTIVE_PAGES.length - 1].key,
        completedPages: allKeys,
        finished: true,
      });
      clearOnboarding();
      router.replace("/dashboard");
    };
    try {
      const created = await createOnboarding(data);
      if (created.kind === "created") {
        finish();
        return;
      }
      if (created.kind === "error") {
        setSubmitError(created.message);
        return;
      }
      // conflict: profile already exists — update it.
      const updated = await updateOnboarding(data);
      if (updated.kind === "updated") {
        finish();
        return;
      }
      if (updated.kind === "error") {
        setSubmitError(updated.message);
        return;
      }
      setSubmitError("Could not save your onboarding. Please try again.");
    } catch {
      setSubmitError(
        "Could not reach the server. Check your connection and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const enterDashboard = () => {
    clearOnboarding();
    router.push("/dashboard");
  };

  // ── Determine brand name for WorkspaceReady screen ───────────────────
  const brandName =
    orgType === "university"
      ? (data.university?.brandName || data.university?.legalName || "Your Institution")
      : (data.company.brandName || data.company.legalName);

  if (isDone) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <WorkspaceReady
          brandName={brandName}
          onEnterDashboard={enterDashboard}
          onInvite={enterDashboard}
        />
      </div>
    );
  }

  if (isWelcome) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <StepSidebar
          currentIndex={index}
          completedPages={completedPages}
          furthest={furthest}
          onPageClick={(i) => goTo(i, i > index ? 1 : -1)}
          savedState={savedState}
          pages={ACTIVE_PAGES}
          stageLabels={ACTIVE_STAGE_LABELS}
          orgType={orgType}
        />
        <main className="lg:pl-[300px]">
          {serverBanner}
          <WelcomeScreen
            onStart={() =>
              goTo(Math.max(0, Math.min(furthest, ACTIVE_PAGES.length - 1)), 1)
            }
            orgType={orgType}
          />
        </main>
      </div>
    );
  }

  if (isReview) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <StepSidebar
          currentIndex={index}
          completedPages={completedPages}
          furthest={furthest}
          onPageClick={(i) => goTo(i, -1)}
          savedState={savedState}
          pages={ACTIVE_PAGES}
          stageLabels={ACTIVE_STAGE_LABELS}
          orgType={orgType}
        />
        <main className="lg:pl-[300px]">
          {serverBanner}
          {submitError && (
            <div
              role="alert"
              className="mb-4 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {submitError}
            </div>
          )}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <ReviewScreen
                data={data}
                completedPages={completedPages}
                onEdit={handleEdit}
                onBack={handleBack}
                onComplete={handleComplete}
                submitting={submitting}
                orgType={orgType}
              />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    );
  }

  const page = currentPage!;
  const stageLabel = ACTIVE_STAGE_LABELS[page.stageIndex] ?? page.stepId;
  const stepPageCount = ACTIVE_PAGES.filter((p) => p.stepId === page.stepId).length;
  const stageFirstIndex = page.index - page.substepIndex;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <StepSidebar
        currentIndex={index}
        completedPages={completedPages}
        furthest={furthest}
        onPageClick={(i) => goTo(i, i > index ? 1 : -1)}
        savedState={savedState}
        pages={ACTIVE_PAGES}
        stageLabels={ACTIVE_STAGE_LABELS}
        orgType={orgType}
      />

      <main className="lg:pl-[300px]">
        {serverBanner}
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={index}
            custom={direction}
            initial={{ opacity: 0, x: direction * 32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -24 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <StepShell
              eyebrow={`${stageLabel} · ${index + 1} of ${ACTIVE_PAGES.length}`}
              title={page.title}
              description={page.description}
              showBack={index > WELCOME_INDEX}
              onBack={handleBack}
              onContinue={handleContinue}
              continueLabel={
                isLastPageOfStep(index) ? "Review setup" : "Continue"
              }
              pips={{
                total: stepPageCount,
                current: page.substepIndex,
                onSelect: (i) =>
                  goTo(
                    stageFirstIndex + i,
                    i > page.substepIndex ? 1 : -1
                  ),
              }}
            >
              {/* ── Step 1: Identity ── company or university ───────── */}
              {currentStepId === "company" && orgType === "university" && (
                <UniversityIdentityStep
                  data={data}
                  update={update}
                  err={err}
                  touch={touch}
                  section={page.section}
                />
              )}
              {currentStepId === "company" && orgType !== "university" && (
                <CompanyIdentityStep
                  data={data}
                  update={update}
                  err={err}
                  touch={touch}
                  section={page.section}
                />
              )}
              {currentStepId === "locations" && (
                <LocationsOperationsStep
                  data={data}
                  update={update}
                  err={err}
                  touch={touch}
                  section={page.section}
                />
              )}
              {currentStepId === "reporting" && (
                <ReportingComplianceStep
                  data={data}
                  update={update}
                  err={err}
                  touch={touch}
                  section={page.section}
                />
              )}
              {currentStepId === "integrations" && (
                <DataIntegrationsStep
                  data={data}
                  update={update}
                  err={err}
                  touch={touch}
                  section={page.section}
                />
              )}
              {currentStepId === "emissions" && (
                <EmissionsProfileStep
                  data={data}
                  update={update}
                  err={err}
                  touch={touch}
                  section={page.section}
                />
              )}
              {currentStepId === "valueChain" && (
                <ValueChainStep
                  data={data}
                  update={update}
                  err={err}
                  touch={touch}
                  section={page.section}
                />
              )}
              {currentStepId === "strategy" && (
                <StrategyTeamStep
                  data={data}
                  update={update}
                  err={err}
                  touch={touch}
                  section={page.section}
                />
              )}
            </StepShell>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
import type { StepId } from "../_types/onboarding";
import type { OnboardingPage } from "./onboardingPages";

// Re-use the same OnboardingPage shape but with university-specific
// titles / descriptions for the "company" step.

interface PageSeed {
  key: string;
  stepId: StepId;
  section: string;
  title: string;
  description: string;
}

export const UNIVERSITY_STAGE_LABELS: string[] = [
  "Welcome",
  "University",
  "Campus Structure",
  "Emissions",
];

const SEEDS: PageSeed[] = [
  // ── Step 1: University Identity (replaces "Company" step) ──────────────
  {
    key: "company-identity",
    stepId: "company",
    section: "identity",
    title: "University identity",
    description:
      "Basic details that anchor every carbon report and disclosure we generate.",
  },
  // ── Step 1.5: Campus Structure ──────────────────────────────────────────
  {
    key: "campus-structure",
    stepId: "campusStructure",
    section: "hierarchy",
    title: "Campus structure",
    description: "Define your Campus → Building → Floor hierarchy.",
  },
  // ── Step 2: Emissions Profile ─────────────────────────────────────────
  {
    key: "emissions-scope1",
    stepId: "emissions",
    section: "scope1",
    title: "Scope 1",
    description: "Fuels burned in campus boilers, vehicles and research labs.",
  },
  {
    key: "emissions-scope2",
    stepId: "emissions",
    section: "scope2",
    title: "Scope 2",
    description: "Electricity and heat purchased for campus operations.",
  },
];

const STEP_STAGE: Record<StepId, number> = {
  company: 1,
  campusStructure: 2,
  locations: 2, // skipped
  reporting: 2, // skipped
  integrations: 2, // skipped
  emissions: 3,
  valueChain: 3, // skipped
  strategy: 3, // skipped
};

function buildUniversityPages(): OnboardingPage[] {
  const counters: Record<string, number> = {};
  return SEEDS.map((seed, index) => {
    const stageKey = seed.stepId;
    const substepIndex = counters[stageKey] ?? 0;
    counters[stageKey] = substepIndex + 1;
    return {
      key: seed.key,
      stepId: seed.stepId,
      index,
      stageIndex: STEP_STAGE[seed.stepId],
      substepIndex,
      title: seed.title,
      description: seed.description,
      section: seed.section,
    };
  });
}

export const UNIVERSITY_PAGES: OnboardingPage[] = buildUniversityPages();

export const UNIVERSITY_PAGE_INDEX: Record<string, number> = Object.fromEntries(
  UNIVERSITY_PAGES.map((p, i) => [p.key, i])
);

export const UNIVERSITY_PAGE_BY_KEY: Record<string, OnboardingPage> =
  Object.fromEntries(UNIVERSITY_PAGES.map((p) => [p.key, p]));

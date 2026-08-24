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
  "Campus",
  "Compliance",
  "Data",
  "Emissions",
  "Value chain",
  "Team",
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
  {
    key: "company-organization",
    stepId: "company",
    section: "structure",
    title: "University type",
    description:
      "The type of institution determines applicable emission factors and frameworks.",
  },
  {
    key: "company-financials",
    stepId: "company",
    section: "size",
    title: "Institution size",
    description:
      "Student enrollment and campus count power per-capita benchmarks.",
  },
  // ── Step 2: Locations / Campus Operations ─────────────────────────────
  {
    key: "locations-facilities",
    stepId: "locations",
    section: "facilities",
    title: "Campus facilities",
    description:
      "Your physical campus footprint is the backbone of Scope 1 & 2 reporting.",
  },
  {
    key: "locations-operations",
    stepId: "locations",
    section: "operations",
    title: "Campus operations & energy",
    description:
      "Fleet, labs and on-site generation feed your Scope 1 and Scope 2 totals.",
  },
  // ── Step 3: Reporting & Compliance ────────────────────────────────────
  {
    key: "reporting-purpose",
    stepId: "reporting",
    section: "purpose",
    title: "Reporting purpose",
    description:
      "Why you're measuring emissions shapes the report templates we configure.",
  },
  {
    key: "reporting-frameworks",
    stepId: "reporting",
    section: "frameworks",
    title: "Frameworks & type",
    description:
      "We map every data point to the standards you disclose against (GHG Protocol, BRSR, etc.).",
  },
  {
    key: "reporting-history",
    stepId: "reporting",
    section: "history",
    title: "Reporting history",
    description:
      "Let us know where you're starting from so we can import or rebuild sensibly.",
  },
  {
    key: "reporting-audience",
    stepId: "reporting",
    section: "audience",
    title: "Audience",
    description:
      "Who will read your reporting — regulators, donors, ranking bodies — shapes depth and tone.",
  },
  // ── Step 4: Data Integrations ─────────────────────────────────────────
  {
    key: "integrations-systems",
    stepId: "integrations",
    section: "systems",
    title: "Source systems",
    description:
      "Connect ERP, LMS and other systems that hold your activity data.",
  },
  {
    key: "integrations-utility",
    stepId: "integrations",
    section: "utility",
    title: "Utility data",
    description:
      "Access to utility billing is the fastest path to accurate campus Scope 2.",
  },
  {
    key: "integrations-preferences",
    stepId: "integrations",
    section: "preferences",
    title: "Data preferences",
    description: "How you want data to flow into the workspace.",
  },
  // ── Step 5: Emissions Profile ─────────────────────────────────────────
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
  // ── Step 6: Value Chain (Scope 3) ─────────────────────────────────────
  {
    key: "valuechain-suppliers",
    stepId: "valueChain",
    section: "suppliers",
    title: "Procurement & suppliers",
    description:
      "Scope 3, category 1 — lab consumables and campus procurement.",
  },
  {
    key: "valuechain-travel",
    stepId: "valueChain",
    section: "travel",
    title: "Commuting & travel",
    description:
      "Student & staff commuting (Scope 3 cat. 7) and business travel (cat. 6).",
  },
  {
    key: "valuechain-logistics",
    stepId: "valueChain",
    section: "logistics",
    title: "Waste & logistics",
    description: "Campus waste disposal and research material transport.",
  },
  {
    key: "valuechain-digital",
    stepId: "valueChain",
    section: "digital",
    title: "Digital footprint",
    description:
      "Cloud infrastructure for e-learning, admin and research systems.",
  },
  {
    key: "valuechain-products",
    stepId: "valueChain",
    section: "products",
    title: "Research & leased assets",
    description:
      "Sponsored research, leased property and investment portfolios.",
  },
  // ── Step 7: Strategy & Team ───────────────────────────────────────────
  {
    key: "strategy-targets",
    stepId: "strategy",
    section: "targets",
    title: "Reduction targets",
    description:
      "Your net-zero ambition shapes dashboards, alerts and reporting.",
  },
  {
    key: "strategy-team",
    stepId: "strategy",
    section: "team",
    title: "Team setup",
    description: "Get the sustainability team into the workspace from day one.",
  },
  {
    key: "strategy-contact",
    stepId: "strategy",
    section: "contact",
    title: "Primary contact",
    description:
      "Who should we reach out to for clarifications and account setup?",
  },
];

const STEP_STAGE: Record<StepId, number> = {
  company: 1,
  locations: 2,
  reporting: 3,
  integrations: 4,
  emissions: 5,
  valueChain: 6,
  strategy: 7,
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

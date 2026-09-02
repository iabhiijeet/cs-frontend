import type { OnboardingData, StepId } from "../_types/onboarding";
import { UNIVERSITY_PAGE_BY_KEY } from "./onboardingPagesUniversity"; // Reusing PAGE_FIELDS from company setup for simplicity where possible, but will likely need a custom one if fields differ wildly. Actually, let's redefine PAGE_FIELDS specifically for University.

export type StepErrors = Partial<Record<string, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const UNIVERSITY_STEPS: {
  id: StepId;
  label: string;
}[] = [
  { id: "company", label: "University" }, // We reuse the 'company' stepId for university identity step
  { id: "campusStructure", label: "Campus Structure" },
  { id: "emissions", label: "Emissions" },
];

export const UNIVERSITY_PAGE_FIELDS: Record<string, string[]> = {
  "company-identity": ["legalName", "universityType", "campusCount", "studentEnrollment", "staffCount", "fiscalYearEnd"],
  "campus-structure": [],
  "emissions-scope1": ["scope1Fuels"],
  "emissions-scope2": ["electricitySource", "recs", "steam"],
};

export function validateUniversityStep(
  step: StepId,
  data: OnboardingData
): StepErrors {
  switch (step) {
    case "company": { // Reused ID
      const errors: StepErrors = {};
      const u = data.university;
      if (!u) return { legalName: "University details missing." };
      if (!u.legalName.trim()) errors.legalName = "Enter your legal university name.";
      if (!u.universityType) errors.universityType = "Select a university type.";
      if (!u.campusCount) errors.campusCount = "Select number of campuses.";
      if (!u.studentEnrollment) errors.studentEnrollment = "Select student enrollment.";
      if (!u.staffCount) errors.staffCount = "Select staff count.";
      if (!u.fiscalYearEnd) errors.fiscalYearEnd = "Select a month.";
      return errors;
    }
    case "campusStructure": {
      const errors: StepErrors = {};
      const ph = data.physicalHierarchy;
      if (!ph || !ph.campuses || ph.campuses.length === 0) {
        errors["campus-0-name"] = "At least one campus is required.";
      } else {
        ph.campuses.forEach((campus, cIdx) => {
          if (!campus.name.trim()) {
            errors[`campus-${cIdx}-name`] = "Campus name is required.";
          }
        });
      }
      return errors;
    }
    case "emissions": {
      const errors: StepErrors = {};
      const e = data.emissions;
      if (e.scope1Fuels.length === 0)
        errors.scope1Fuels = "Select at least one fuel or source.";
      if (!e.electricitySource) errors.electricitySource = "Select a source.";
      if (e.electricitySource !== "onsite-renewable" && !e.recs)
        errors.recs = "Select an option.";
      if (!e.steam) errors.steam = "Select an option.";
      return errors;
    }
    default:
      return {};
  }
}

export function validateUniversityPage(
  pageKey: string,
  data: OnboardingData
): StepErrors {
  const page = UNIVERSITY_PAGE_BY_KEY[pageKey];
  if (!page) return {};
  const fields = UNIVERSITY_PAGE_FIELDS[pageKey] ?? [];
  const all = validateUniversityStep(page.stepId, data);
  const errors: StepErrors = {};
  for (const f of fields) {
    if (all[f]) errors[f] = all[f];
  }
  return errors;
}
// we should actually inject university logic INTO the existing onboardingValidation.ts
// so OnboardingWizard doesn't have to duplicate the validation loop.

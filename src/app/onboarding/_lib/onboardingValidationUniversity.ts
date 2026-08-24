import type { OnboardingData, StepId } from "../_types/onboarding";
import { UNIVERSITY_PAGE_BY_KEY } from "./onboardingPagesUniversity"; // Reusing PAGE_FIELDS from company setup for simplicity where possible, but will likely need a custom one if fields differ wildly. Actually, let's redefine PAGE_FIELDS specifically for University.

export type StepErrors = Partial<Record<string, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const UNIVERSITY_STEPS: {
  id: StepId;
  label: string;
}[] = [
  { id: "company", label: "University" }, // We reuse the 'company' stepId for university identity step
  { id: "locations", label: "Campus" },
  { id: "reporting", label: "Compliance" },
  { id: "integrations", label: "Data" },
  { id: "emissions", label: "Emissions" },
  { id: "valueChain", label: "Value chain" },
  { id: "strategy", label: "Team" },
];

export const UNIVERSITY_PAGE_FIELDS: Record<string, string[]> = {
  "company-identity": ["legalName", "universityType"],
  "company-organization": ["universityType"],
  "company-financials": ["campusCount", "studentEnrollment", "staffCount", "fiscalYearEnd"],
  "locations-facilities": ["facilityCount", "countries", "facilityTypes", "ownershipStatus"],
  "locations-operations": [],
  "reporting-purpose": ["primaryReason"],
  "reporting-frameworks": ["frameworks", "reportingType", "deadline"],
  "reporting-history": ["previousReporting", "assurance"],
  "reporting-audience": ["audience"],
  "integrations-systems": [],
  "integrations-utility": ["utilityBillingMethod"],
  "integrations-preferences": ["dataInputMethod", "centralization"],
  "emissions-scope1": ["scope1Fuels"],
  "emissions-scope2": ["electricitySource", "recs", "steam"],
  "valuechain-suppliers": ["supplierData"],
  "valuechain-travel": ["commuting", "businessTravel"],
  "valuechain-logistics": ["logisticsOwnership", "waste"],
  "valuechain-digital": [],
  "valuechain-products": ["physicalProducts"],
  "strategy-targets": ["targets", "targetYear", "reduction"],
  "strategy-team": ["role", "teammateEmails"],
  "strategy-contact": ["primaryContact", "contactEmail"],
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
    case "locations": {
      const errors: StepErrors = {};
      const l = data.locations;
      if (!l.facilityCount) errors.facilityCount = "Select a range.";
      if (l.facilityCount !== "0 — no facilities" && l.countries.length === 0)
        errors.countries = "Select at least one country.";
      if (l.facilityCount !== "0 — no facilities" && l.facilityTypes.length === 0)
        errors.facilityTypes = "Select at least one facility type.";
      if (l.facilityCount !== "0 — no facilities" && !l.ownershipStatus)
        errors.ownershipStatus = "Select an ownership status.";
      return errors;
    }
    case "reporting": {
      const errors: StepErrors = {};
      const r = data.reporting;
      if (!r.primaryReason) errors.primaryReason = "Select a primary reason.";
      if (r.frameworks.length === 0)
        errors.frameworks = "Select at least one framework.";
      if (!r.reportingType) errors.reportingType = "Select a reporting type.";
      if (!r.deadline) errors.deadline = "Select a deadline.";
      if (!r.previousReporting) errors.previousReporting = "Select an option.";
      if (!r.assurance) errors.assurance = "Select an assurance level.";
      if (r.audience.length === 0) errors.audience = "Select at least one audience.";
      return errors;
    }
    case "integrations": {
      const errors: StepErrors = {};
      const i = data.integrations;
      if (i.utilityBilling === "yes" && !i.utilityBillingMethod)
        errors.utilityBillingMethod = "Select how you'd like to share bills.";
      if (!i.dataInputMethod) errors.dataInputMethod = "Select a data input method.";
      if (!i.centralization) errors.centralization = "Select how data is managed.";
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
    case "valueChain": {
      const errors: StepErrors = {};
      const v = data.valueChain;
      if (!v.supplierData) errors.supplierData = "Select an option.";
      if (!v.commuting) errors.commuting = "Select an option.";
      if (!v.businessTravel) errors.businessTravel = "Select an option.";
      if (!v.logisticsOwnership) errors.logisticsOwnership = "Select an option.";
      if (!v.waste) errors.waste = "Select an option.";
      if (!v.physicalProducts) errors.physicalProducts = "Select an option.";
      return errors;
    }
    case "strategy": {
      const errors: StepErrors = {};
      const s = data.strategy;
      if (!s.targets) errors.targets = "Select an option.";
      if (s.targets !== "none") {
        if (!s.targetYear) errors.targetYear = "Enter a target year.";
        if (s.targetYear && (isNaN(Number(s.targetYear)) || Number(s.targetYear) < 2026 || Number(s.targetYear) > 2100))
          errors.targetYear = "Enter a year between 2026 and 2100.";
        if (!s.reduction) errors.reduction = "Enter a target percentage.";
        if (s.reduction && (isNaN(Number(s.reduction)) || Number(s.reduction) <= 0 || Number(s.reduction) > 100))
          errors.reduction = "Enter a percentage between 1 and 100.";
      }
      if (!s.role) errors.role = "Select your role.";
      if (s.teammateEmails.trim()) {
        const emails = s.teammateEmails
          .split(/[\s,;]+/)
          .map((e) => e.trim())
          .filter(Boolean);
        const invalid = emails.filter((e) => !EMAIL_RE.test(e));
        if (invalid.length > 0)
          errors.teammateEmails = `Check these emails: ${invalid.join(", ")}`;
      }
      if (!s.primaryContact.trim()) errors.primaryContact = "Enter a primary contact name.";
      if (!s.contactEmail.trim()) errors.contactEmail = "Enter a contact email.";
      else if (!EMAIL_RE.test(s.contactEmail.trim()))
        errors.contactEmail = "Enter a valid email address.";
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

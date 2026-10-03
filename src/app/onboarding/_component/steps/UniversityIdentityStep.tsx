"use client";

import * as React from "react";
import { BookOpen, Building2, GraduationCap, Users } from "lucide-react";

import { SelectableCards } from "../controls";
import { SelectField } from "../FormSelect";
import { Row } from "../Section";
import { Field, FieldHelper, FieldLabel } from "../fields";
import { Input } from "@/components/ui/input";
import { MONTHS } from "../../_data/onboarding";
import type { OnboardingData, OnboardingKey, UniversityIdentity } from "../../_types/onboarding";

interface StepProps {
  data: OnboardingData;
  update: <K extends OnboardingKey>(
    group: K,
    patch: Partial<OnboardingData[K]>
  ) => void;
  err: (field: string) => string | undefined;
  touch: (field: string) => void;
  section?: string;
}

const UNIVERSITY_TYPES = [
  {
    value: "central",
    label: "Central University",
    description: "Established by an Act of Parliament",
    icon: Building2,
  },
  {
    value: "state",
    label: "State University",
    description: "Established by a State Legislature Act",
    icon: Building2,
  },
  {
    value: "deemed",
    label: "Deemed University",
    description: "Declared as deemed-to-be university by UGC",
    icon: GraduationCap,
  },
  {
    value: "private",
    label: "Private University",
    description: "Established under State Private University Act",
    icon: BookOpen,
  },
  {
    value: "autonomous",
    label: "Autonomous Institution",
    description: "Autonomous college / institution affiliated to a university",
    icon: Users,
  },
];

const NAAC_GRADES = [
  "A++", "A+", "A", "B++", "B+", "B", "C", "Not Accredited / Not Applied",
];

const CAMPUS_COUNTS = [
  "1", "2–3", "4–6", "7–10", "More than 10",
];

const STUDENT_RANGES = [
  "Under 1,000", "1,000–5,000", "5,001–10,000",
  "10,001–25,000", "25,001–50,000", "50,001–1,00,000", "More than 1,00,000",
];

const STAFF_RANGES = [
  "Under 50", "50–200", "201–500", "501–1,000",
  "1,001–5,000", "5,001–10,000", "More than 10,000",
];

const EMPTY_UNIVERSITY: UniversityIdentity = {
  legalName: "",
  brandName: "",
  ugcId: "",
  universityType: "",
  affiliation: "",
  naacGrade: "",
  campusCount: "",
  studentEnrollment: "",
  staffCount: "",
  website: "",
  fiscalYearEnd: "",
};

export function UniversityIdentityStep({
  data,
  update,
  err,
  touch,
  section,
}: StepProps) {
  const u: UniversityIdentity = data.university ?? EMPTY_UNIVERSITY;

  // Helper to update university sub-object
  const updateU = (patch: Partial<UniversityIdentity>) => {
    update("university", { ...u, ...patch });
  };

  const sections: { id: string; node: React.ReactNode }[] = [
    {
      id: "identity",
      node: (
        <div className="space-y-7 animate-in fade-in slide-in-from-bottom-3 duration-300">
          {/* 1. Basic Details */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <span className="flex size-6 items-center justify-center rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-xs font-black">
                1
              </span>
              <h3 className="text-sm font-bold tracking-tight text-slate-900">
                Basic Details
              </h3>
            </div>

            <div className="space-y-4">
              <Row>
                <Field>
                  <FieldLabel htmlFor="uniLegalName" required>
                    Legal university name
                  </FieldLabel>
                  <Input
                    id="uniLegalName"
                    value={u.legalName}
                    onChange={(e) => updateU({ legalName: e.target.value })}
                    onBlur={() => touch("legalName")}
                    placeholder="e.g. University of Delhi"
                    aria-invalid={!!err("legalName")}
                    autoComplete="organization"
                  />
                  <FieldHelper>
                    Used on official filings, reports and carbon disclosures.
                  </FieldHelper>
                </Field>
                <Field>
                  <FieldLabel htmlFor="uniBrandName">Display name</FieldLabel>
                  <Input
                    id="uniBrandName"
                    value={u.brandName}
                    onChange={(e) => updateU({ brandName: e.target.value })}
                    onBlur={() => touch("brandName")}
                    placeholder="e.g. DU"
                    autoComplete="organization"
                  />
                  <FieldHelper>
                    Common name or abbreviation used day-to-day.
                  </FieldHelper>
                </Field>
              </Row>

              <Row>
                <Field>
                  <FieldLabel htmlFor="ugcId">
                    UGC / AICTE Registration ID
                  </FieldLabel>
                  <Input
                    id="ugcId"
                    value={u.ugcId}
                    onChange={(e) => updateU({ ugcId: e.target.value })}
                    onBlur={() => touch("ugcId")}
                    placeholder="e.g. U-0012/DL"
                    autoComplete="off"
                  />
                  <FieldHelper>
                    Helps us match your institution to official UGC / AICTE records.
                  </FieldHelper>
                </Field>
                <Field>
                  <FieldLabel htmlFor="uniWebsite">Website</FieldLabel>
                  <Input
                    id="uniWebsite"
                    type="url"
                    value={u.website}
                    onChange={(e) => updateU({ website: e.target.value })}
                    onBlur={() => touch("website")}
                    placeholder="https://university.edu.in"
                    autoComplete="url"
                  />
                  <FieldHelper>
                    We verify your public profile for benchmarks.
                  </FieldHelper>
                </Field>
              </Row>

              <Row>
                <Field>
                  <FieldLabel htmlFor="affiliation">
                    Affiliation / Regulatory body
                  </FieldLabel>
                  <Input
                    id="affiliation"
                    value={u.affiliation}
                    onChange={(e) => updateU({ affiliation: e.target.value })}
                    onBlur={() => touch("affiliation")}
                    placeholder="e.g. UGC, AICTE, State University"
                    autoComplete="off"
                  />
                  <FieldHelper>
                    The board or body your institution is affiliated to or regulated by.
                  </FieldHelper>
                </Field>
                <SelectField
                  id="naacGrade"
                  label="NAAC Grade (optional)"
                  value={u.naacGrade}
                  onChange={(v) => updateU({ naacGrade: v })}
                  options={NAAC_GRADES.map((g) => ({ value: g, label: g }))}
                  placeholder="Select grade"
                  helper="Used for benchmarking with peer institutions."
                />
              </Row>
            </div>
          </div>

          {/* 2. University Type */}
          <div className="border-t border-slate-200/80 pt-6">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="flex size-6 items-center justify-center rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-xs font-black">
                2
              </span>
              <h3 className="text-sm font-bold tracking-tight text-slate-900">
                University Type
              </h3>
            </div>
            <Field>
              <SelectableCards
                id="universityType"
                value={u.universityType}
                onChange={(v) => updateU({ universityType: v })}
                options={UNIVERSITY_TYPES}
                columns={3}
                error={err("universityType")}
              />
            </Field>
          </div>

          {/* 3. Institution Size */}
          <div className="border-t border-slate-200/80 pt-6">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="flex size-6 items-center justify-center rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-xs font-black">
                3
              </span>
              <h3 className="text-sm font-bold tracking-tight text-slate-900">
                Institution Size
              </h3>
            </div>
            <div className="space-y-4">
              <Row>
                <SelectField
                  id="campusCount"
                  label="Number of campuses"
                  required
                  value={u.campusCount}
                  onChange={(v) => updateU({ campusCount: v })}
                  options={CAMPUS_COUNTS.map((c) => ({ value: c, label: c }))}
                  placeholder="Select range"
                  helper="Include all physical campus sites."
                  error={err("campusCount")}
                />
                <SelectField
                  id="studentEnrollment"
                  label="Total student enrollment"
                  required
                  value={u.studentEnrollment}
                  onChange={(v) => updateU({ studentEnrollment: v })}
                  options={STUDENT_RANGES.map((r) => ({ value: r, label: r }))}
                  placeholder="Select range"
                  helper="Normalizes per-student emission intensity."
                  error={err("studentEnrollment")}
                />
              </Row>
              <Row>
                <SelectField
                  id="staffCount"
                  label="Total staff (faculty + admin)"
                  required
                  value={u.staffCount}
                  onChange={(v) => updateU({ staffCount: v })}
                  options={STAFF_RANGES.map((r) => ({ value: r, label: r }))}
                  placeholder="Select range"
                  helper="Used to estimate staff commuting emissions."
                  error={err("staffCount")}
                />
                <SelectField
                  id="uniFiscalYearEnd"
                  label="Fiscal year end"
                  required
                  value={u.fiscalYearEnd}
                  onChange={(v) => updateU({ fiscalYearEnd: v })}
                  options={MONTHS.map((m) => ({ value: m, label: m }))}
                  placeholder="Select month"
                  helper="Aligns reporting periods with your academic / financial calendar."
                  error={err("fiscalYearEnd")}
                />
              </Row>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <>
      {sections
        .filter((s) => !section || s.id === section)
        .map((s) => (
          <React.Fragment key={s.id}>{s.node}</React.Fragment>
        ))}
    </>
  );
}

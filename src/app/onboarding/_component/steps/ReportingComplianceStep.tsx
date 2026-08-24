"use client";

import * as React from "react";
import { ScrollText } from "lucide-react";

import { ChipMultiSelect } from "../chips";
import { SelectableCards } from "../controls";
import { Row, Section } from "../Section";
import { Field, FieldError, FieldHelper, FieldLabel } from "../fields";
import { Input } from "@/components/ui/input";
import {
  ASSURANCE_OPTIONS,
  PREVIOUS_REPORTING_OPTIONS,
  PRIMARY_REASONS,
  REPORTING_AUDIENCES,
  REPORTING_FRAMEWORKS,
  REPORTING_TYPES,
} from "../../_data/onboarding";
import type { OnboardingData, OnboardingKey } from "../../_types/onboarding";

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

export function ReportingComplianceStep({
  data,
  update,
  err,
  touch,
  section,
}: StepProps) {
  const r = data.reporting;

  const sections: { id: string; node: React.ReactNode }[] = [
    {
      id: "purpose",
      node: (
        <Section
          step="purpose"
          title="Reporting purpose"
          description="Why you're here shapes the report templates and workflow we configure."
        >
          <Field>
            <FieldLabel required>Primary reason</FieldLabel>
            <SelectableCards
              id="primaryReason"
              value={r.primaryReason}
              onChange={(v) => update("reporting", { primaryReason: v })}
              options={PRIMARY_REASONS.map((o) => ({
                ...o,
                icon: ScrollText,
              }))}
              columns={3}
              error={err("primaryReason")}
            />
            <FieldHelper>
              Pick the closest match — you can refine this later.
            </FieldHelper>
          </Field>
        </Section>
      ),
    },
    {
      id: "frameworks",
      node: (
        <Section
          step="frameworks"
          title="Frameworks & type"
          description="We map every data point to the standards you disclose against."
        >
          <Field>
            <FieldLabel required>Frameworks you follow</FieldLabel>
            <ChipMultiSelect
              id="frameworks"
              value={r.frameworks}
              onChange={(v) => update("reporting", { frameworks: v })}
              options={REPORTING_FRAMEWORKS.map((f) => ({
                value: f,
                label: f,
              }))}
            />
            {err("frameworks") ? (
              <FieldError message={err("frameworks")} />
            ) : (
              <FieldHelper>
                We pre-structure disclosures around each selected framework.
              </FieldHelper>
            )}
          </Field>

          <Field>
            <FieldLabel required>Reporting type</FieldLabel>
            <SelectableCards
              id="reportingType"
              value={r.reportingType}
              onChange={(v) => update("reporting", { reportingType: v })}
              options={REPORTING_TYPES}
              error={err("reportingType")}
            />
          </Field>

          <Row>
            <Field>
              <FieldLabel htmlFor="deadline" required>
                Next reporting deadline
              </FieldLabel>
              <Input
                id="deadline"
                type="date"
                value={r.deadline}
                onChange={(e) => update("reporting", { deadline: e.target.value })}
                onBlur={() => touch("deadline")}
                aria-invalid={!!err("deadline")}
              />
              {err("deadline") ? (
                <FieldError message={err("deadline")} />
              ) : (
                <FieldHelper>
                  We build a working-backwards timeline from this date.
                </FieldHelper>
              )}
            </Field>
          </Row>
        </Section>
      ),
    },
    {
      id: "history",
      node: (
        <Section
          step="history"
          title="Reporting history"
          description="Let us know where you're starting from so we can import or rebuild sensibly."
        >
          <Field>
            <FieldLabel required>Previous reporting</FieldLabel>
            <SelectableCards
              id="previousReporting"
              value={r.previousReporting}
              onChange={(v) => update("reporting", { previousReporting: v })}
              options={PREVIOUS_REPORTING_OPTIONS}
              error={err("previousReporting")}
            />
          </Field>

          <Field>
            <FieldLabel required>Assurance level</FieldLabel>
            <SelectableCards
              id="assurance"
              value={r.assurance}
              onChange={(v) => update("reporting", { assurance: v })}
              options={ASSURANCE_OPTIONS}
              error={err("assurance")}
            />
            <FieldHelper>
              You can start without assurance and add it before disclosure.
            </FieldHelper>
          </Field>
        </Section>
      ),
    },
    {
      id: "audience",
      node: (
        <Section
          step="audience"
          title="Audience"
          description="Who will read your reporting helps us pick the right depth and tone."
        >
          <Field>
            <FieldLabel required>Who reads your reports?</FieldLabel>
            <ChipMultiSelect
              id="audience"
              value={r.audience}
              onChange={(v) => update("reporting", { audience: v })}
              options={REPORTING_AUDIENCES.map((a) => ({ value: a, label: a }))}
            />
            {err("audience") ? (
              <FieldError message={err("audience")} />
            ) : (
              <FieldHelper>
                Select all that apply — tone and depth follow your readers.
              </FieldHelper>
            )}
          </Field>
        </Section>
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

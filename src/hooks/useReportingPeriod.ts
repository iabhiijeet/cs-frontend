"use client";

import { useReportingPeriodContext } from "@/context/ReportingPeriodContext";
import type { ReportingPeriodStatus } from "@/context/ReportingPeriodContext";

interface ReportingPeriodState {
  periods: any[];
  activePeriodId: string | null;
  status: ReportingPeriodStatus;
  error: string | null;
}

/**
 * Thin adapter over ReportingPeriodContext.
 *
 * The resolver now lives in src/context/ReportingPeriodContext.tsx and is
 * mounted once in the root layout, so every route (not just the dashboard)
 * shares one resolved reporting period.
 */
export function useReportingPeriod(): ReportingPeriodState {
  const { periods, activePeriodId, status, error } = useReportingPeriodContext();
  return { periods, activePeriodId, status, error };
}

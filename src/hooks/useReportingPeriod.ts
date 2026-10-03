"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { fetchAPI } from "@/lib/api";

export type ReportingPeriodStatus =
  | "idle" // auth not ready / no authenticated organisation
  | "resolving"
  | "ready"
  | "empty" // no reporting periods exist for this university
  | "error"; // genuine API failure while resolving

interface ReportingPeriodState {
  periods: any[];
  activePeriodId: string | null;
  status: ReportingPeriodStatus;
  error: string | null;
}

const PERIOD_KEY = "reportingPeriodId";
// Tracks which university the stored period belongs to, so a period id
// belonging to another organisation is never reused after account switch.
const PERIOD_ORG_KEY = "reportingPeriodOrgId";

/**
 * Single mechanism for resolving the active reporting period.
 *
 * - Gated on AuthContext: never fetches before auth has loaded and a
 *   user with an organisationId exists.
 * - Selection priority: OPEN period → baseline period → first available.
 * - Re-resolves whenever the authenticated organisation changes; a stale
 *   period from another org is discarded, never reused.
 */
export function useReportingPeriod(): ReportingPeriodState {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const organisationId = user?.universityId ?? null;

  const [state, setState] = useState<ReportingPeriodState>(() => {
    if (typeof window === "undefined") {
      return { periods: [], activePeriodId: null, status: "idle", error: null };
    }
    const storedPeriodId = localStorage.getItem(PERIOD_KEY);
    const storedOrg = localStorage.getItem(PERIOD_ORG_KEY);
    const uId = localStorage.getItem("universityId");
    if (storedPeriodId && (storedOrg === uId || !storedOrg)) {
      return {
        periods: [],
        activePeriodId: storedPeriodId,
        status: "ready",
        error: null,
      };
    }
    return { periods: [], activePeriodId: null, status: "idle", error: null };
  });

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !organisationId) {
      // Authenticated but with no organisation: redirect to complete onboarding
      // instead of showing a dead-end error.
      const authBroken = isAuthenticated && !organisationId;
      if (authBroken) {
        const orgType = typeof window !== "undefined"
          ? localStorage.getItem("carbonsynq_org_type")
          : null;
        router.replace(orgType === "university" ? "/university-intake" : "/onboarding");
        return;
      }
      setState((s) => ({
        ...s,
        status: "idle",
        activePeriodId: null,
      }));
      return;
    }
    const orgId: string = organisationId;

    let cancelled = false;

    async function resolve() {
      setState((s) => ({ ...s, status: "resolving", error: null }));
      try {
        const res = await fetchAPI(`/reporting-periods?universityId=${orgId}`);
        if (cancelled) return;
        if (!res.success || !Array.isArray(res.data)) {
          throw new Error(res.message || "Failed to load reporting periods");
        }
        const list: any[] = res.data;
        if (list.length === 0) {
          localStorage.removeItem(PERIOD_KEY);
          localStorage.removeItem(PERIOD_ORG_KEY);
          setState({ periods: [], activePeriodId: null, status: "empty", error: null });
          return;
        }

        const storedPeriodId = localStorage.getItem(PERIOD_KEY);
        const storedOrg = localStorage.getItem(PERIOD_ORG_KEY);
        let chosen: any | undefined;
        if (storedPeriodId && storedOrg === orgId) {
          chosen = list.find((p) => p.id === storedPeriodId && p.status !== "LOCKED") ||
            list.find((p) => p.id === storedPeriodId);
        }
        if (!chosen) {
          chosen =
            list.find((p) => p.status === "OPEN") ||
            list.find((p) => p.isBaseline) ||
            list[0];
        }
        if (!chosen) {
          localStorage.removeItem(PERIOD_KEY);
          localStorage.removeItem(PERIOD_ORG_KEY);
          setState({ periods: list, activePeriodId: null, status: "empty", error: null });
          return;
        }
        localStorage.setItem(PERIOD_KEY, chosen.id);
        localStorage.setItem(PERIOD_ORG_KEY, orgId);
        setState({ periods: list, activePeriodId: chosen.id, status: "ready", error: null });
      } catch (err: any) {
        if (cancelled) return;
        setState({
          periods: [],
          activePeriodId: null,
          status: "error",
          error: err?.message || "Failed to resolve the reporting period",
        });
      }
    }

    resolve();
    return () => {
      cancelled = true;
    };
  }, [authLoading, isAuthenticated, organisationId]);

  return state;
}

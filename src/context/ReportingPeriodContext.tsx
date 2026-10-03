"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import { fetchAPI } from "@/lib/api";

export type ReportingPeriodStatus =
  | "idle" // auth not ready / no authenticated organisation
  | "resolving"
  | "ready"
  | "empty" // no reporting periods exist for this university
  | "error"; // genuine API failure while resolving

const PERIOD_KEY = "reportingPeriodId";
// Tracks which university the stored period belongs to, so a period id
// belonging to another organisation is never reused after account switch.
const PERIOD_ORG_KEY = "reportingPeriodOrgId";

interface ReportingPeriodContextValue {
  periods: any[];
  activePeriodId: string | null;
  activePeriod: any | null;
  isLocked: boolean;
  status: ReportingPeriodStatus;
  error: string | null;
  /** True once resolution has settled enough for period-scoped calls. */
  isPeriodReady: boolean;
  setActivePeriodId: (id: string) => void;
  refresh: () => void;
}

const ReportingPeriodContext = createContext<ReportingPeriodContextValue | null>(null);

function readStoredPeriod(uId: string | null): string | null {
  if (typeof window === "undefined") return null;
  const storedPeriodId = localStorage.getItem(PERIOD_KEY);
  const storedOrg = localStorage.getItem(PERIOD_ORG_KEY);
  if (!storedPeriodId) return null;
  if (storedOrg && uId && storedOrg !== uId) return null;
  return storedPeriodId;
}

function persistPeriod(periodId: string, orgId: string) {
  localStorage.setItem(PERIOD_KEY, periodId);
  localStorage.setItem(PERIOD_ORG_KEY, orgId);
}

function clearStoredPeriod() {
  localStorage.removeItem(PERIOD_KEY);
  localStorage.removeItem(PERIOD_ORG_KEY);
}

/**
 * App-wide single source of truth for the active reporting period.
 *
 * This MUST live above the route tree (see src/app/layout.tsx) because every
 * period-scoped API call in src/lib/api.ts reads the period from storage via
 * requireContext(). Previously the resolver was only mounted by the dashboard,
 * so any direct navigation to /activity-data/*, /review or /calculations had
 * no period id and those flows failed.
 */
export function ReportingPeriodProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const organisationId = user?.universityId ?? null;

  const [periods, setPeriods] = useState<any[]>([]);
  const [activePeriodId, setActivePeriodIdState] = useState<string | null>(null);
  const [status, setStatus] = useState<ReportingPeriodStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  // Re-read the cached id once auth has loaded so a page rendered before
  // hydration still ends up with the stored value.
  useEffect(() => {
    if (authLoading) return;
    setActivePeriodIdState(readStoredPeriod(organisationId));
  }, [authLoading, organisationId]);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated || !organisationId) {
      setStatus("idle");
      setActivePeriodIdState(null);
      setPeriods([]);
      setError(null);
      return;
    }

    const orgId: string = organisationId;
    let cancelled = false;

    async function resolve() {
      setStatus("resolving");
      setError(null);
      try {
        const res = await fetchAPI(`/reporting-periods?universityId=${orgId}`);
        if (cancelled) return;
        if (!res.success || !Array.isArray(res.data)) {
          throw new Error(res.message || "Failed to load reporting periods");
        }

        const list: any[] = res.data;
        if (list.length === 0) {
          clearStoredPeriod();
          setPeriods([]);
          setActivePeriodIdState(null);
          setStatus("empty");
          return;
        }

        const stored = readStoredPeriod(orgId);
        let chosen: any | undefined;
        if (stored) {
          chosen =
            list.find((p) => p.id === stored && p.status !== "LOCKED") ||
            list.find((p) => p.id === stored);
        }
        if (!chosen) {
          chosen =
            list.find((p) => p.status === "OPEN") ||
            list.find((p) => p.isBaseline) ||
            list[0];
        }
        if (!chosen) {
          clearStoredPeriod();
          setPeriods(list);
          setActivePeriodIdState(null);
          setStatus("empty");
          return;
        }

        persistPeriod(chosen.id, orgId);
        setPeriods(list);
        setActivePeriodIdState(chosen.id);
        setStatus("ready");
      } catch (err: any) {
        if (cancelled) return;
        setPeriods([]);
        setActivePeriodIdState(null);
        setStatus("error");
        setError(err?.message || "Failed to resolve the reporting period");
      }
    }

    resolve();
    return () => {
      cancelled = true;
    };
  }, [authLoading, isAuthenticated, organisationId, nonce]);

  const setActivePeriodId = useCallback((id: string) => {
    setActivePeriodIdState(id);
    if (!id) {
      clearStoredPeriod();
      return;
    }
    // Stamp the current org so a period id can never be attributed to another.
    const uId =
      typeof window !== "undefined" ? localStorage.getItem("universityId") : null;
    if (uId) persistPeriod(id, uId);
    setPeriods((prev) =>
      prev.some((p) => p.id === id)
        ? prev.map((p) => (p.id === id ? { ...p, status: p.status === "LOCKED" ? "LOCKED" : p.status } : p))
        : prev
    );
  }, []);

  const refresh = useCallback(() => setNonce((n) => n + 1), []);

  // Keep the active period's lock state in sync when the caller mutates the
  // cached period list (e.g. after locking from the Reporting Periods page).
  const activePeriod = useMemo(
    () => periods.find((p) => p.id === activePeriodId) ?? null,
    [periods, activePeriodId]
  );

  const isLocked = activePeriod?.status === "LOCKED";

  const isPeriodReady = status === "ready" || status === "empty";

  const value = useMemo<ReportingPeriodContextValue>(
    () => ({
      periods,
      activePeriodId,
      activePeriod,
      isLocked,
      status,
      error,
      isPeriodReady,
      setActivePeriodId,
      refresh,
    }),
    [
      periods,
      activePeriodId,
      activePeriod,
      isLocked,
      status,
      error,
      isPeriodReady,
      setActivePeriodId,
      refresh,
    ]
  );

  return (
    <ReportingPeriodContext.Provider value={value}>
      {children}
    </ReportingPeriodContext.Provider>
  );
}

export function useReportingPeriodContext(): ReportingPeriodContextValue {
  const ctx = useContext(ReportingPeriodContext);
  if (!ctx) {
    throw new Error(
      "useReportingPeriodContext must be used within ReportingPeriodProvider"
    );
  }
  return ctx;
}

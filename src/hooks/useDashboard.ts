import { useState, useEffect } from 'react';
import { getDashboardSummary, ContextError } from '../lib/api';
import { useReportingPeriod } from './useReportingPeriod';

/**
 * Numeric coercion for backend payloads.
 *
 * Postgres `numeric` columns arrive as strings, and decimal sums are often
 * stringified before serialization. Calling `.toFixed()` directly on such a
 * value throws `toFixed is not a function`, which would abort the whole
 * mapper and leave every KPI at zero. Always funnel through `num()`.
 */
function num(value: unknown): number {
  const parsed = typeof value === "number" ? value : parseFloat(String(value ?? ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function round(value: unknown, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(num(value) * factor) / factor;
}

/** Converts a backend `YYYY-MM` month key into a short display label. */
function monthLabel(month: string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(month);
  if (!match) return month;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, 1);
  return date.toLocaleString("default", { month: "short" });
}

const EMPTY_DATA = {
  MONTHLY: [],
  TOTAL_12M: 0,
  SCOPE1_12M: 0,
  SCOPE2_12M: 0,
  SCOPE3_12M: 0,
  SCOPES: [
    { key: "scope1", name: "Scope 1 — Direct", value: 0, share: 0, color: "#0f766e" },
    { key: "scope2", name: "Scope 2 — Energy", value: 0, share: 0, color: "#06b6d4" },
  ],
  CATEGORIES: [],
  KPIS: [
    { label: "Total footprint", value: 0, suffix: " tCO₂e", delta: 0, deltaLabel: "vs last 12 months", good: true, spark: [] },
    { label: "Scope 1 emissions", value: 0, suffix: " tCO₂e", delta: 0, deltaLabel: "share of total", good: false, spark: [] },
    { label: "Scope 2 emissions", value: 0, suffix: " tCO₂e", delta: 0, deltaLabel: "share of total", good: false, spark: [] },
    { label: "Reduction vs baseline", value: 0, decimals: 1, suffix: "%", delta: 0, deltaLabel: "of baseline", good: true, spark: [] },
  ],
  SCOPE_DETAILS: [
    { key: "scope1", num: "1", name: "Direct emissions", headline: "Sources you own or control", description: "Emissions from owned or controlled sources.", color: "#0f766e", share: 0, total: 0, delta: 0, intensity: 0, monthly: [], sources: [] },
    { key: "scope2", num: "2", name: "Energy purchases", headline: "Indirect emissions from energy", description: "Emissions from purchased electricity, heating and cooling.", color: "#06b6d4", share: 0, total: 0, delta: 0, intensity: 0, monthly: [], sources: [] },
  ],
  FOOTPRINT_GROUPS: [],
  ACTIVITY: [],
  ACTIVITY_STATS: { total: 0, draft: 0, submitted: 0, underReview: 0, verified: 0, rejected: 0, calculated: 0, pending: 0, verifiedTotal: 0 },
  TARGETS: [],
};


export function useDashboard() {
  const {
    periods,
    activePeriodId,
    status: periodStatus,
    error: periodError,
  } = useReportingPeriod();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fallbackUsed, setFallbackUsed] = useState(false);

  const [filters, setFilters] = useState({
    reportingPeriodId: "",
    campusId: "",
    buildingId: "",
    floorId: "",
    scope: "ALL",
    dateRange: "ALL"
  });

  useEffect(() => {
    const effectivePeriodId = filters.reportingPeriodId || activePeriodId || "";

    if (periodStatus === "empty") {
      setData(EMPTY_DATA);
      setError(null);
      setFallbackUsed(false);
      setLoading(false);
      return;
    }

    if (periodStatus === "error") {
      setData(EMPTY_DATA);
      setError(periodError);
      setFallbackUsed(false);
      setLoading(false);
      return;
    }

    // If still resolving reporting period and we don't have a cached period ID yet, wait.
    if ((periodStatus === "idle" || periodStatus === "resolving") && !effectivePeriodId) {
      setLoading(true);
      return;
    }

    if (!effectivePeriodId) {
      setData(EMPTY_DATA);
      setError(null);
      setFallbackUsed(false);
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const response = await getDashboardSummary(undefined, effectivePeriodId, filters.campusId, filters.buildingId, filters.floorId);

        if (response.success && response.data) {
          const mapped = mapBackendToFrontend(response.data);
          setData(mapped);
          setFallbackUsed(false);
        } else {
          setError(response.message || "Backend returned an unsuccessful response.");
          setData(EMPTY_DATA);
          setFallbackUsed(false);
        }
      } catch (err: any) {
        if (err instanceof ContextError) {
          setError(err.message);
          setData(EMPTY_DATA);
          setFallbackUsed(false);
          return;
        }
        setError(err?.message || "Backend is unavailable.");
        setData(EMPTY_DATA);
        setFallbackUsed(false);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
     
  }, [periodStatus, activePeriodId, filters.reportingPeriodId, filters.campusId, filters.buildingId, filters.floorId]);

  return { data, loading, error, fallbackUsed, periods, filters, setFilters };
}

// Maps the backend format to the exact frontend structures expected
function mapBackendToFrontend(backendData: any) {
  const b = backendData;

  const MONTHLY = (b.trends || []).map((t: any) => {
    return {
      month: monthLabel(String(t.month ?? "")),
      total: round(num(t.totalKg) / 1000, 2),
      scope1: round(num(t.scope1Kg) / 1000, 2),
      scope2: round(num(t.scope2Kg) / 1000, 2),
    };
  });

  const TOTAL_12M = round(b.overview?.totalEmissionsTonnes);
  const SCOPE1_12M = round(b.overview?.scope1Tonnes);
  const SCOPE2_12M = round(b.overview?.scope2Tonnes);
  const SCOPE3_12M = round(b.overview?.scope3Tonnes);

  const SCOPES = [
    { key: "scope1", name: "Scope 1 — Direct", value: SCOPE1_12M, share: TOTAL_12M ? SCOPE1_12M / TOTAL_12M : 0, color: "#0f766e" },
    { key: "scope2", name: "Scope 2 — Energy", value: SCOPE2_12M, share: TOTAL_12M ? SCOPE2_12M / TOTAL_12M : 0, color: "#06b6d4" },
  ];

  const CATEGORIES = (b.categories || []).map((c: any) => ({
    name: String(c.category ?? "").replace(/_/g, " ").toLowerCase(),
    scope: c.scope === "SCOPE_1" ? "S1" : c.scope === "SCOPE_2" ? "S2" : "S3",
    value: round(c.tonnesCO2e),
    share: TOTAL_12M ? num(c.tonnesCO2e) / TOTAL_12M : 0,
    trend: round(c.trend, 1),
    sources: 1,
  }));

  const KPIS = [
    {
      label: "Total footprint",
      value: TOTAL_12M,
      decimals: 2,
      suffix: " tCO₂e",
      delta: round(b.overview?.delta, 1),
      deltaLabel: "vs last 12 months",
      good: round(b.overview?.delta, 1) <= 0,
      spark: MONTHLY.map((m: any) => m.total),
    },
    {
      label: "Scope 1 emissions",
      value: SCOPE1_12M,
      decimals: 2,
      suffix: " tCO₂e",
      delta: TOTAL_12M ? round((SCOPE1_12M / TOTAL_12M) * 100, 1) : 0,
      deltaLabel: "share of total",
      good: false,
      spark: MONTHLY.map((m: any) => m.scope1),
    },
    {
      label: "Scope 2 emissions",
      value: SCOPE2_12M,
      decimals: 2,
      suffix: " tCO₂e",
      delta: TOTAL_12M ? round((SCOPE2_12M / TOTAL_12M) * 100, 1) : 0,
      deltaLabel: "share of total",
      good: false,
      spark: MONTHLY.map((m: any) => m.scope2),
    },
    {
      label: "Reduction vs baseline",
      value: round(b.overview?.reductionPercentage, 1),
      decimals: 1,
      suffix: "%",
      delta: b.overview?.hasBaseline === false ? 0 : round(b.overview?.delta, 1),
      deltaLabel: b.overview?.hasBaseline === false ? "no baseline set" : "of baseline",
      good: round(b.overview?.reductionPercentage, 1) > 0,
      spark: MONTHLY.map((m: any) => m.total),
    },
  ];

  const SCOPE_DETAILS = [
    {
      key: "scope1",
      num: "1",
      name: "Direct emissions",
      headline: "Sources you own or control",
      description: "Emissions from owned or controlled sources, including on-site fuel combustion, the company fleet and refrigerants.",
      color: "#15803d",
      share: TOTAL_12M ? SCOPE1_12M / TOTAL_12M : 0,
      total: SCOPE1_12M,
      delta: round(b.scopeBreakdown?.scope1?.delta, 1),
      intensity: round(b.intensity?.tonnesPerStudent, 2),
      monthly: MONTHLY.map((m: any) => ({ month: m.month, value: m.scope1 })),
      sources: (b.categories || [])
        .filter((c: any) => c.scope === "SCOPE_1")
        .map((c: any) => ({ name: c.category, value: round(c.tonnesCO2e), share: SCOPE1_12M ? num(c.tonnesCO2e) / SCOPE1_12M : 0 })),
    },
    {
      key: "scope2",
      num: "2",
      name: "Energy purchases",
      headline: "Indirect emissions from energy",
      description: "Emissions from purchased electricity, heating and cooling that is generated upstream of your operations.",
      color: "#22c55e",
      share: TOTAL_12M ? SCOPE2_12M / TOTAL_12M : 0,
      total: SCOPE2_12M,
      delta: round(b.scopeBreakdown?.scope2?.delta, 1),
      intensity: round(b.intensity?.kgPerSqm, 2),
      monthly: MONTHLY.map((m: any) => ({ month: m.month, value: m.scope2 })),
      sources: (b.categories || [])
        .filter((c: any) => c.scope === "SCOPE_2")
        .map((c: any) => ({ name: c.category, value: round(c.tonnesCO2e), share: SCOPE2_12M ? num(c.tonnesCO2e) / SCOPE2_12M : 0 })),
    },
  ];

  return {
    MONTHLY,
    TOTAL_12M,
    SCOPE1_12M,
    SCOPE2_12M,
    SCOPE3_12M,
    SCOPES,
    CATEGORIES,
    KPIS,
    SCOPE_DETAILS,
    FOOTPRINT_GROUPS: b.groups || [],
    ACTIVITY: b.recentActivity || [],
    ACTIVITY_STATS: b.activityStats || {
      total: 0, draft: 0, submitted: 0, underReview: 0, verified: 0, rejected: 0, calculated: 0, pending: 0, verifiedTotal: 0
    },
    TARGETS: b.targets || [],
  };
}

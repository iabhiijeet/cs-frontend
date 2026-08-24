import { useState, useEffect } from 'react';
import { getDashboardSummary, ContextError } from '../lib/api';
import { useReportingPeriod } from './useReportingPeriod';
import {
  MONTHLY,
  TOTAL_12M as DEMO_TOTAL_12M,
  SCOPE1_12M as DEMO_SCOPE1,
  SCOPE2_12M as DEMO_SCOPE2,
  SCOPE3_12M as DEMO_SCOPE3,
  SCOPES,
  CATEGORIES,
  KPIS,
  SCOPE_DETAILS,
  FOOTPRINT_GROUPS,
  ACTIVITY,
  ACTIVITY_STATS,
  TARGETS,
} from '../lib/demo-data';

// Plain object so all views can safely destructure it
const DEMO_DATA = {
  MONTHLY,
  TOTAL_12M: DEMO_TOTAL_12M,
  SCOPE1_12M: DEMO_SCOPE1,
  SCOPE2_12M: DEMO_SCOPE2,
  SCOPE3_12M: DEMO_SCOPE3,
  SCOPES,
  CATEGORIES: CATEGORIES ?? [],
  KPIS,
  SCOPE_DETAILS: SCOPE_DETAILS ?? [],
  FOOTPRINT_GROUPS: FOOTPRINT_GROUPS ?? [],
  ACTIVITY,
  ACTIVITY_STATS,
  TARGETS,
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
    // Wait for the foundation (auth + reporting period) before any request.
    if (periodStatus === "idle" || periodStatus === "resolving") {
      setLoading(true);
      return;
    }

    if (periodStatus === "empty") {
      // No reporting periods exist yet — show demo data so the dashboard
      // doesn't appear blank on first login.
      setData(DEMO_DATA);
      setError(null);
      setFallbackUsed(true);
      setLoading(false);
      return;
    }

    if (periodStatus === "error") {
      // Period resolution failed — still show demo data so the UI isn't blank.
      setData(DEMO_DATA);
      setError(periodError);
      setFallbackUsed(true);
      setLoading(false);
      return;
    }

    const effectivePeriodId = filters.reportingPeriodId || activePeriodId || "";
    if (!effectivePeriodId) {
      // No period selected yet — fall back to demo data.
      setData(DEMO_DATA);
      setError(null);
      setFallbackUsed(true);
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const response = await getDashboardSummary(undefined, effectivePeriodId);

        if (response.success && response.data) {
          const mapped = mapBackendToFrontend(response.data);
          // If backend succeeded but has no emission data yet, use demo fallback
          const isEmpty =
            mapped.TOTAL_12M === 0 &&
            (!mapped.ACTIVITY_STATS || mapped.ACTIVITY_STATS.total === 0);
          if (isEmpty) {
            console.info("Backend data is empty; showing demo data as fallback.");
            setData(DEMO_DATA);
            setFallbackUsed(true);
          } else {
            setData(mapped);
            setFallbackUsed(false);
          }
        } else {
          // Genuine unsuccessful backend response → resilience fallback.
          console.warn("Backend fetch returned an unsuccessful response; using demo fallback.", response.message);
          setError(response.message || "Backend returned an unsuccessful response.");
          setData(DEMO_DATA);
          setFallbackUsed(true);
        }
      } catch (err: any) {
        if (err instanceof ContextError) {
          // Foundation error (missing universityId/reportingPeriodId):
          // this is a broken request, NOT a backend outage. Never fall back.
          console.error("Dashboard request was malformed:", err.message);
          setError(err.message);
          setData(null);
          setFallbackUsed(false);
          return;
        }
        // Network / backend failure → resilience fallback, clearly indicated.
        console.warn("Backend fetch failed; using demo fallback.", err);
        setError(err?.message || "Backend is unavailable.");
        setData(DEMO_DATA);
        setFallbackUsed(true);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
     
  }, [periodStatus, activePeriodId, filters.reportingPeriodId]);

  return { data, loading, error, fallbackUsed, periods, filters, setFilters };
}

// Maps the backend format to the exact frontend structures expected
function mapBackendToFrontend(backendData: any) {
  const b = backendData;

  const MONTHLY = (b.trends || []).map((t: any) => {
    const d = new Date(t.month);
    return {
      month: d.toLocaleString('default', { month: 'short' }),
      total: Math.round(t.totalKg / 1000),
      scope1: Math.round(t.scope1Kg / 1000),
      scope2: Math.round(t.scope2Kg / 1000),
      scope3: Math.round(t.scope3Kg / 1000) || 0
    };
  });

  const TOTAL_12M = Math.round(b.overview?.totalEmissionsTonnes || 0);
  const SCOPE1_12M = Math.round(b.overview?.scope1Tonnes || 0);
  const SCOPE2_12M = Math.round(b.overview?.scope2Tonnes || 0);
  const SCOPE3_12M = Math.round(b.overview?.scope3Tonnes || 0);

  const SCOPES = [
    { key: "scope1", name: "Scope 1 — Direct", value: SCOPE1_12M, share: TOTAL_12M ? SCOPE1_12M / TOTAL_12M : 0, color: "#15803d" },
    { key: "scope2", name: "Scope 2 — Energy", value: SCOPE2_12M, share: TOTAL_12M ? SCOPE2_12M / TOTAL_12M : 0, color: "#22c55e" },
    { key: "scope3", name: "Scope 3 — Value chain", value: SCOPE3_12M, share: TOTAL_12M ? SCOPE3_12M / TOTAL_12M : 0, color: "#86efac" },
  ];

  const CATEGORIES = (b.categories || []).map((c: any) => ({
    name: c.category.replace(/_/g, ' ').toLowerCase(),
    scope: c.scope === "SCOPE_1" ? "S1" : c.scope === "SCOPE_2" ? "S2" : "S3",
    value: Math.round(c.tonnesCO2e),
    share: TOTAL_12M ? c.tonnesCO2e / TOTAL_12M : 0,
    trend: c.trend || 0,
    sources: 1,
  }));

  const KPIS = [
    {
      label: "Total footprint",
      value: TOTAL_12M,
      suffix: " tCO₂e",
      delta: b.overview?.delta || 0,
      deltaLabel: "vs last 12 months",
      good: (b.overview?.delta || 0) <= 0,
      spark: MONTHLY.map((m: any) => m.total),
    },
    {
      label: "Scope 1 emissions",
      value: SCOPE1_12M,
      suffix: " tCO₂e",
      delta: TOTAL_12M ? Number((SCOPE1_12M / TOTAL_12M * 100).toFixed(1)) : 0,
      deltaLabel: "share of total",
      good: false,
      spark: MONTHLY.map((m: any) => m.scope1),
    },
    {
      label: "Scope 2 emissions",
      value: SCOPE2_12M,
      suffix: " tCO₂e",
      delta: TOTAL_12M ? Number((SCOPE2_12M / TOTAL_12M * 100).toFixed(1)) : 0,
      deltaLabel: "share of total",
      good: false,
      spark: MONTHLY.map((m: any) => m.scope2),
    },
    {
      label: "Reduction vs baseline",
      value: b.overview?.reductionPercentage || 0,
      decimals: 1,
      suffix: "%",
      delta: 0,
      deltaLabel: "of baseline",
      good: (b.overview?.reductionPercentage || 0) > 0,
      spark: [],
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
      delta: b.scopeBreakdown?.scope1?.delta || 0,
      intensity: b.intensity?.tonnesPerStudent || 0,
      monthly: MONTHLY.map((m: any) => ({ month: m.month, value: m.scope1 })),
      sources: (b.categories || [])
        .filter((c: any) => c.scope === "SCOPE_1")
        .map((c: any) => ({ name: c.category, value: Math.round(c.tonnesCO2e), share: SCOPE1_12M ? c.tonnesCO2e / SCOPE1_12M : 0 })),
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
      delta: b.scopeBreakdown?.scope2?.delta || 0,
      intensity: b.intensity?.kgPerSqm || 0,
      monthly: MONTHLY.map((m: any) => ({ month: m.month, value: m.scope2 })),
      sources: (b.categories || [])
        .filter((c: any) => c.scope === "SCOPE_2")
        .map((c: any) => ({ name: c.category, value: Math.round(c.tonnesCO2e), share: SCOPE2_12M ? c.tonnesCO2e / SCOPE2_12M : 0 })),
    },
    {
      key: "scope3",
      num: "3",
      name: "Value chain",
      headline: "All other indirect emissions",
      description: "Emissions across the full value chain, from purchased goods and travel to how customers use your products.",
      color: "#86efac",
      share: TOTAL_12M ? SCOPE3_12M / TOTAL_12M : 0,
      total: SCOPE3_12M,
      delta: b.scopeBreakdown?.scope3?.delta || 0,
      intensity: 0,
      monthly: MONTHLY.map((m: any) => ({ month: m.month, value: m.scope3 })),
      sources: (b.categories || [])
        .filter((c: any) => c.scope === "SCOPE_3")
        .map((c: any) => ({ name: c.category, value: Math.round(c.tonnesCO2e), share: SCOPE3_12M ? c.tonnesCO2e / SCOPE3_12M : 0 })),
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

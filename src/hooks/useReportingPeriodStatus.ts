"use client";

import { useEffect, useState } from "react";
import { fetchAPI } from "@/lib/api";
import { useReportingPeriodContext } from "@/context/ReportingPeriodContext";

/**
 * Lock state of the active reporting period.
 *
 * Prefers the cached period list from ReportingPeriodContext (which is resolved
 * app-wide). Falls back to a direct fetch only when the active period is not in
 * the cached list yet, so callers never silently treat a locked period as open
 * just because the cache was cold.
 */
export function useReportingPeriodStatus() {
  const { activePeriodId, activePeriod, isLocked, isPeriodReady, status, refresh } =
    useReportingPeriodContext();
  const [isLockedFallback, setIsLockedFallback] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activePeriod) {
      setLoading(false);
      return;
    }
    if (!isPeriodReady) return;
    if (status === "empty" || status === "error") {
      setLoading(false);
      return;
    }
    if (!activePeriodId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    async function checkStatus() {
      try {
        const response = await fetchAPI(`/reporting-periods/${activePeriodId}`);
        if (cancelled) return;
        if (response.success && response.data) {
          setIsLockedFallback(response.data.status === "LOCKED");
        }
      } catch (err) {
        console.error("Failed to check period status", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    checkStatus();
    const handleStorageChange = () => checkStatus();
    window.addEventListener("storage", handleStorageChange);
    return () => {
      cancelled = true;
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [activePeriodId, activePeriod, isPeriodReady, status]);

  // Locking happens on the Reporting Periods page; refresh the shared cache so
  // every other screen immediately sees the new lock state.
  useEffect(() => {
    const handleFocus = () => refresh();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refresh]);

  return { isLocked: activePeriod ? isLocked : isLockedFallback, loading };
}

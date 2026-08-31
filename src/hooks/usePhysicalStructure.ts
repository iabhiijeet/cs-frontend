"use client";

import { useState, useEffect, useCallback } from "react";
import { getOnboardingStatus } from "@/lib/api";
import { loadOnboarding } from "@/app/onboarding/_lib/onboardingStorage";
import type { PhysicalHierarchy, PhysicalCampus } from "@/app/onboarding/_types/onboarding";

export interface PhysicalStructureStats {
  campusCount: number;
  buildingCount: number;
  floorCount: number;
}

export interface UsePhysicalStructureResult {
  loading: boolean;
  error: string | null;
  isEmpty: boolean;
  orgName: string;
  reportingPeriod: string;
  hierarchy: PhysicalHierarchy | null;
  stats: PhysicalStructureStats;
  refetch: () => Promise<void>;
}

const EMPTY_HIERARCHY: PhysicalHierarchy = {
  campuses: [],
};

function computeStats(hierarchy: PhysicalHierarchy | null): PhysicalStructureStats {
  if (!hierarchy || !hierarchy.campuses || hierarchy.campuses.length === 0) {
    return { campusCount: 0, buildingCount: 0, floorCount: 0 };
  }

  const campusCount = hierarchy.campuses.length;
  let buildingCount = 0;
  let floorCount = 0;

  hierarchy.campuses.forEach((c) => {
    if (c.buildings && Array.isArray(c.buildings)) {
      buildingCount += c.buildings.length;
      c.buildings.forEach((b) => {
        if (b.floors && Array.isArray(b.floors)) {
          floorCount += b.floors.length;
        }
      });
    }
  });

  return { campusCount, buildingCount, floorCount };
}

export function usePhysicalStructure(): UsePhysicalStructureResult {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orgName, setOrgName] = useState("Your Organisation");
  const [reportingPeriod, setReportingPeriod] = useState("FY 2025–26");
  const [hierarchy, setHierarchy] = useState<PhysicalHierarchy | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Try fetching from Backend API
      const result = await getOnboardingStatus();

      if (result.kind === "completed" && result.record) {
        const record = result.record;
        const name =
          record.university?.brandName ||
          record.university?.legalName ||
          record.company?.brandName ||
          record.company?.legalName ||
          "Your Organisation";

        const period =
          record.university?.fiscalYearEnd ||
          record.company?.fiscalYearEnd ||
          "FY 2025–26";

        setOrgName(name);
        setReportingPeriod(period.startsWith("FY") ? period : `FY ${period}`);

        if (record.physicalHierarchy && record.physicalHierarchy.campuses?.length > 0) {
          setHierarchy(record.physicalHierarchy);
          setLoading(false);
          return;
        }

        // Check if raw intake data has buildings
        if (record.intakeRaw?.buildings && Array.isArray(record.intakeRaw.buildings)) {
          const generatedHierarchy: PhysicalHierarchy = {
            campuses: [
              {
                name: record.intakeRaw.campusName?.trim() || "Main Campus",
                code: record.intakeRaw.campusCode?.trim() || "MAIN-01",
                city: record.intakeRaw.city,
                region: record.intakeRaw.region,
                country: record.intakeRaw.country || "India",
                buildings: record.intakeRaw.buildings.map((b: any, bIdx: number) => ({
                  name: b.name?.trim() || `Building ${bIdx + 1}`,
                  code: b.code || `BLD-${String(bIdx + 1).padStart(2, "0")}`,
                  buildingType: b.type || "Academic",
                  areaSqm: b.area ? parseFloat(b.area) : undefined,
                  floors: (b.floors || []).map((f: any, fIdx: number) => ({
                    name: f.label?.trim() || (fIdx === 0 ? "Ground Floor" : `Floor ${fIdx}`),
                    code: f.code || (fIdx === 0 ? "GF" : `F${fIdx}`),
                    floorNumber: fIdx,
                  })),
                })),
              },
            ],
          };
          setHierarchy(generatedHierarchy);
          setLoading(false);
          return;
        }
      }

      // 2. Fallback to LocalStorage draft if available
      const localDraft = loadOnboarding();
      if (localDraft?.data) {
        const d = localDraft.data;
        const name =
          d.university?.brandName ||
          d.university?.legalName ||
          d.company?.brandName ||
          d.company?.legalName ||
          "Your Organisation";
        const period = d.university?.fiscalYearEnd || d.company?.fiscalYearEnd || "FY 2025–26";
        setOrgName(name);
        setReportingPeriod(period.startsWith("FY") ? period : `FY ${period}`);

        if (d.physicalHierarchy && d.physicalHierarchy.campuses?.length > 0) {
          setHierarchy(d.physicalHierarchy);
          setLoading(false);
          return;
        }
      }

      // 3. Graceful empty state
      setOrgName("Your Organisation");
      setReportingPeriod("");
      setHierarchy(EMPTY_HIERARCHY);
    } catch (err: any) {
      console.warn("Could not fetch physical structure from backend.", err);
      setError(err?.message || "Failed to load physical structure");
      setHierarchy(EMPTY_HIERARCHY);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const stats = computeStats(hierarchy);
  const isEmpty = !loading && stats.campusCount === 0 && stats.buildingCount === 0;

  return {
    loading,
    error,
    isEmpty,
    orgName,
    reportingPeriod,
    hierarchy,
    stats,
    refetch: fetchData,
  };
}

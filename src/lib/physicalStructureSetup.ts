/**
 * physicalStructureSetup.ts
 *
 * After onboarding completes, this helper creates the Campus → Building → Floor
 * hierarchy in the backend by calling the respective creation APIs sequentially.
 *
 * universityId MUST be set in localStorage before calling this function.
 */

import { createCampus, createBuilding, createFloor } from "./api";
import type { PhysicalHierarchy } from "@/app/onboarding/_types/onboarding";

export interface StructureSetupResult {
  ok: boolean;
  campusesCreated: number;
  buildingsCreated: number;
  floorsCreated: number;
  errors: string[];
}

/**
 * Creates the full Campus → Building → Floor hierarchy from onboarding data.
 * Errors in individual creates are collected but do not stop the rest of the setup.
 */
export async function setupPhysicalHierarchy(
  hierarchy: PhysicalHierarchy
): Promise<StructureSetupResult> {
  const result: StructureSetupResult = {
    ok: true,
    campusesCreated: 0,
    buildingsCreated: 0,
    floorsCreated: 0,
    errors: [],
  };

  for (const campus of hierarchy.campuses) {
    let campusId: string | null = null;

    try {
      const campusRes = await createCampus({
        name: campus.name,
        code: campus.code ?? "MAIN-01",
        city: campus.city ?? "",
        region: campus.region ?? "",
        country: campus.country ?? "India",
        metadata: campus.metadata ?? {},
      });
      // Backend returns the created record; extract id from common response shapes
      campusId =
        campusRes?.data?.id ??
        campusRes?.data?._id ??
        campusRes?.id ??
        campusRes?._id ??
        null;
      result.campusesCreated++;
    } catch (err: any) {
      const msg = `Campus "${campus.name}": ${err?.message ?? "unknown error"}`;
      result.errors.push(msg);
      result.ok = false;
      // Skip buildings/floors for this campus since we don't have its id
      continue;
    }

    for (const building of campus.buildings ?? []) {
      let buildingId: string | null = null;

      try {
        const bldRes = await createBuilding({
          name: building.name,
          code: building.code ?? "BLD-01",
          buildingType: building.buildingType ?? "Academic",
          areaSqm: building.areaSqm,
          occupancy: building.occupancy,
          metadata: building.metadata ?? {},
          campusId,
        });
        buildingId =
          bldRes?.data?.id ??
          bldRes?.data?._id ??
          bldRes?.id ??
          bldRes?._id ??
          null;
        result.buildingsCreated++;
      } catch (err: any) {
        const msg = `Building "${building.name}": ${err?.message ?? "unknown error"}`;
        result.errors.push(msg);
        result.ok = false;
        continue;
      }

      for (const floor of building.floors ?? []) {
        try {
          await createFloor({
            name: floor.name,
            code: floor.code ?? "GF",
            floorNumber: floor.floorNumber ?? 0,
            areaSqm: floor.areaSqm,
            occupancy: floor.occupancy,
            metadata: floor.metadata ?? {},
            buildingId,
            campusId,
          });
          result.floorsCreated++;
        } catch (err: any) {
          const msg = `Floor "${floor.name}": ${err?.message ?? "unknown error"}`;
          result.errors.push(msg);
          result.ok = false;
        }
      }
    }
  }

  return result;
}

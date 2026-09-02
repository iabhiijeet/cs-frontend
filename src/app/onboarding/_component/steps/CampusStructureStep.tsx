"use client";

import * as React from "react";
import { Plus, Trash2, ChevronDown, ChevronRight, Building2, Layers, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Section, Row } from "../Section";
import { Field, FieldHelper, FieldLabel } from "../fields";
import { Input } from "@/components/ui/input";
import { SelectField } from "../FormSelect";
import type { OnboardingData, OnboardingKey, PhysicalCampus, PhysicalBuilding, PhysicalFloor } from "../../_types/onboarding";

interface StepProps {
  data: OnboardingData;
  update: <K extends OnboardingKey>(group: K, patch: Partial<OnboardingData[K]>) => void;
  err: (field: string) => string | undefined;
  touch: (field: string) => void;
  section?: string;
}

const BUILDING_TYPES = [
  "Academic Block", "Administrative", "Hostel / Residential", "Laboratory / Research",
  "Library", "Auditorium / Sports", "Hospital / Medical", "Canteen / Kitchen",
  "Maintenance / Workshop", "Other",
];

const INDIAN_STATES = [
  "Andhra Pradesh", "Assam", "Bihar", "Delhi", "Gujarat", "Haryana",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Punjab",
  "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh", "West Bengal", "Other",
];

function newBuilding(): PhysicalBuilding {
  return { name: "", code: "", buildingType: "Academic Block", floors: [] };
}

function newFloor(): PhysicalFloor {
  return { name: "", code: "", floorNumber: 0 };
}

function newCampus(fallbackName: string): PhysicalCampus {
  return {
    name: fallbackName || "Main Campus",
    code: "MAIN-01",
    city: "",
    region: "",
    country: "India",
    buildings: [newBuilding()],
  };
}

// ── Small accordion for building ──────────────────────────────────────────────
function BuildingCard({
  building,
  bIdx,
  campusIdx,
  onUpdate,
  onRemove,
}: {
  building: PhysicalBuilding;
  bIdx: number;
  campusIdx: number;
  onUpdate: (patch: Partial<PhysicalBuilding>) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = React.useState(bIdx === 0);

  const addFloor = () => {
    const floors = [...(building.floors ?? [])];
    floors.push({ ...newFloor(), floorNumber: floors.length });
    onUpdate({ floors });
  };

  const updateFloor = (fIdx: number, patch: Partial<PhysicalFloor>) => {
    const floors = [...(building.floors ?? [])];
    floors[fIdx] = { ...floors[fIdx], ...patch };
    onUpdate({ floors });
  };

  const removeFloor = (fIdx: number) => {
    const floors = [...(building.floors ?? [])].filter((_, i) => i !== fIdx);
    onUpdate({ floors });
  };

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      {/* Building header */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <Building2 className="size-4 shrink-0 text-primary" />
        <span className="flex-1 truncate text-sm font-semibold text-foreground">
          {building.name || `Building ${bIdx + 1}`}
        </span>
        <span className="text-xs text-muted-foreground">
          {(building.floors ?? []).length} floor{(building.floors ?? []).length !== 1 ? "s" : ""}
        </span>
        {open ? <ChevronDown className="size-4 text-muted-foreground" /> : <ChevronRight className="size-4 text-muted-foreground" />}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-4 border-t border-border px-4 pb-4 pt-4">
              {/* Building fields */}
              <Row>
                <Field>
                  <FieldLabel htmlFor={`b-${campusIdx}-${bIdx}-name`} required>
                    Building name
                  </FieldLabel>
                  <Input
                    id={`b-${campusIdx}-${bIdx}-name`}
                    value={building.name}
                    onChange={(e) => onUpdate({ name: e.target.value })}
                    placeholder="e.g. Main Academic Block"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor={`b-${campusIdx}-${bIdx}-code`}>Code</FieldLabel>
                  <Input
                    id={`b-${campusIdx}-${bIdx}-code`}
                    value={building.code ?? ""}
                    onChange={(e) => onUpdate({ code: e.target.value })}
                    placeholder="e.g. BLD-01"
                  />
                </Field>
              </Row>

              <SelectField
                id={`b-${campusIdx}-${bIdx}-type`}
                label="Building type"
                value={building.buildingType ?? ""}
                onChange={(v) => onUpdate({ buildingType: v })}
                options={BUILDING_TYPES.map((t) => ({ value: t, label: t }))}
                placeholder="Select type"
              />

              {/* Floors */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <Layers className="size-3.5" />
                    Floors
                  </span>
                  <button
                    type="button"
                    onClick={addFloor}
                    className="flex items-center gap-1 rounded-md border border-dashed border-primary/50 px-2 py-0.5 text-xs font-medium text-primary hover:bg-primary/5 transition-colors"
                  >
                    <Plus className="size-3" />
                    Add floor
                  </button>
                </div>

                {(building.floors ?? []).length === 0 && (
                  <p className="text-xs text-muted-foreground italic">
                    No floors added — building-level data will be used.
                  </p>
                )}

                <div className="space-y-2">
                  {(building.floors ?? []).map((floor, fIdx) => (
                    <div
                      key={fIdx}
                      className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2"
                    >
                      <Layers className="size-3.5 shrink-0 text-muted-foreground" />
                      <Input
                        value={floor.name}
                        onChange={(e) => updateFloor(fIdx, { name: e.target.value })}
                        placeholder={fIdx === 0 ? "Ground Floor" : `Floor ${fIdx}`}
                        className="h-7 flex-1 border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
                      />
                      <Input
                        value={floor.code ?? ""}
                        onChange={(e) => updateFloor(fIdx, { code: e.target.value })}
                        placeholder={fIdx === 0 ? "GF" : `F${fIdx}`}
                        className="h-7 w-16 border-0 bg-transparent p-0 text-xs text-muted-foreground shadow-none focus-visible:ring-0"
                      />
                      <button
                        type="button"
                        onClick={() => removeFloor(fIdx)}
                        className="ml-1 text-muted-foreground hover:text-destructive transition-colors"
                        aria-label="Remove floor"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Remove building */}
              <button
                type="button"
                onClick={onRemove}
                className="flex items-center gap-1 text-xs font-medium text-destructive hover:underline"
              >
                <Trash2 className="size-3.5" />
                Remove building
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Step Component ───────────────────────────────────────────────────────
export function CampusStructureStep({ data, update }: StepProps) {
  const hierarchy = data.physicalHierarchy;

  // Derive a sensible default campus name from university identity
  const defaultCampusName =
    data.university?.brandName || data.university?.legalName || "Main Campus";

  // Ensure we always have at least one campus
  const campuses: PhysicalCampus[] = React.useMemo(() => {
    if (hierarchy?.campuses && hierarchy.campuses.length > 0) return hierarchy.campuses;
    return [newCampus(defaultCampusName)];
  }, [hierarchy, defaultCampusName]);

  // Write back to onboarding data
  const setCampuses = (next: PhysicalCampus[]) => {
    update("physicalHierarchy" as OnboardingKey, { campuses: next } as any);
  };

  const updateCampus = (cIdx: number, patch: Partial<PhysicalCampus>) => {
    const next = campuses.map((c, i) => (i === cIdx ? { ...c, ...patch } : c));
    setCampuses(next);
  };

  const addCampus = () => {
    setCampuses([...campuses, newCampus(`Campus ${campuses.length + 1}`)]);
  };

  const removeCampus = (cIdx: number) => {
    if (campuses.length <= 1) return; // keep at least one
    setCampuses(campuses.filter((_, i) => i !== cIdx));
  };

  const updateBuilding = (cIdx: number, bIdx: number, patch: Partial<PhysicalBuilding>) => {
    const buildings = [...(campuses[cIdx].buildings ?? [])];
    buildings[bIdx] = { ...buildings[bIdx], ...patch };
    updateCampus(cIdx, { buildings });
  };

  const addBuilding = (cIdx: number) => {
    const buildings = [...(campuses[cIdx].buildings ?? []), newBuilding()];
    updateCampus(cIdx, { buildings });
  };

  const removeBuilding = (cIdx: number, bIdx: number) => {
    const buildings = (campuses[cIdx].buildings ?? []).filter((_, i) => i !== bIdx);
    updateCampus(cIdx, { buildings });
  };

  return (
    <Section
      step="campus-structure"
      title="Campus structure"
      description="Define your physical hierarchy. Activity data will be tagged to each Campus → Building → Floor."
    >
      <div className="space-y-8">
        {campuses.map((campus, cIdx) => (
          <div key={cIdx} className="space-y-4 rounded-2xl border border-primary/20 bg-primary/[0.02] p-5">
            {/* Campus header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <MapPin className="size-3.5" />
                </div>
                <span className="text-sm font-bold text-foreground">
                  Campus {cIdx + 1}
                </span>
              </div>
              {campuses.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeCampus(cIdx)}
                  className="text-xs font-medium text-destructive hover:underline"
                >
                  Remove campus
                </button>
              )}
            </div>

            {/* Campus fields */}
            <Row>
              <Field>
                <FieldLabel htmlFor={`campus-${cIdx}-name`} required>
                  Campus name
                </FieldLabel>
                <Input
                  id={`campus-${cIdx}-name`}
                  value={campus.name}
                  onChange={(e) => updateCampus(cIdx, { name: e.target.value })}
                  placeholder="e.g. Main Campus"
                />
                <FieldHelper>Official name of this campus site.</FieldHelper>
              </Field>
              <Field>
                <FieldLabel htmlFor={`campus-${cIdx}-code`}>Campus code</FieldLabel>
                <Input
                  id={`campus-${cIdx}-code`}
                  value={campus.code ?? ""}
                  onChange={(e) => updateCampus(cIdx, { code: e.target.value })}
                  placeholder="e.g. MAIN-01"
                />
              </Field>
            </Row>

            <Row>
              <Field>
                <FieldLabel htmlFor={`campus-${cIdx}-city`}>City</FieldLabel>
                <Input
                  id={`campus-${cIdx}-city`}
                  value={campus.city ?? ""}
                  onChange={(e) => updateCampus(cIdx, { city: e.target.value })}
                  placeholder="e.g. New Delhi"
                />
              </Field>
              <SelectField
                id={`campus-${cIdx}-region`}
                label="State"
                value={campus.region ?? ""}
                onChange={(v) => updateCampus(cIdx, { region: v })}
                options={INDIAN_STATES.map((s) => ({ value: s, label: s }))}
                placeholder="Select state"
                helper="Used to apply the correct electricity emission factor."
              />
            </Row>

            {/* Buildings */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <Building2 className="size-3.5" />
                  Buildings on this campus
                </span>
              </div>

              <div className="space-y-2">
                {(campus.buildings ?? []).map((building, bIdx) => (
                  <BuildingCard
                    key={bIdx}
                    building={building}
                    bIdx={bIdx}
                    campusIdx={cIdx}
                    onUpdate={(patch) => updateBuilding(cIdx, bIdx, patch)}
                    onRemove={() => removeBuilding(cIdx, bIdx)}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => addBuilding(cIdx)}
                className="flex items-center gap-1.5 rounded-xl border border-dashed border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors w-full justify-center"
              >
                <Plus className="size-4" />
                Add building
              </button>
            </div>
          </div>
        ))}

        {/* Add campus */}
        <button
          type="button"
          onClick={addCampus}
          className="flex items-center gap-1.5 rounded-xl border border-dashed border-primary/30 px-4 py-3 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors w-full justify-center"
        >
          <Plus className="size-4" />
          Add another campus
        </button>
      </div>
    </Section>
  );
}

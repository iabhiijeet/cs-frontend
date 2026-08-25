"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import { X, Building, Buildings, Stack, Sparkle, CalendarBlank, MapPin, Gauge } from "@phosphor-icons/react";
import { EASE } from "@/lib/animations";
import { createActivityData, fetchAPI } from "@/lib/api";
import { usePhysicalStructure } from "@/hooks/usePhysicalStructure";
import { toast } from "sonner";

interface AddActivityModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CATEGORY_DEFINITIONS: Record<
  string,
  { label: string; scope: "SCOPE_1" | "SCOPE_2"; defaultUnit: string }
> = {
  PURCHASED_ELECTRICITY: { label: "Purchased Electricity", scope: "SCOPE_2", defaultUnit: "kWh" },
  DIESEL: { label: "Diesel (DG & Fleet)", scope: "SCOPE_1", defaultUnit: "L" },
  PETROL: { label: "Petrol / Gasoline", scope: "SCOPE_1", defaultUnit: "L" },
  LPG: { label: "LPG (Liquefied Petroleum Gas)", scope: "SCOPE_1", defaultUnit: "kg" },
  NATURAL_GAS: { label: "Natural Gas (PNG)", scope: "SCOPE_1", defaultUnit: "m³" },
  CNG: { label: "Compressed Natural Gas (CNG)", scope: "SCOPE_1", defaultUnit: "kg" },
  GENERATOR_FUEL: { label: "Generator Fuel", scope: "SCOPE_1", defaultUnit: "L" },
  BOILER_FUEL: { label: "Boiler Fuel", scope: "SCOPE_1", defaultUnit: "kg" },
  REFRIGERANT: { label: "Refrigerant Refill / Fugitive", scope: "SCOPE_1", defaultUnit: "kg" },
  OWNED_VEHICLE: { label: "Owned Vehicle Operations", scope: "SCOPE_1", defaultUnit: "km" },
  PURCHASED_STEAM: { label: "Purchased Steam", scope: "SCOPE_2", defaultUnit: "kg" },
  PURCHASED_HEATING: { label: "Purchased Heating", scope: "SCOPE_2", defaultUnit: "kWh" },
  PURCHASED_COOLING: { label: "Purchased Cooling / Chilled Water", scope: "SCOPE_2", defaultUnit: "TR-hr" },
};

export default function AddActivityModal({ onClose, onSuccess }: AddActivityModalProps) {
  const [loading, setLoading] = useState(false);
  const [periods, setPeriods] = useState<any[]>([]);
  const { hierarchy } = usePhysicalStructure();

  const [formData, setFormData] = useState({
    reportingPeriodId: "",
    category: "PURCHASED_ELECTRICITY",
    scope: "SCOPE_2",
    quantity: "",
    unit: "kWh",
    activityDate: new Date().toISOString().split("T")[0],
    campus: "",
    building: "",
    floor: "",
    description: "",
  });

  // Load Open reporting periods
  useEffect(() => {
    async function loadPeriods() {
      const uId = localStorage.getItem("universityId");
      if (!uId) return;
      try {
        const res = await fetchAPI(`/reporting-periods?universityId=${uId}`);
        if (res.success && res.data) {
          const openPeriods = res.data.filter((p: any) => p.status === "OPEN");
          setPeriods(openPeriods);

          const storedPid = localStorage.getItem("reportingPeriodId");
          if (storedPid && openPeriods.find((p: any) => p.id === storedPid)) {
            setFormData((prev) => ({ ...prev, reportingPeriodId: storedPid }));
          } else if (openPeriods.length > 0) {
            setFormData((prev) => ({ ...prev, reportingPeriodId: openPeriods[0].id }));
          }
        }
      } catch (err) {
        // Graceful fallback
      }
    }
    loadPeriods();
  }, []);

  // Pre-select default campus if available
  useEffect(() => {
    if (hierarchy?.campuses && hierarchy.campuses.length > 0 && !formData.campus) {
      setFormData((prev) => ({
        ...prev,
        campus: hierarchy.campuses[0].name,
      }));
    }
  }, [hierarchy, formData.campus]);

  // Selected campus object from hierarchy
  const selectedCampusObj = useMemo(() => {
    if (!hierarchy?.campuses) return null;
    return hierarchy.campuses.find((c) => c.name === formData.campus) || hierarchy.campuses[0] || null;
  }, [hierarchy, formData.campus]);

  // Buildings under selected campus
  const availableBuildings = useMemo(() => {
    return selectedCampusObj?.buildings || [];
  }, [selectedCampusObj]);

  // Selected building object
  const selectedBuildingObj = useMemo(() => {
    return availableBuildings.find((b) => b.name === formData.building) || null;
  }, [availableBuildings, formData.building]);

  // Floors under selected building
  const availableFloors = useMemo(() => {
    return selectedBuildingObj?.floors || [];
  }, [selectedBuildingObj]);

  // Handle Category change (auto sets Scope and default Unit)
  const handleCategoryChange = (categoryKey: string) => {
    const meta = CATEGORY_DEFINITIONS[categoryKey];
    if (meta) {
      setFormData((prev) => ({
        ...prev,
        category: categoryKey,
        scope: meta.scope,
        unit: meta.defaultUnit,
      }));
    }
  };

  const selectedPeriod = periods.find((p: any) => p.id === formData.reportingPeriodId);
  const periodStart = selectedPeriod ? String(selectedPeriod.startDate).slice(0, 10) : undefined;
  const periodEnd = selectedPeriod ? String(selectedPeriod.endDate).slice(0, 10) : undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.reportingPeriodId && periods.length > 0) {
      toast.error("Please select a reporting period");
      return;
    }

    const qty = parseFloat(formData.quantity);
    if (isNaN(qty) || qty <= 0) {
      toast.error("Please enter a valid positive quantity");
      return;
    }

    if (periodStart && periodEnd && (formData.activityDate < periodStart || formData.activityDate > periodEnd)) {
      toast.error(
        `Activity date must be within ${selectedPeriod?.name ?? "the selected reporting period"} (${periodStart} to ${periodEnd})`
      );
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        quantity: qty,
        activityDate: new Date(formData.activityDate).toISOString(),
        // Format clean location string for parent hierarchy visibility
        locationPath: [
          formData.campus || "Main Campus",
          formData.building || "Campus Total",
          formData.floor || "Building Total",
        ].join(" / "),
      };

      const res = await createActivityData(payload);
      if (res.success) {
        toast.success("Activity draft saved successfully");
        onSuccess();
      } else {
        toast.error(res.error || res.message || "Failed to create activity");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred while saving activity");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-[16px]">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.96 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="relative z-10 w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-[20px] border border-white/80 bg-white/95 backdrop-blur-2xl p-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.15)]"
      >
        {/* Header */}
        <div className="mb-[20px] flex items-center justify-between border-b border-slate-100 pb-[16px]">
          <div className="flex items-center gap-[10px]">
            <div className="flex h-[36px] w-[36px] items-center justify-center rounded-[10px] bg-indigo-50 text-indigo-600">
              <Sparkle size={20} weight="fill" />
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-slate-900">Add Activity Data</h2>
              <p className="text-[12px] text-slate-500">Log energy, fuel, and activity records for your structure</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full p-[6px] text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
            <X size={18} weight="bold" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-[18px]">
          {/* ── 1. Reporting Period ── */}
          <div className="flex flex-col gap-[6px]">
            <label className="flex items-center justify-between text-[12.5px] font-semibold text-slate-700">
              <span className="flex items-center gap-[4px]">
                <CalendarBlank size={14} className="text-indigo-600" />
                <span>Reporting Period</span>
                <span className="text-rose-500">*</span>
              </span>
              {selectedPeriod && (
                <span className="text-[11px] font-normal text-slate-400">
                  {periodStart} → {periodEnd}
                </span>
              )}
            </label>
            <select
              required
              className="h-[38px] w-full rounded-[10px] border border-slate-200 bg-white px-[12px] text-[13px] font-medium text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
              value={formData.reportingPeriodId}
              onChange={(e) => {
                const pid = e.target.value;
                const p = periods.find((x: any) => x.id === pid);
                setFormData((prev) => {
                  const next = { ...prev, reportingPeriodId: pid };
                  if (p) {
                    const s = String(p.startDate).slice(0, 10);
                    const en = String(p.endDate).slice(0, 10);
                    if (next.activityDate < s) next.activityDate = s;
                    else if (next.activityDate > en) next.activityDate = en;
                  }
                  return next;
                });
              }}
            >
              {periods.length === 0 && <option value="">FY 2025–26 (Active Period)</option>}
              {periods.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Active)
                </option>
              ))}
            </select>
          </div>

          {/* ── 2. Physical Location Cascading Section ── */}
          <div className="rounded-[14px] border border-slate-200/80 bg-slate-50/60 p-[14px]">
            <div className="mb-[12px] flex items-center justify-between">
              <span className="flex items-center gap-[6px] text-[12px] font-bold uppercase tracking-wider text-slate-600">
                <MapPin size={14} className="text-indigo-600" weight="fill" />
                <span>Location Hierarchy (From Onboarding)</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-[10px]">
              {/* Campus Select */}
              <div className="flex flex-col gap-[5px]">
                <label className="text-[11.5px] font-semibold text-slate-600 flex items-center gap-[3px]">
                  <Buildings size={13} />
                  <span>Campus</span>
                </label>
                <select
                  value={formData.campus}
                  onChange={(e) => {
                    const newCampus = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      campus: newCampus,
                      building: "",
                      floor: "",
                    }));
                  }}
                  className="h-[36px] w-full rounded-[8px] border border-slate-200 bg-white px-[10px] text-[12.5px] font-medium text-slate-800 outline-none focus:border-indigo-500"
                >
                  {hierarchy?.campuses && hierarchy.campuses.length > 0 ? (
                    hierarchy.campuses.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name} {c.code ? `(${c.code})` : ""}
                      </option>
                    ))
                  ) : (
                    <option value="Main Campus">Main Campus (MAIN-01)</option>
                  )}
                </select>
              </div>

              {/* Building Select (Cascading) */}
              <div className="flex flex-col gap-[5px]">
                <label className="text-[11.5px] font-semibold text-slate-600 flex items-center gap-[3px]">
                  <Building size={13} />
                  <span>Building</span>
                </label>
                <select
                  value={formData.building}
                  onChange={(e) => {
                    const newBuilding = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      building: newBuilding,
                      floor: "",
                    }));
                  }}
                  className="h-[36px] w-full rounded-[8px] border border-slate-200 bg-white px-[10px] text-[12.5px] font-medium text-slate-800 outline-none focus:border-indigo-500"
                >
                  <option value="">Campus Total (Entire Campus)</option>
                  {availableBuildings.map((b) => (
                    <option key={b.name} value={b.name}>
                      {b.name} {b.code ? `(${b.code})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Floor Select (Cascading) */}
              <div className="flex flex-col gap-[5px]">
                <label className="text-[11.5px] font-semibold text-slate-600 flex items-center gap-[3px]">
                  <Stack size={13} />
                  <span>Floor</span>
                </label>
                <select
                  value={formData.floor}
                  onChange={(e) => setFormData((prev) => ({ ...prev, floor: e.target.value }))}
                  disabled={!formData.building}
                  className="h-[36px] w-full rounded-[8px] border border-slate-200 bg-white px-[10px] text-[12.5px] font-medium text-slate-800 outline-none focus:border-indigo-500 disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <option value="">Building Total (Entire Building)</option>
                  {availableFloors.map((f) => (
                    <option key={f.name} value={f.name}>
                      {f.name} {f.code ? `(${f.code})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ── 3. Category & Scope ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px]">
            <div className="flex flex-col gap-[6px]">
              <label className="text-[12.5px] font-semibold text-slate-700">
                Activity Category <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="h-[38px] w-full rounded-[10px] border border-slate-200 bg-white px-[12px] text-[13px] font-medium text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
              >
                {Object.entries(CATEGORY_DEFINITIONS).map(([key, def]) => (
                  <option key={key} value={key}>
                    {def.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-[6px]">
              <label className="text-[12.5px] font-semibold text-slate-700">
                Carbon Scope (Auto-detected)
              </label>
              <div className="flex h-[38px] items-center gap-[8px] rounded-[10px] border border-slate-200 bg-slate-50 px-[12px]">
                <span
                  className={`rounded-full px-[8px] py-[2px] text-[11px] font-bold ${
                    formData.scope === "SCOPE_1"
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-teal-100 text-teal-700"
                  }`}
                >
                  {formData.scope === "SCOPE_1" ? "Scope 1 — Direct" : "Scope 2 — Indirect Energy"}
                </span>
              </div>
            </div>
          </div>

          {/* ── 4. Quantity & Unit ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px]">
            <div className="flex flex-col gap-[6px]">
              <label className="flex items-center justify-between text-[12.5px] font-semibold text-slate-700">
                <span>Quantity Consumed <span className="text-rose-500">*</span></span>
              </label>
              <input
                required
                type="number"
                step="any"
                min="0.001"
                placeholder="e.g. 25000"
                value={formData.quantity}
                onChange={(e) => setFormData((prev) => ({ ...prev, quantity: e.target.value }))}
                className="h-[38px] w-full rounded-[10px] border border-slate-200 bg-white px-[12px] text-[13px] font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>

            <div className="flex flex-col gap-[6px]">
              <label className="text-[12.5px] font-semibold text-slate-700">
                Unit of Measurement <span className="text-rose-500">*</span>
              </label>
              <input
                required
                type="text"
                placeholder="e.g. kWh, L, kg"
                value={formData.unit}
                onChange={(e) => setFormData((prev) => ({ ...prev, unit: e.target.value }))}
                className="h-[38px] w-full rounded-[10px] border border-slate-200 bg-white px-[12px] text-[13px] font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>
          </div>

          {/* ── 5. Activity Date ── */}
          <div className="flex flex-col gap-[6px]">
            <label className="text-[12.5px] font-semibold text-slate-700">
              Activity Date <span className="text-rose-500">*</span>
            </label>
            <input
              required
              type="date"
              min={periodStart}
              max={periodEnd}
              value={formData.activityDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, activityDate: e.target.value }))}
              className="h-[38px] w-full rounded-[10px] border border-slate-200 bg-white px-[12px] text-[13px] font-medium text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>

          {/* ── 6. Description / Notes ── */}
          <div className="flex flex-col gap-[6px]">
            <label className="text-[12.5px] font-semibold text-slate-700">
              Description / Invoice Notes <span className="text-[11px] font-normal text-slate-400">(Optional)</span>
            </label>
            <textarea
              rows={2}
              placeholder="e.g. April 2025 electricity consumption from BESCOM bill #4892"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full resize-none rounded-[10px] border border-slate-200 bg-white p-[10px] text-[13px] text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>

          {/* ── Modal Actions ── */}
          <div className="mt-[8px] flex items-center justify-end gap-[10px] border-t border-slate-100 pt-[14px]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-[10px] border border-slate-200 px-[16px] py-[8px] text-[12.5px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-[10px] bg-indigo-600 px-[18px] py-[8px] text-[12.5px] font-bold text-white shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Saving Draft..." : "Save Draft"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

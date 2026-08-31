"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Building, Buildings, Stack, Sparkle, CalendarBlank, MapPin, Gauge, WarningCircle, UploadSimple } from "@phosphor-icons/react";
import { EASE } from "@/lib/animations";
import { createActivityData, fetchAPI, getReportingPeriods, calculateEmissionsBulk } from "@/lib/api";
import { toast } from "sonner";

interface AddActivityModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CATEGORY_DEFINITIONS: Record<
  string,
  { label: string; group: string; scope: "SCOPE_1" | "SCOPE_2"; defaultUnit: string }
> = {
  PURCHASED_ELECTRICITY: { label: "Purchased Electricity", group: "Energy", scope: "SCOPE_2", defaultUnit: "kWh" },
  PURCHASED_STEAM: { label: "Purchased Steam", group: "Energy", scope: "SCOPE_2", defaultUnit: "kg" },
  DIESEL: { label: "Diesel", group: "Fuel", scope: "SCOPE_1", defaultUnit: "L" },
  PETROL: { label: "Petrol / Gasoline", group: "Fuel", scope: "SCOPE_1", defaultUnit: "L" },
  LPG: { label: "LPG", group: "Fuel", scope: "SCOPE_1", defaultUnit: "kg" },
  NATURAL_GAS: { label: "Natural Gas (PNG)", group: "Fuel", scope: "SCOPE_1", defaultUnit: "m³" },
  REFRIGERANT: { label: "Refrigerants (AC/Chillers)", group: "Refrigerants", scope: "SCOPE_1", defaultUnit: "kg" },
  OWNED_VEHICLE: { label: "University Vehicles", group: "Transportation", scope: "SCOPE_1", defaultUnit: "km" },
};

export default function AddActivityModal({ onClose, onSuccess }: AddActivityModalProps) {
  const [loading, setLoading] = useState(false);
  const [hierarchy, setHierarchy] = useState<any>(null);
  const [periods, setPeriods] = useState<any[]>([]);

  // Form State
  const [campusId, setCampusId] = useState("");
  const [buildingId, setBuildingId] = useState("");
  const [floorId, setFloorId] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [activityDate, setActivityDate] = useState("");
  const [periodId, setPeriodId] = useState("");
  const [dataSource, setDataSource] = useState("Utility Bill");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [hierRes, perRes] = await Promise.all([
          fetchAPI("/onboarding/hierarchy"),
          getReportingPeriods()
        ]);
        if (hierRes.success) setHierarchy(hierRes.data);
        if (perRes.success) setPeriods(perRes.data);
      } catch (e) {
        console.error(e);
      }
    }
    loadData();
  }, []);

  const campuses = hierarchy?.campuses || [];
  const buildings = campuses.find((c: any) => c.id === campusId)?.buildings || [];
  const floors = buildings.find((b: any) => b.id === buildingId)?.floors || [];

  const handleCategoryChange = (val: string) => {
    setCategory(val);
    setUnit(CATEGORY_DEFINITIONS[val]?.defaultUnit || "");
  };

  const handleSave = async (status: "DRAFT" | "SUBMITTED") => {
    if (!campusId || !category || !quantity || !unit || !activityDate || !periodId) {
      toast.error("Please fill all required fields");
      return;
    }
    
    setLoading(true);
    try {
      const payload = {
        reportingPeriodId: periodId,
        physicalEntityId: floorId || buildingId || campusId,
        category,
        scope: CATEGORY_DEFINITIONS[category].scope,
        quantity: Number(quantity),
        unit,
        activityDate: new Date(activityDate).toISOString(),
        description: notes,
        status,
        inputSource: dataSource.includes("Manual") ? "MANUAL" : "INVOICE"
      };

      const res = await createActivityData(payload) as any;
      
      // Auto-calculate immediately if we got the ID back
      if (res.success && res.data?.id) {
        try {
          await calculateEmissionsBulk({ activity_data_id: res.data.id });
        } catch (calcErr) {
          console.error("Calculation failed:", calcErr);
          toast.warning("Activity saved, but calculation failed.");
        }
      }

      toast.success(status === "SUBMITTED" ? "Activity Submitted for Review" : "Activity Saved as Draft");
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Failed to save activity");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="relative flex h-full max-h-[85vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Add Activity Data</h2>
            <p className="text-sm text-slate-500">Record operational data for carbon footprint calculation.</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100">
            <X size={20} weight="bold" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Location */}
          <section>
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800">
              <MapPin size={16} className="text-indigo-600" weight="fill" /> Where did this activity occur?
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Campus *</label>
                <select value={campusId} onChange={e => { setCampusId(e.target.value); setBuildingId(""); setFloorId(""); }} className="w-full rounded-lg border border-slate-200 p-2 text-sm outline-none focus:border-indigo-500">
                  <option value="">[ Select Campus ]</option>
                  {campuses.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Building (Optional)</label>
                <select value={buildingId} onChange={e => { setBuildingId(e.target.value); setFloorId(""); }} disabled={!campusId} className="w-full rounded-lg border border-slate-200 p-2 text-sm outline-none focus:border-indigo-500 disabled:bg-slate-50 disabled:text-slate-400">
                  <option value="">[ Select Building ]</option>
                  {buildings.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Floor (Optional)</label>
                <select value={floorId} onChange={e => setFloorId(e.target.value)} disabled={!buildingId} className="w-full rounded-lg border border-slate-200 p-2 text-sm outline-none focus:border-indigo-500 disabled:bg-slate-50 disabled:text-slate-400">
                  <option value="">[ Select Floor ]</option>
                  {floors.map((f: any) => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>
            </div>
          </section>

          {/* Activity Type & Consumption */}
          <section className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800">
                <Sparkle size={16} className="text-indigo-600" weight="fill" /> What activity are you recording?
              </h3>
              <select value={category} onChange={e => handleCategoryChange(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2 text-sm outline-none focus:border-indigo-500">
                <option value="">Select Activity Type</option>
                {Object.entries(CATEGORY_DEFINITIONS).map(([key, def]) => (
                  <option key={key} value={key}>{def.group} - {def.label}</option>
                ))}
              </select>
            </div>
            
            <div className={`transition-opacity ${category ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800">
                <Gauge size={16} className="text-indigo-600" weight="fill" /> Actual Consumption
              </h3>
              <div className="flex gap-3">
                <div className="flex-1">
                  <input type="number" placeholder="Quantity" value={quantity} onChange={e => setQuantity(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2 text-sm outline-none focus:border-indigo-500" />
                </div>
                <div className="w-24 shrink-0">
                  <input type="text" placeholder="Unit" value={unit} onChange={e => setUnit(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2 text-sm outline-none focus:border-indigo-500 bg-slate-50" />
                </div>
              </div>
            </div>
          </section>

          {/* Date & Evidence */}
          <section className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800">
                <CalendarBlank size={16} className="text-indigo-600" weight="fill" /> Period & Date
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">Reporting Period *</label>
                  <select value={periodId} onChange={e => setPeriodId(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2 text-sm outline-none focus:border-indigo-500">
                    <option value="">Select Period</option>
                    {periods.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">Activity Date *</label>
                  <input type="date" value={activityDate} onChange={e => setActivityDate(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2 text-sm outline-none focus:border-indigo-500" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800">
                <UploadSimple size={16} className="text-indigo-600" weight="fill" /> Data Source & Evidence
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">Source Type</label>
                  <select value={dataSource} onChange={e => setDataSource(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2 text-sm outline-none focus:border-indigo-500">
                    <option>Utility Bill</option>
                    <option>Meter Reading</option>
                    <option>Invoice</option>
                    <option>Estimated</option>
                    <option>Manual Entry</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">Upload Document (Optional)</label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-200 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadSimple size={24} className="text-slate-400 mb-2" />
                        <p className="text-xs text-slate-500">Click or drag file here</p>
                      </div>
                      <input type="file" className="hidden" />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Notes */}
          <section>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-800">
              <WarningCircle size={16} className="text-indigo-600" weight="fill" /> Reason / Notes
            </h3>
            <textarea
              placeholder="Any additional context or explanation for this entry..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-indigo-500 min-h-[80px]"
            />
          </section>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
          <button onClick={onClose} disabled={loading} className="rounded-lg px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200">
            Cancel
          </button>
          <button onClick={() => handleSave("DRAFT")} disabled={loading} className="rounded-lg bg-white border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50">
            💾 Save as Draft
          </button>
          <button onClick={() => handleSave("SUBMITTED")} disabled={loading} className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-bold text-white shadow-sm hover:bg-indigo-700">
            📤 Submit for Review
          </button>
        </div>
      </motion.div>
    </div>
  );
}

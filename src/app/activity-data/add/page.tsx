"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { EASE } from "@/lib/animations";
import {
  ArrowLeft,
  Lightning,
  Flame,
  Snowflake,
  Car,
  Drop,
  Wind,
  CaretDown,
  CheckCircle,
  PaperPlaneRight,
  FloppyDisk,
  X,
  Plus,
  Buildings,
  Leaf,
} from "@phosphor-icons/react";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import {
  createActivityData,
  fetchAPI,
  getReportingPeriods,
  calculateEmissionsBulk,
  getAssets,
  createAsset,
} from "@/lib/api";
import { toast } from "sonner";

/* ─── Category Definitions ──────────────────────────────────────────── */
const CATEGORIES = [
  { key: "PURCHASED_ELECTRICITY", label: "Electricity", sub: "Grid power consumption", group: "Energy", scope: "SCOPE_2" as const, unit: "kWh", Icon: Lightning, color: "#f59e0b", bg: "#fffbeb", border: "#fde68a" },
  { key: "PURCHASED_STEAM",       label: "Steam",       sub: "Purchased steam/heat",   group: "Energy", scope: "SCOPE_2" as const, unit: "kg",  Icon: Wind,      color: "#06b6d4", bg: "#ecfeff", border: "#a5f3fc" },
  { key: "DIESEL",                label: "Diesel",      sub: "Diesel fuel usage",       group: "Fuel",   scope: "SCOPE_1" as const, unit: "L",   Icon: Drop,      color: "#ef4444", bg: "#fef2f2", border: "#fecaca" },
  { key: "PETROL",                label: "Petrol",      sub: "Petrol / Gasoline",       group: "Fuel",   scope: "SCOPE_1" as const, unit: "L",   Icon: Flame,     color: "#f97316", bg: "#fff7ed", border: "#fed7aa" },
  { key: "LPG",                   label: "LPG",         sub: "Liquefied petroleum gas", group: "Fuel",   scope: "SCOPE_1" as const, unit: "kg",  Icon: Flame,     color: "#8b5cf6", bg: "#f5f3ff", border: "#ddd6fe" },
  { key: "NATURAL_GAS",           label: "Natural Gas", sub: "PNG / piped gas",         group: "Fuel",   scope: "SCOPE_1" as const, unit: "m³",  Icon: Wind,      color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe" },
  { key: "REFRIGERANT",           label: "Refrigerant", sub: "AC / chiller leakage",   group: "Refrigerants", scope: "SCOPE_1" as const, unit: "kg", Icon: Snowflake, color: "#0ea5e9", bg: "#f0f9ff", border: "#bae6fd" },
  { key: "OWNED_VEHICLE",         label: "Vehicles",    sub: "University-owned fleet",  group: "Transport", scope: "SCOPE_1" as const, unit: "km", Icon: Car,      color: "#10b981", bg: "#f0fdf4", border: "#bbf7d0" },
];

/* ─── Custom Select ─────────────────────────────────────────────────── */
function CustomSelect({
  label, required, placeholder, value, onChange, options, disabled,
}: {
  label: string; required?: boolean; placeholder: string;
  value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value);

  return (
    <div className="relative">
      <label className="mb-1.5 block text-xs font-semibold text-[#52525b]">
        {label}{required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(p => !p)}
        className={`flex w-full items-center justify-between rounded-[10px] border px-3.5 py-2.5 text-sm transition-all
          ${disabled ? "bg-[#f4f4f5] border-[#e4e4e7] text-[#a1a1aa] cursor-not-allowed" :
            open ? "border-indigo-500 ring-2 ring-indigo-500/10 bg-white text-[#18181b]" :
            "border-[#e4e4e7] bg-white text-[#18181b] hover:border-[#a1a1aa]"}`}
      >
        <span className={selected ? "text-[#18181b]" : "text-[#a1a1aa]"}>
          {selected ? selected.label : placeholder}
        </span>
        <CaretDown size={14} weight="bold" className={`shrink-0 text-[#a1a1aa] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-[10px] border border-[#e4e4e7] bg-white shadow-xl"
          >
            {options.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`flex w-full items-center justify-between px-3.5 py-2.5 text-sm transition-colors
                  ${opt.value === value ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-[#18181b] hover:bg-[#f4f4f5]"}`}
              >
                {opt.label}
                {opt.value === value && <CheckCircle size={15} weight="fill" className="text-indigo-500" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────────── */
export default function AddActivityPage() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hierarchy, setHierarchy] = useState<any>(null);
  const [periods, setPeriods] = useState<any[]>([]);
  const [allAssets, setAllAssets] = useState<any[]>([]);
  const [fromSetup, setFromSetup] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setFromSetup(!!localStorage.getItem("setup_return"));
    }
  }, []);

  // Form State
  const [campusId, setCampusId] = useState("");
  const [buildingId, setBuildingId] = useState("");
  const [floorId, setFloorId] = useState("");
  const [assetId, setAssetId] = useState("");
  const [addingAsset, setAddingAsset] = useState(false);
  const [newAssetName, setNewAssetName] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [activityDate, setActivityDate] = useState("");
  const [periodId, setPeriodId] = useState("");
  const [dataSource, setDataSource] = useState("Utility Bill");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [h, p, a] = await Promise.all([fetchAPI("/onboarding/hierarchy"), getReportingPeriods(), getAssets()]);
        if (h.success) {
          setHierarchy(h.data);
          const cs = h.data?.campuses || [];
          if (cs.length === 1) {
            setCampusId(cs[0].id);
            const bs = cs[0].buildings || [];
            if (bs.length === 1) { setBuildingId(bs[0].id); const fs = bs[0].floors || []; if (fs.length === 1) setFloorId(fs[0].id); }
          }
        }
        if (p.success) { setPeriods(p.data); if (p.data.length === 1) setPeriodId(p.data[0].id); }
        if (a.success) setAllAssets(a.data);
      } catch {}
    })();
  }, []);

  const campuses  = hierarchy?.campuses || [];
  const buildings = campuses.find((c: any) => c.id === campusId)?.buildings || [];
  const floors    = buildings.find((b: any) => b.id === buildingId)?.floors  || [];
  const assets    = allAssets.filter(a => floorId ? a.locationId === floorId : buildingId ? a.locationId === buildingId : campusId ? a.locationId === campusId : true);

  const selectedCat = CATEGORIES.find(c => c.key === category);

  const handleCategorySelect = (key: string) => {
    setCategory(key);
    setUnit(CATEGORIES.find(c => c.key === key)?.unit || "");
  };

  const handleCreateAsset = async () => {
    if (!newAssetName || !campusId) return;
    try {
      const r = await createAsset({ name: newAssetName, assetType: "Equipment", locationId: floorId || buildingId || campusId }) as any;
      if (r.success && r.data) { setAllAssets(p => [...p, r.data]); setAssetId(r.data.id); setAddingAsset(false); setNewAssetName(""); toast.success("Asset added"); }
    } catch (e: any) { toast.error(e.message || "Failed to create asset"); }
  };

  const handleSave = async (status: "DRAFT" | "SUBMITTED") => {
    if (!campusId || !category || !quantity || !unit || !activityDate || !periodId) { toast.error("Please fill all required fields"); return; }
    setSaving(true);
    try {
      const r = await createActivityData({ reportingPeriodId: periodId, physicalEntityId: assetId || floorId || buildingId || campusId, category, scope: selectedCat!.scope, quantity: Number(quantity), unit, activityDate: new Date(activityDate).toISOString(), description: notes, status, inputSource: dataSource.includes("Manual") ? "MANUAL" : "INVOICE" }) as any;
      if (r.success && r.data?.id) { try { await calculateEmissionsBulk({ activity_data_id: r.data.id }); } catch {} }
      toast.success(status === "SUBMITTED" ? "Submitted for Review" : "Saved as Draft");
      router.push("/activity-data");
    } catch (e: any) { toast.error(e.message || "Failed to save"); }
    finally { setSaving(false); }
  };

  // Completion check for each step
  const step1Done = !!campusId;
  const step2Done = !!category;
  const step3Done = !!quantity && !!unit;
  const step4Done = !!activityDate && !!periodId;

  return (
    <div className="flex h-screen flex-row bg-[#f8f8fa]">
      {!fromSetup && <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} active="activity-data" onChange={() => {}} />}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar onMenu={fromSetup ? undefined : () => setMenuOpen(true)} title="Add Activity Data" subtitle="Record operational emissions data" />

        <main className="flex-1 overflow-y-auto px-5 py-6 md:px-8">
          <div className="mx-auto max-w-[820px]">

            {/* Back */}
            <button onClick={() => router.push("/activity-data")} className="mb-5 flex items-center gap-2 text-[13px] font-semibold text-[#71717a] hover:text-[#18181b] transition-colors">
              <ArrowLeft size={15} weight="bold" /> Back to Activity Data
            </button>

            {/* Progress pills */}
            <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-1">
              {[
                { n: "1", label: "Location", done: step1Done },
                { n: "2", label: "Activity Type", done: step2Done },
                { n: "3", label: "Quantity", done: step3Done },
                { n: "4", label: "Date & Period", done: step4Done },
              ].map((s, i, arr) => (
                <div key={s.n} className="flex items-center gap-2 shrink-0">
                  <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${s.done ? "bg-[#16a34a] text-white" : "bg-white border border-[#e4e4e7] text-[#71717a]"}`}>
                    {s.done ? <CheckCircle size={13} weight="fill" /> : <span className="h-3.5 w-3.5 rounded-full border border-current flex items-center justify-center text-[10px]">{s.n}</span>}
                    {s.label}
                  </div>
                  {i < arr.length - 1 && <div className="h-px w-4 bg-[#e4e4e7] shrink-0" />}
                </div>
              ))}
            </div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: EASE }} className="space-y-4">

              {/* ── CARD 1: Location ─────────────────────────────────── */}
              <div className="rounded-[16px] border border-[#e4e4e7] bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#eef2ff] text-[#4f46e5]">
                    <Buildings size={16} weight="fill" />
                  </div>
                  <div>
                    <h2 className="text-[14px] font-bold text-[#18181b]">Location</h2>
                    <p className="text-[12px] text-[#71717a]">Where did this activity take place?</p>
                  </div>
                  {step1Done && <CheckCircle size={18} weight="fill" className="ml-auto text-[#16a34a]" />}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <CustomSelect
                    label="Campus" required placeholder="Select campus"
                    value={campusId}
                    onChange={v => { setCampusId(v); setBuildingId(""); setFloorId(""); setAssetId(""); }}
                    options={campuses.map((c: any) => ({ value: c.id, label: c.name }))}
                  />
                  <CustomSelect
                    label="Building" placeholder="Select building (optional)"
                    value={buildingId}
                    onChange={v => { setBuildingId(v); setFloorId(""); setAssetId(""); }}
                    options={buildings.map((b: any) => ({ value: b.id, label: b.name }))}
                    disabled={!campusId}
                  />
                  <CustomSelect
                    label="Floor" placeholder="Select floor (optional)"
                    value={floorId} onChange={v => { setFloorId(v); setAssetId(""); }}
                    options={floors.map((f: any) => ({ value: f.id, label: f.name }))}
                    disabled={!buildingId}
                  />
                </div>

                {/* Asset */}
                <div className="mt-4 rounded-[10px] bg-[#f8f8fa] border border-[#f0f0f0] p-4">
                  <div className="mb-2.5 flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#52525b]">Asset / Equipment <span className="font-normal text-[#a1a1aa]">(optional)</span></span>
                    {!addingAsset && (
                      <button type="button" onClick={() => setAddingAsset(true)} disabled={!campusId} className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed">
                        <Plus size={12} weight="bold" /> Add Asset
                      </button>
                    )}
                  </div>
                  {addingAsset ? (
                    <div className="flex gap-2">
                      <input type="text" placeholder="e.g. Main Diesel Generator" value={newAssetName} onChange={e => setNewAssetName(e.target.value)}
                        className="flex-1 rounded-[8px] border border-[#e4e4e7] bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10" />
                      <button type="button" onClick={handleCreateAsset} disabled={!newAssetName || !campusId}
                        className="rounded-[8px] bg-indigo-600 px-3 py-2 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-40">Save</button>
                      <button type="button" onClick={() => { setAddingAsset(false); setNewAssetName(""); }}
                        className="rounded-[8px] border border-[#e4e4e7] bg-white px-3 py-2 text-sm text-[#52525b] hover:bg-[#f4f4f5]">
                        <X size={14} weight="bold" />
                      </button>
                    </div>
                  ) : (
                    <CustomSelect label="" placeholder="Select asset or leave blank" value={assetId} onChange={setAssetId}
                      options={assets.map((a: any) => ({ value: a.id, label: a.name }))} disabled={!campusId} />
                  )}
                </div>
              </div>

              {/* ── CARD 2: Activity Type ─────────────────────────────── */}
              <div className="rounded-[16px] border border-[#e4e4e7] bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#fefce8] text-[#ca8a04]">
                    <Leaf size={16} weight="fill" />
                  </div>
                  <div>
                    <h2 className="text-[14px] font-bold text-[#18181b]">Activity Type</h2>
                    <p className="text-[12px] text-[#71717a]">What kind of emission source is this?</p>
                  </div>
                  {step2Done && <CheckCircle size={18} weight="fill" className="ml-auto text-[#16a34a]" />}
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {CATEGORIES.map(cat => {
                    const isSelected = category === cat.key;
                    return (
                      <button
                        key={cat.key}
                        type="button"
                        onClick={() => handleCategorySelect(cat.key)}
                        className="group relative flex flex-col items-start rounded-[12px] border-2 p-3.5 text-left transition-all"
                        style={{
                          borderColor: isSelected ? cat.color : "#e4e4e7",
                          background: isSelected ? cat.bg : "#fff",
                        }}
                      >
                        <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-[8px]" style={{ background: isSelected ? cat.color + "22" : "#f4f4f5" }}>
                          <cat.Icon size={16} weight="fill" style={{ color: isSelected ? cat.color : "#71717a" }} />
                        </div>
                        <p className="text-[13px] font-bold leading-tight" style={{ color: isSelected ? "#18181b" : "#3f3f46" }}>{cat.label}</p>
                        <p className="mt-0.5 text-[11px] leading-tight" style={{ color: isSelected ? "#52525b" : "#a1a1aa" }}>{cat.sub}</p>
                        <span className="mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold"
                          style={{ background: cat.scope === "SCOPE_1" ? "#fef2f2" : "#eff6ff", color: cat.scope === "SCOPE_1" ? "#ef4444" : "#3b82f6" }}>
                          {cat.scope.replace("_", " ")}
                        </span>
                        {isSelected && <CheckCircle size={14} weight="fill" className="absolute right-2.5 top-2.5" style={{ color: cat.color }} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── CARD 3: Quantity ──────────────────────────────────── */}
              <div className={`rounded-[16px] border border-[#e4e4e7] bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)] transition-opacity ${!category ? "opacity-50" : "opacity-100"}`}>
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-[8px]" style={{ background: selectedCat ? selectedCat.bg : "#f4f4f5" }}>
                    {selectedCat ? <selectedCat.Icon size={16} weight="fill" style={{ color: selectedCat.color }} /> : <Leaf size={16} weight="fill" className="text-[#a1a1aa]" />}
                  </div>
                  <div>
                    <h2 className="text-[14px] font-bold text-[#18181b]">
                      {selectedCat ? `${selectedCat.label} Consumption` : "Consumption"}
                    </h2>
                    <p className="text-[12px] text-[#71717a]">{selectedCat ? `Enter the actual ${selectedCat.label.toLowerCase()} consumed. Default unit: ${selectedCat.unit}` : "Select an activity type first"}</p>
                  </div>
                  {step3Done && <CheckCircle size={18} weight="fill" className="ml-auto text-[#16a34a]" />}
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="mb-1.5 block text-xs font-semibold text-[#52525b]">Quantity <span className="text-red-500">*</span></label>
                    <input
                      type="number" min="0" placeholder="0.00"
                      value={quantity} onChange={e => setQuantity(e.target.value)}
                      disabled={!category}
                      className="w-full rounded-[10px] border border-[#e4e4e7] px-3.5 py-2.5 text-sm font-medium text-[#18181b] outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 disabled:bg-[#f4f4f5] disabled:cursor-not-allowed placeholder:text-[#a1a1aa]"
                    />
                  </div>
                  <div className="w-28 shrink-0">
                    <label className="mb-1.5 block text-xs font-semibold text-[#52525b]">Unit <span className="text-red-500">*</span></label>
                    <input
                      type="text" placeholder="Unit"
                      value={unit} onChange={e => setUnit(e.target.value)}
                      disabled={!category}
                      className="w-full rounded-[10px] border border-[#e4e4e7] bg-[#f8f8fa] px-3.5 py-2.5 text-sm font-semibold text-[#18181b] outline-none transition focus:border-indigo-500 disabled:cursor-not-allowed placeholder:text-[#a1a1aa]"
                    />
                  </div>
                </div>
              </div>

              {/* ── CARD 4: Date & Period ─────────────────────────────── */}
              <div className="rounded-[16px] border border-[#e4e4e7] bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#f0fdf4] text-[#16a34a]">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM72,48v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24V80H48V48ZM208,208H48V96H208V208Zm-96-88a8,8,0,0,1-8,8H88a8,8,0,0,1,0-16h16A8,8,0,0,1,112,120Zm48,0a8,8,0,0,1-8,8H136a8,8,0,0,1,0-16h16A8,8,0,0,1,160,120Zm-48,40a8,8,0,0,1-8,8H88a8,8,0,0,1,0-16h16A8,8,0,0,1,112,160Zm48,0a8,8,0,0,1-8,8H136a8,8,0,0,1,0-16h16A8,8,0,0,1,160,160Z"/></svg>
                  </div>
                  <div>
                    <h2 className="text-[14px] font-bold text-[#18181b]">Date &amp; Reporting Period</h2>
                    <p className="text-[12px] text-[#71717a]">When did this activity happen?</p>
                  </div>
                  {step4Done && <CheckCircle size={18} weight="fill" className="ml-auto text-[#16a34a]" />}
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-[#52525b]">Activity Date <span className="text-red-500">*</span></label>
                    <input type="date" value={activityDate} onChange={e => setActivityDate(e.target.value)}
                      className="w-full rounded-[10px] border border-[#e4e4e7] bg-white px-3.5 py-2.5 text-sm text-[#18181b] outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10" />
                  </div>
                  <CustomSelect
                    label="Reporting Period" required placeholder="Select period"
                    value={periodId} onChange={setPeriodId}
                    options={periods.map(p => ({ value: p.id, label: p.name }))}
                  />
                </div>
              </div>

              {/* ── CARD 5: Source & Notes ────────────────────────────── */}
              <div className="rounded-[16px] border border-[#e4e4e7] bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#faf5ff] text-[#9333ea]">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Zm-32-80a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,136Zm0,32a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,168Z"/></svg>
                  </div>
                  <div>
                    <h2 className="text-[14px] font-bold text-[#18181b]">Source &amp; Notes</h2>
                    <p className="text-[12px] text-[#71717a]">Evidence and additional context</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <CustomSelect label="Data Source" placeholder="Select source type" value={dataSource} onChange={setDataSource}
                    options={["Utility Bill","Meter Reading","Invoice","Estimated","Manual Entry"].map(v => ({ value: v, label: v }))} />
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-[#52525b]">Notes / Reason <span className="font-normal text-[#a1a1aa]">(optional)</span></label>
                    <textarea
                      rows={3} placeholder="Any additional context or explanation..."
                      value={notes} onChange={e => setNotes(e.target.value)}
                      className="w-full resize-none rounded-[10px] border border-[#e4e4e7] px-3.5 py-2.5 text-sm text-[#18181b] outline-none transition placeholder:text-[#a1a1aa] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                    />
                  </div>
                </div>
              </div>

              {/* ── ACTION BAR ───────────────────────────────────────── */}
              <div className="flex items-center justify-between gap-3 rounded-[16px] border border-[#e4e4e7] bg-white px-6 py-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                <p className="text-[12px] text-[#a1a1aa]">
                  {[step1Done, step2Done, step3Done, step4Done].filter(Boolean).length} of 4 required sections completed
                </p>
                <div className="flex items-center gap-2">
                  <button onClick={() => router.push("/activity-data")} disabled={saving}
                    className="rounded-[8px] border border-[#e4e4e7] bg-white px-4 py-2 text-[13px] font-semibold text-[#52525b] hover:bg-[#f4f4f5] transition-colors">
                    Cancel
                  </button>
                  <button onClick={() => handleSave("DRAFT")} disabled={saving}
                    className="flex items-center gap-2 rounded-[8px] border border-[#e4e4e7] bg-white px-4 py-2 text-[13px] font-bold text-[#18181b] shadow-sm hover:bg-[#f4f4f5] transition-colors disabled:opacity-50">
                    <FloppyDisk size={14} weight="bold" />
                    {saving ? "Saving..." : "Save Draft"}
                  </button>
                  <button onClick={() => handleSave("SUBMITTED")} disabled={saving}
                    className="flex items-center gap-2 rounded-[8px] bg-[#16a34a] px-5 py-2 text-[13px] font-bold text-white shadow-sm hover:bg-[#15803d] transition-colors disabled:opacity-50">
                    <PaperPlaneRight size={14} weight="bold" />
                    {saving ? "Submitting..." : "Submit for Review"}
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}

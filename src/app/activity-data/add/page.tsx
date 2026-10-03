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
  CalendarBlank,
  FileText,
  Sparkle,
  MapPin,
  Gauge,
  Info,
} from "@phosphor-icons/react";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import {
  createActivityData,
  fetchAPI,
  getReportingPeriods,
  getAssets,
  createAsset,
} from "@/lib/api";
import { toast } from "sonner";
import { useReportingPeriodContext } from "@/context/ReportingPeriodContext";
import { useReportingPeriodStatus } from "@/hooks/useReportingPeriodStatus";

/* ─── Category Definitions ──────────────────────────────────────────── */
const CATEGORIES = [
  {
    key: "PURCHASED_ELECTRICITY",
    label: "Electricity",
    sub: "Grid power consumption",
    group: "Energy",
    scope: "SCOPE_2" as const,
    unit: "kWh",
    Icon: Lightning,
    accent: "teal",
    color: "#0d9488",
    bg: "#f0fdfa",
    border: "#99f6e4",
  },
  {
    key: "PURCHASED_STEAM",
    label: "Steam / Heat",
    sub: "Purchased district steam",
    group: "Energy",
    scope: "SCOPE_2" as const,
    unit: "kg",
    Icon: Wind,
    accent: "cyan",
    color: "#0891b2",
    bg: "#ecfeff",
    border: "#a5f3fc",
  },
  {
    key: "DIESEL",
    label: "Diesel Fuel",
    sub: "Generators & heavy machinery",
    group: "Fuel",
    scope: "SCOPE_1" as const,
    unit: "L",
    Icon: Drop,
    accent: "amber",
    color: "#d97706",
    bg: "#fffbeb",
    border: "#fde68a",
  },
  {
    key: "PETROL",
    label: "Petrol / Gasoline",
    sub: "Vehicles & light equipment",
    group: "Fuel",
    scope: "SCOPE_1" as const,
    unit: "L",
    Icon: Flame,
    accent: "orange",
    color: "#ea580c",
    bg: "#fff7ed",
    border: "#fed7aa",
  },
  {
    key: "LPG",
    label: "LPG",
    sub: "Canteens & heating cylinders",
    group: "Fuel",
    scope: "SCOPE_1" as const,
    unit: "kg",
    Icon: Flame,
    accent: "purple",
    color: "#7c3aed",
    bg: "#f5f3ff",
    border: "#ddd6fe",
  },
  {
    key: "NATURAL_GAS",
    label: "Natural Gas (PNG)",
    sub: "Piped gas distribution",
    group: "Fuel",
    scope: "SCOPE_1" as const,
    unit: "m³",
    Icon: Wind,
    accent: "sky",
    color: "#0284c7",
    bg: "#f0f9ff",
    border: "#bae6fd",
  },
  {
    key: "REFRIGERANT",
    label: "Refrigerant",
    sub: "HVAC & chiller fugitive losses",
    group: "Fugitive",
    scope: "SCOPE_1" as const,
    unit: "kg",
    Icon: Snowflake,
    accent: "blue",
    color: "#2563eb",
    bg: "#eff6ff",
    border: "#bfdbfe",
  },
  {
    key: "OWNED_VEHICLE",
    label: "Fleet Transport",
    sub: "Institution owned vehicles",
    group: "Transport",
    scope: "SCOPE_1" as const,
    unit: "km",
    Icon: Car,
    accent: "emerald",
    color: "#059669",
    bg: "#ecfdf5",
    border: "#a7f3d0",
  },
];

/* ─── Custom Select Component ───────────────────────────────────────── */
function CustomSelect({
  label,
  required,
  placeholder,
  value,
  onChange,
  options,
  disabled,
  helper,
}: {
  label: string;
  required?: boolean;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
  helper?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <div className="relative">
      {label && (
        <label className="mb-1.5 flex items-center justify-between text-xs font-bold text-slate-700">
          <span>
            {label}
            {required && <span className="ml-0.5 text-teal-600">*</span>}
          </span>
        </label>
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((p) => !p)}
        className={`flex h-11 w-full items-center justify-between rounded-xl border px-3.5 text-sm font-medium transition-all ${
          disabled
            ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed"
            : open
            ? "border-teal-500 ring-3 ring-teal-500/15 bg-white text-slate-900 shadow-xs"
            : "border-slate-200/90 bg-white text-slate-800 hover:border-teal-300 hover:bg-slate-50/50 shadow-2xs"
        }`}
      >
        <span className={selected ? "text-slate-900 font-semibold" : "text-slate-400"}>
          {selected ? selected.label : placeholder}
        </span>
        <CaretDown
          size={14}
          weight="bold"
          className={`shrink-0 text-slate-400 transition-transform duration-200 ${
            open ? "rotate-180 text-teal-600" : ""
          }`}
        />
      </button>

      {helper && <p className="mt-1 text-[11px] text-slate-500">{helper}</p>}

      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-60 overflow-y-auto rounded-xl border border-teal-100 bg-white p-1 shadow-xl shadow-teal-950/10 backdrop-blur-md"
            >
              {options.length === 0 ? (
                <div className="px-3.5 py-3 text-center text-xs text-slate-400">
                  No options available
                </div>
              ) : (
                options.map((opt) => {
                  const isSelected = opt.value === value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        onChange(opt.value);
                        setOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold transition-colors ${
                        isSelected
                          ? "bg-teal-50 text-teal-900 font-bold"
                          : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <span>{opt.label}</span>
                      {isSelected && (
                        <CheckCircle
                          size={15}
                          weight="fill"
                          className="text-teal-600 shrink-0"
                        />
                      )}
                    </button>
                  );
                })
              )}
            </motion.div>
          </>
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

  const { activePeriodId } = useReportingPeriodContext();
  const { isLocked } = useReportingPeriodStatus();

  // The app-wide active period is the default target; the user can still pick
  // a different one from the dropdown.
  useEffect(() => {
    if (activePeriodId) setPeriodId(activePeriodId);
  }, [activePeriodId]);

  useEffect(() => {
    (async () => {
      try {
        const [h, p, a] = await Promise.all([
          fetchAPI("/onboarding/hierarchy"),
          getReportingPeriods(),
          getAssets(),
        ]);
        if (h.success) {
          setHierarchy(h.data);
          const cs = h.data?.campuses || [];
          if (cs.length === 1) {
            setCampusId(cs[0].id);
            const bs = cs[0].buildings || [];
            if (bs.length === 1) {
              setBuildingId(bs[0].id);
              const fs = bs[0].buildings?.[0]?.floors || bs[0].floors || [];
              if (fs.length === 1) setFloorId(fs[0].id);
            }
          }
        }
        if (p.success) {
          const list = p.data || [];
          setPeriods(list);
          // Default to the app-wide active period so the user never has to pick
          // when there is only one obvious choice (or anything at all).
          const preferred =
            list.find((x: any) => x.id === activePeriodId && x.status !== "LOCKED") ||
            list.find((x: any) => x.id === activePeriodId) ||
            list.find((x: any) => x.status === "OPEN") ||
            (list.length === 1 ? list[0] : undefined);
          if (preferred) setPeriodId(preferred.id);
        }
        if (a.success) setAllAssets(a.data);
      } catch {
        // Non-fatal: the form still renders and reports missing fields on save.
      }
    })();
  }, [activePeriodId]);

  const campuses = hierarchy?.campuses || [];
  const buildings =
    campuses.find((c: any) => c.id === campusId)?.buildings || [];
  const floors =
    buildings.find((b: any) => b.id === buildingId)?.floors || [];
  const assets = allAssets.filter((a) =>
    floorId
      ? a.locationId === floorId
      : buildingId
      ? a.locationId === buildingId
      : campusId
      ? a.locationId === campusId
      : true
  );

  const selectedCat = CATEGORIES.find((c) => c.key === category);

  const handleCategorySelect = (key: string) => {
    setCategory(key);
    const cat = CATEGORIES.find((c) => c.key === key);
    if (cat) {
      setUnit(cat.unit);
    }
  };

  const handleCreateAsset = async () => {
    if (!newAssetName || !campusId) return;
    try {
      const r = (await createAsset({
        name: newAssetName,
        assetType: "Equipment",
        locationId: floorId || buildingId || campusId,
      })) as any;
      if (r.success && r.data) {
        setAllAssets((p) => [...p, r.data]);
        setAssetId(r.data.id);
        setAddingAsset(false);
        setNewAssetName("");
        toast.success("Asset added successfully");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to create asset");
    }
  };

  const handleSave = async (status: "DRAFT" | "SUBMITTED") => {
    if (isLocked) {
      toast.error("This reporting period is locked. Unlock it before adding activity data.");
      return;
    }
    if (!campusId) {
      toast.error("Please select a Campus / Location");
      return;
    }
    if (!category) {
      toast.error("Please select an Activity Category");
      return;
    }
    if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) {
      toast.error("Please enter a valid positive quantity");
      return;
    }
    if (!unit) {
      toast.error("Please specify a unit");
      return;
    }
    if (!activityDate) {
      toast.error("Please select an Activity Date");
      return;
    }
    if (!periodId) {
      toast.error("Please select a Reporting Period");
      return;
    }

    // Never let an unrecognised category be silently mislabelled as Scope 1.
    if (!selectedCat) {
      toast.error("Please select a valid Activity Category");
      return;
    }

    setSaving(true);
    try {
      await createActivityData({
        reportingPeriodId: periodId,
        physicalEntityId: assetId || floorId || buildingId || campusId,
        category,
        scope: selectedCat.scope,
        quantity: Number(quantity),
        unit,
        activityDate: new Date(activityDate).toISOString(),
        description: notes,
        status,
        inputSource: dataSource.includes("Manual") ? "MANUAL" : "INVOICE",
      });
      toast.success(
        status === "SUBMITTED"
          ? "Submitted for Verification ✅"
          : "Saved as Draft 📝"
      );
      router.push("/activity-data");
    } catch (e: any) {
      toast.error(e.message || "Failed to save activity");
    } finally {
      setSaving(false);
    }
  };

  // Completion check
  const step1Done = !!campusId;
  const step2Done = !!category;
  const step3Done = !!quantity && !!unit;
  const step4Done = !!activityDate && !!periodId;
  const completedCount = [step1Done, step2Done, step3Done, step4Done].filter(
    Boolean
  ).length;

  return (
    <div className="flex h-screen flex-row bg-[#f8fafc]">
      <Sidebar
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        active="activity-data"
        onChange={() => {}}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-gradient-to-b from-[#f0fbf9]/60 via-[#f8fafc] to-[#edf9f7]/40">
        <Topbar
          onMenu={() => setMenuOpen(true)}
          title="Add Activity Data"
          subtitle="Record operational greenhouse gas emissions and activity metrics"
        />

        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">
          <div className="mx-auto max-w-[860px]">
            {/* ── Breadcrumb & Return ── */}
            <div className="mb-5 flex items-center justify-between">
              <button
                onClick={() => router.push("/activity-data")}
                className="group inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-teal-700 transition-colors bg-white border border-teal-100/90 rounded-xl px-3.5 py-2 shadow-2xs hover:border-teal-300"
              >
                <ArrowLeft
                  size={14}
                  weight="bold"
                  className="transition-transform group-hover:-translate-x-0.5 text-teal-600"
                />
                <span>Back to Activity Log</span>
              </button>

              <div className="inline-flex items-center gap-2 rounded-full border border-teal-200/80 bg-teal-50/90 px-3 py-1 text-xs font-bold text-teal-800 shadow-2xs">
                <Sparkle size={13} weight="fill" className="text-teal-600" />
                <span>Standard GHG Protocol Intake</span>
              </div>
            </div>

            {/* ── Progress Milestone Header ── */}
            <div className="mb-6 rounded-2xl border border-teal-100/90 bg-white/95 p-4 sm:p-5 shadow-[0_4px_20px_rgba(13,148,136,0.04)] backdrop-blur-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <span>Intake Progress</span>
                    <span className="text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">
                      {completedCount} of 4 Completed
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Complete all 4 required sections before final submission.
                  </p>
                </div>
                {/* Progress bar */}
                <div className="w-full sm:w-44 h-2.5 rounded-full bg-slate-100 overflow-hidden p-0.5 border border-slate-200/60">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-teal-500 via-cyan-500 to-sky-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${(completedCount / 4) * 100}%` }}
                    transition={{ duration: 0.4, ease: EASE }}
                  />
                </div>
              </div>

              {/* Milestone chips */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { n: "01", label: "Facility", done: step1Done },
                  { n: "02", label: "Category", done: step2Done },
                  { n: "03", label: "Consumption", done: step3Done },
                  { n: "04", label: "Accounting Period", done: step4Done },
                ].map((s) => (
                  <div
                    key={s.n}
                    className={`flex items-center gap-2 rounded-xl p-2.5 border transition-all ${
                      s.done
                        ? "border-teal-200 bg-teal-50/70 text-teal-900 font-bold shadow-2xs"
                        : "border-slate-200/80 bg-slate-50/60 text-slate-500 font-medium"
                    }`}
                  >
                    <span
                      className={`flex size-5 items-center justify-center rounded-lg text-[10px] font-black ${
                        s.done
                          ? "bg-teal-600 text-white"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {s.done ? "✓" : s.n}
                    </span>
                    <span className="text-xs truncate">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Form Stack ── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="space-y-6"
            >
              {/* ── CARD 1: Facility & Location ── */}
              <div className="rounded-2xl border border-teal-100/80 bg-white p-5 sm:p-6 shadow-[0_8px_30px_rgba(13,148,136,0.03)] hover:border-teal-200 transition-colors">
                <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="flex size-7 items-center justify-center rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-xs font-black">
                      01
                    </span>
                    <div>
                      <h2 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                        <MapPin size={16} className="text-teal-600" weight="bold" />
                        Facility &amp; Location
                      </h2>
                      <p className="text-xs text-slate-500">
                        Specify where this emission generating activity took place
                      </p>
                    </div>
                  </div>
                  {step1Done && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-lg">
                      <CheckCircle size={14} weight="fill" className="text-teal-600" />
                      Selected
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <CustomSelect
                    label="Campus Site"
                    required
                    placeholder="Select campus"
                    value={campusId}
                    onChange={(v) => {
                      setCampusId(v);
                      setBuildingId("");
                      setFloorId("");
                      setAssetId("");
                    }}
                    options={campuses.map((c: any) => ({
                      value: c.id,
                      label: c.name,
                    }))}
                  />
                  <CustomSelect
                    label="Building / Facility"
                    placeholder="Select building (optional)"
                    value={buildingId}
                    onChange={(v) => {
                      setBuildingId(v);
                      setFloorId("");
                      setAssetId("");
                    }}
                    options={buildings.map((b: any) => ({
                      value: b.id,
                      label: b.name,
                    }))}
                    disabled={!campusId}
                  />
                  <CustomSelect
                    label="Floor / Department"
                    placeholder="Select floor (optional)"
                    value={floorId}
                    onChange={(v) => {
                      setFloorId(v);
                      setAssetId("");
                    }}
                    options={floors.map((f: any) => ({
                      value: f.id,
                      label: f.name,
                    }))}
                    disabled={!buildingId}
                  />
                </div>

                {/* Asset / Equipment sub-card */}
                <div className="mt-5 rounded-xl bg-gradient-to-br from-[#f8fafc] to-[#f0fbf9]/60 border border-teal-100/70 p-4">
                  <div className="mb-2.5 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Buildings size={14} className="text-teal-600" weight="bold" />
                      Specific Equipment / Meter{" "}
                      <span className="text-[11px] font-medium text-slate-400">
                        (optional)
                      </span>
                    </span>
                    {!addingAsset && (
                      <button
                        type="button"
                        onClick={() => setAddingAsset(true)}
                        disabled={!campusId}
                        className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      >
                        <Plus size={13} weight="bold" /> Add New Asset
                      </button>
                    )}
                  </div>
                  {addingAsset ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. 500kVA DG Set #1, Central Chiller A"
                        value={newAssetName}
                        onChange={(e) => setNewAssetName(e.target.value)}
                        className="flex-1 rounded-xl border border-teal-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                      />
                      <button
                        type="button"
                        onClick={handleCreateAsset}
                        disabled={!newAssetName || !campusId}
                        className="rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-4 py-2 text-xs font-bold text-white shadow-2xs hover:from-teal-500 hover:to-cyan-500 disabled:opacity-40 cursor-pointer"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAddingAsset(false);
                          setNewAssetName("");
                        }}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                      >
                        <X size={14} weight="bold" />
                      </button>
                    </div>
                  ) : (
                    <CustomSelect
                      label=""
                      placeholder="Select tagged asset or leave blank"
                      value={assetId}
                      onChange={setAssetId}
                      options={assets.map((a: any) => ({
                        value: a.id,
                        label: a.name,
                      }))}
                      disabled={!campusId}
                    />
                  )}
                </div>
              </div>

              {/* ── CARD 2: Activity Category ── */}
              <div className="rounded-2xl border border-teal-100/80 bg-white p-5 sm:p-6 shadow-[0_8px_30px_rgba(13,148,136,0.03)] hover:border-teal-200 transition-colors">
                <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="flex size-7 items-center justify-center rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-xs font-black">
                      02
                    </span>
                    <div>
                      <h2 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                        <Leaf size={16} className="text-teal-600" weight="bold" />
                        Activity Category
                      </h2>
                      <p className="text-xs text-slate-500">
                        Choose the primary emission source classification
                      </p>
                    </div>
                  </div>
                  {step2Done && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-lg">
                      <CheckCircle size={14} weight="fill" className="text-teal-600" />
                      {selectedCat?.label}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {CATEGORIES.map((cat) => {
                    const isSelected = category === cat.key;
                    return (
                      <button
                        key={cat.key}
                        type="button"
                        onClick={() => handleCategorySelect(cat.key)}
                        className={`group relative flex flex-col items-start rounded-2xl border-2 p-4 text-left transition-all cursor-pointer ${
                          isSelected
                            ? "border-teal-500 bg-gradient-to-b from-teal-50/90 to-cyan-50/50 shadow-md ring-2 ring-teal-500/20"
                            : "border-slate-200/90 bg-slate-50/50 hover:border-teal-300 hover:bg-white"
                        }`}
                      >
                        <div
                          className="mb-3 flex size-9 items-center justify-center rounded-xl transition-transform group-hover:scale-105"
                          style={{
                            background: isSelected
                              ? "linear-gradient(135deg, #0d9488, #06b6d4)"
                              : "#e2e8f0",
                            color: isSelected ? "#ffffff" : "#475569",
                          }}
                        >
                          <cat.Icon size={18} weight="fill" />
                        </div>
                        <p className="text-xs font-bold text-slate-900 leading-tight">
                          {cat.label}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-500 leading-tight font-medium">
                          {cat.sub}
                        </p>

                        <div className="mt-3 flex items-center justify-between w-full">
                          <span
                            className={`inline-block rounded-md px-2 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wider ${
                              cat.scope === "SCOPE_1"
                                ? "bg-amber-100 text-amber-900 border border-amber-200"
                                : "bg-teal-100 text-teal-900 border border-teal-200"
                            }`}
                          >
                            {cat.scope.replace("_", " ")}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">
                            {cat.unit}
                          </span>
                        </div>

                        {isSelected && (
                          <CheckCircle
                            size={16}
                            weight="fill"
                            className="absolute right-3 top-3 text-teal-600"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── CARD 3: Consumption & Activity Quantity ── */}
              <div
                className={`rounded-2xl border border-teal-100/80 bg-white p-5 sm:p-6 shadow-[0_8px_30px_rgba(13,148,136,0.03)] hover:border-teal-200 transition-all ${
                  !category ? "opacity-60" : "opacity-100"
                }`}
              >
                <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="flex size-7 items-center justify-center rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-xs font-black">
                      03
                    </span>
                    <div>
                      <h2 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                        <Gauge size={16} className="text-teal-600" weight="bold" />
                        {selectedCat
                          ? `${selectedCat.label} Consumption Metrics`
                          : "Consumption Metrics"}
                      </h2>
                      <p className="text-xs text-slate-500">
                        {selectedCat
                          ? `Enter the net consumption value recorded during the billing interval.`
                          : "Select an activity category above to activate quantity inputs"}
                      </p>
                    </div>
                  </div>
                  {step3Done && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-lg">
                      <CheckCircle size={14} weight="fill" className="text-teal-600" />
                      {quantity} {unit}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>
                        Net Quantity <span className="text-teal-600">*</span>
                      </span>
                      {selectedCat && (
                        <span className="text-[11px] font-semibold text-teal-700">
                          Default Unit: {selectedCat.unit}
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="any"
                        min="0"
                        placeholder="e.g. 14250.00"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        disabled={!category}
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-bold text-slate-900 outline-none transition focus:border-teal-500 focus:ring-3 focus:ring-teal-500/15 disabled:bg-slate-50 disabled:cursor-not-allowed placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-700">
                      Reporting Unit <span className="text-teal-600">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Unit (e.g. kWh, L, kg)"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      disabled={!category}
                      className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm font-extrabold text-slate-900 outline-none transition focus:border-teal-500 disabled:cursor-not-allowed placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {selectedCat && (
                  <div className="mt-4 flex items-center gap-2 rounded-xl bg-teal-50/70 border border-teal-200/70 px-3.5 py-2.5 text-xs text-teal-900 font-medium">
                    <Info size={15} weight="bold" className="text-teal-600 shrink-0" />
                    <span>
                      Standard GHG emissions factors will automatically calculate CO₂e based on <strong>{unit || selectedCat.unit}</strong>.
                    </span>
                  </div>
                )}
              </div>

              {/* ── CARD 4: Date & Accounting Period ── */}
              <div className="rounded-2xl border border-teal-100/80 bg-white p-5 sm:p-6 shadow-[0_8px_30px_rgba(13,148,136,0.03)] hover:border-teal-200 transition-colors">
                <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="flex size-7 items-center justify-center rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-xs font-black">
                      04
                    </span>
                    <div>
                      <h2 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                        <CalendarBlank size={16} className="text-teal-600" weight="bold" />
                        Date &amp; Accounting Period
                      </h2>
                      <p className="text-xs text-slate-500">
                        Align this data point with active reporting cycles
                      </p>
                    </div>
                  </div>
                  {step4Done && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-lg">
                      <CheckCircle size={14} weight="fill" className="text-teal-600" />
                      Assigned
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-700">
                      Activity / Bill Date <span className="text-teal-600">*</span>
                    </label>
                    <input
                      type="date"
                      value={activityDate}
                      onChange={(e) => setActivityDate(e.target.value)}
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-teal-500 focus:ring-3 focus:ring-teal-500/15"
                    />
                  </div>
                  <CustomSelect
                    label="Assigned Reporting Period"
                    required
                    placeholder="Select active reporting period"
                    value={periodId}
                    onChange={setPeriodId}
                    options={periods.map((p) => ({
                      value: p.id,
                      label: p.name,
                    }))}
                  />
                </div>
              </div>

              {/* ── CARD 5: Source & Verification Notes ── */}
              <div className="rounded-2xl border border-teal-100/80 bg-white p-5 sm:p-6 shadow-[0_8px_30px_rgba(13,148,136,0.03)] hover:border-teal-200 transition-colors">
                <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-xs font-black">
                    05
                  </span>
                  <div>
                    <h2 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                      <FileText size={16} className="text-teal-600" weight="bold" />
                      Source &amp; Verification Notes
                    </h2>
                    <p className="text-xs text-slate-500">
                      Audit trail documentation and evidence type
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <CustomSelect
                    label="Primary Data Source"
                    placeholder="Select source document type"
                    value={dataSource}
                    onChange={setDataSource}
                    options={[
                      "Utility Bill",
                      "Meter Reading",
                      "Fuel Invoice / Receipt",
                      "SCADA / BMS Telemetry",
                      "Supplier Statement",
                      "Estimated / Extrapolated",
                      "Manual Entry",
                    ].map((v) => ({ value: v, label: v }))}
                  />

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-700">
                      Auditor Notes / Reference{" "}
                      <span className="font-normal text-slate-400">
                        (optional)
                      </span>
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Invoice #EB-2024-0988 from State Electricity Board. Sub-meter ID: SM-04."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full resize-none rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-3 focus:ring-teal-500/15"
                    />
                  </div>
                </div>
              </div>

              {/* ── Sticky Action Bar ── */}
              <div className="sticky bottom-4 z-30 rounded-2xl border border-teal-200/90 bg-white/95 p-4 shadow-[0_12px_40px_rgba(13,148,136,0.12)] backdrop-blur-xl">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <span className="flex size-2 rounded-full bg-teal-500 animate-pulse" />
                    <span>
                      {completedCount} of 4 mandatory steps ready for intake
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => router.push("/activity-data")}
                      disabled={saving}
                      className="flex-1 sm:flex-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSave("DRAFT")}
                      disabled={saving}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50/80 px-4 py-2.5 text-xs font-bold text-teal-900 hover:bg-teal-100 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <FloppyDisk size={14} weight="bold" />
                      <span>{saving ? "Saving..." : "Save Draft"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSave("SUBMITTED")}
                      disabled={saving || completedCount < 4}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600 px-6 py-2.5 text-xs font-bold text-white shadow-[0_4px_16px_rgba(13,148,136,0.25)] hover:from-teal-500 hover:via-cyan-500 hover:to-sky-500 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <PaperPlaneRight size={14} weight="bold" />
                      <span>{saving ? "Submitting..." : "Submit for Verification"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}

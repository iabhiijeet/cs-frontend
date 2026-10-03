"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { EASE } from "@/lib/animations";

import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import {
  getActivityData,
  deleteActivityData,
  submitActivityData,
} from "@/lib/api";
import {
  Plus,
  UploadSimple,
  PencilSimple,
  Trash,
  Eye,
  PaperPlaneRight,
  LockKey,
  Lightning,
  Flame,
  Snowflake,
  Car,
  Drop,
  Wind,
  Buildings,
  Leaf,
  MagnifyingGlass,
  Funnel,
  CheckCircle,
  Clock,
  ArrowsClockwise,
  ChartBar,
  Database,
  Sparkle,
  Receipt,
  FileXls,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import AddActivityModal from "./AddActivityModal";
import ViewActivityModal from "./ViewActivityModal";
import { useReportingPeriodStatus } from "@/hooks/useReportingPeriodStatus";
import { useReportingPeriodContext } from "@/context/ReportingPeriodContext";

/* â”€â”€â”€ Category Icon & Color Mapping â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function getCategoryMeta(category: string) {
  const c = category?.toUpperCase() || "";
  if (c.includes("ELECTRICITY")) {
    return { label: "Electricity", icon: Lightning, color: "#0d9488", bg: "#f0fdfa", border: "#99f6e4" };
  }
  if (c.includes("STEAM")) {
    return { label: "Steam / Heat", icon: Wind, color: "#0891b2", bg: "#ecfeff", border: "#a5f3fc" };
  }
  if (c.includes("DIESEL")) {
    return { label: "Diesel", icon: Drop, color: "#d97706", bg: "#fffbeb", border: "#fde68a" };
  }
  if (c.includes("PETROL")) {
    return { label: "Petrol", icon: Flame, color: "#ea580c", bg: "#fff7ed", border: "#fed7aa" };
  }
  if (c.includes("LPG")) {
    return { label: "LPG", icon: Flame, color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" };
  }
  if (c.includes("GAS")) {
    return { label: "Natural Gas", icon: Wind, color: "#0284c7", bg: "#f0f9ff", border: "#bae6fd" };
  }
  if (c.includes("REFRIGERANT")) {
    return { label: "Refrigerant", icon: Snowflake, color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" };
  }
  if (c.includes("VEHICLE") || c.includes("TRANSPORT")) {
    return { label: "Fleet Transport", icon: Car, color: "#059669", bg: "#ecfdf5", border: "#a7f3d0" };
  }
  return { label: category.replace(/_/g, " "), icon: Leaf, color: "#0d9488", bg: "#f0fdfa", border: "#99f6e4" };
}

export default function ActivityDataPage() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewActivity, setViewActivity] = useState<any>(null);
  const [fromSetup, setFromSetup] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedScope, setSelectedScope] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setFromSetup(!!localStorage.getItem("setup_return"));
    }
  }, []);

  const { isLocked } = useReportingPeriodStatus();
  const { isPeriodReady, activePeriodId, status: periodStatus } =
    useReportingPeriodContext();

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getActivityData();
      if (response.success && response.data) {
        setData(response.data);
      } else {
        toast.error("Failed to fetch activity data");
      }
    } catch (err: any) {
      toast.error(err.message || "Error loading activity data");
    } finally {
      setLoading(false);
    }
  };

  // Wait for the reporting period to resolve: without it the list request is
  // not period-scoped and every row shows up against the wrong period.
  useEffect(() => {
    if (!isPeriodReady) return;
    fetchData();
  }, [isPeriodReady, activePeriodId]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this activity entry?")) return;
    try {
      await deleteActivityData(id);
      toast.success("Activity record deleted");
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    }
  };

  const handleSubmit = async (id: string) => {
    if (
      !confirm(
        "Submit this activity for review? It will be locked for verification."
      )
    )
      return;
    try {
      await submitActivityData(id);
      toast.success("Activity submitted for review âœ…");
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit");
    }
  };

  // Filtered dataset
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Scope filter
      if (selectedScope !== "ALL" && item.scope !== selectedScope) return false;
      // Status filter
      if (selectedStatus !== "ALL") {
        if (selectedStatus === "REVIEW" && item.status !== "SUBMITTED" && item.status !== "UNDER_REVIEW") return false;
        if (selectedStatus !== "REVIEW" && item.status !== selectedStatus) return false;
      }
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const cat = (item.category || "").toLowerCase();
        const desc = (item.description || "").toLowerCase();
        const unit = (item.unit || "").toLowerCase();
        const qty = String(item.quantity || "").toLowerCase();
        return cat.includes(q) || desc.includes(q) || unit.includes(q) || qty.includes(q);
      }
      return true;
    });
  }, [data, selectedScope, selectedStatus, searchQuery]);

  // Summary Metrics
  const stats = useMemo(() => {
    const totalRecords = data.length;
    const scope1Count = data.filter((d) => d.scope === "SCOPE_1").length;
    const scope2Count = data.filter((d) => d.scope === "SCOPE_2").length;
    const verifiedCount = data.filter((d) => d.status === "VERIFIED" || d.status === "CALCULATED").length;
    const totalEmissionsKg = data.reduce((acc, curr) => {
      const calcVal = curr.calculations?.[0]?.co2eKg || 0;
      return acc + calcVal;
    }, 0);

    return {
      totalRecords,
      scope1Count,
      scope2Count,
      verifiedCount,
      totalEmissionsKg,
    };
  }, [data]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-700">
            <span className="size-1.5 rounded-full bg-slate-400" />
            Draft
          </span>
        );
      case "SUBMITTED":
      case "UNDER_REVIEW":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-cyan-50 border border-cyan-200 px-2.5 py-1 text-xs font-bold text-cyan-800">
            <span className="size-1.5 rounded-full bg-cyan-500 animate-pulse" />
            Under Review
          </span>
        );
      case "VERIFIED":
      case "CALCULATED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-teal-50 border border-teal-200 px-2.5 py-1 text-xs font-bold text-teal-800">
            <CheckCircle size={12} weight="fill" className="text-teal-600" />
            Verified
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-rose-50 border border-rose-200 px-2.5 py-1 text-xs font-bold text-rose-700">
            <span className="size-1.5 rounded-full bg-rose-500" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
            {status}
          </span>
        );
    }
  };

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
          title="Activity Data"
          subtitle="Manage your primary activity logs, utility bills, and manual entries"
        />

        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">
          <div className="mx-auto flex max-w-[1280px] flex-col gap-6">

            {periodStatus === "empty" && (
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-sm font-medium text-amber-800">
                  No reporting period exists yet. Activity data must be recorded inside a reporting
                  period before it can be reviewed or calculated.
                </p>
                <button
                  type="button"
                  onClick={() => router.push("/reporting-periods")}
                  className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-700 transition-colors"
                >
                  Create Reporting Period
                </button>
              </div>
            )}

            {/* â”€â”€ Top Header Actions Ribbon â”€â”€ */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                  Operational Activity Log
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Audit-ready primary activity data powering institutional carbon accounting.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {/* Manual Entry */}
                <button
                  type="button"
                  onClick={() => !isLocked && router.push("/activity-data/add")}
                  disabled={isLocked}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600 px-4 py-2.5 text-xs font-bold text-white shadow-[0_4px_16px_rgba(13,148,136,0.25)] transition-all ${
                    isLocked
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:from-teal-500 hover:via-cyan-500 hover:to-sky-500 active:scale-[0.99] cursor-pointer"
                  }`}
                >
                  {isLocked ? <LockKey size={15} weight="bold" /> : <Plus size={15} weight="bold" />}
                  <span>Manual Entry</span>
                </button>

                {/* Excel / CSV Upload */}
                <button
                  type="button"
                  onClick={() => !isLocked && router.push("/activity-data/import")}
                  disabled={isLocked}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl border border-teal-200 bg-white px-4 py-2.5 text-xs font-bold transition-all shadow-2xs ${
                    isLocked
                      ? "opacity-50 cursor-not-allowed text-slate-400"
                      : "text-teal-900 hover:bg-teal-50/60 hover:border-teal-300 cursor-pointer"
                  }`}
                >
                  <FileXls size={15} weight="bold" className="text-green-600" />
                  <span>Excel / CSV</span>
                </button>

                {/* Invoice / Document Upload */}
                <button
                  type="button"
                  onClick={() => !isLocked && router.push("/activity-data/invoice")}
                  disabled={isLocked}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-2.5 text-xs font-bold transition-all shadow-2xs ${
                    isLocked
                      ? "opacity-50 cursor-not-allowed text-slate-400"
                      : "text-orange-800 hover:bg-orange-100 hover:border-orange-300 cursor-pointer"
                  }`}
                >
                  <Receipt size={15} weight="bold" className="text-orange-500" />
                  <span>Upload Invoice</span>
                </button>
              </div>
            </div>

            {/* â”€â”€ Summary Stats Ribbon â”€â”€ */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              {/* Total Records */}
              <div className="rounded-2xl border border-teal-100/90 bg-white/90 p-4 sm:p-5 shadow-[0_4px_20px_rgba(13,148,136,0.03)] backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Total Records
                  </span>
                  <div className="flex size-8 items-center justify-center rounded-xl bg-teal-50 border border-teal-200 text-teal-700">
                    <Database size={16} weight="bold" />
                  </div>
                </div>
                <div className="mt-2.5 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
                    {stats.totalRecords}
                  </span>
                  <span className="text-xs font-semibold text-teal-700">entries</span>
                </div>
              </div>

              {/* Scope 1 */}
              <div className="rounded-2xl border border-amber-100/90 bg-white/90 p-4 sm:p-5 shadow-[0_4px_20px_rgba(245,158,11,0.03)] backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Scope 1 (Direct)
                  </span>
                  <div className="flex size-8 items-center justify-center rounded-xl bg-amber-50 border border-amber-200 text-amber-700">
                    <Flame size={16} weight="bold" />
                  </div>
                </div>
                <div className="mt-2.5 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
                    {stats.scope1Count}
                  </span>
                  <span className="text-xs font-semibold text-amber-700">sources</span>
                </div>
              </div>

              {/* Scope 2 */}
              <div className="rounded-2xl border border-cyan-100/90 bg-white/90 p-4 sm:p-5 shadow-[0_4px_20px_rgba(8,145,178,0.03)] backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Scope 2 (Indirect)
                  </span>
                  <div className="flex size-8 items-center justify-center rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-700">
                    <Lightning size={16} weight="bold" />
                  </div>
                </div>
                <div className="mt-2.5 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
                    {stats.scope2Count}
                  </span>
                  <span className="text-xs font-semibold text-cyan-700">sources</span>
                </div>
              </div>

              {/* Audit & Verification Status */}
              <div className="rounded-2xl border border-sky-100/90 bg-white/90 p-4 sm:p-5 shadow-[0_4px_20px_rgba(2,132,199,0.03)] backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Audit &amp; Review
                  </span>
                  <div className="flex size-8 items-center justify-center rounded-xl bg-sky-50 border border-sky-200 text-sky-700">
                    <Clock size={16} weight="bold" />
                  </div>
                </div>
                <div className="mt-2.5 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
                    {data.filter((d) => d.status === "SUBMITTED" || d.status === "UNDER_REVIEW" || d.status === "DRAFT").length}
                  </span>
                  <span className="text-xs font-semibold text-sky-700">
                    {stats.verifiedCount > 0 ? `${stats.verifiedCount} verified` : "pending review"}
                  </span>
                </div>
              </div>
            </div>

            {/* â”€â”€ Table Card Container â”€â”€ */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="rounded-2xl border border-teal-100/90 bg-white/95 shadow-[0_8px_30px_rgba(13,148,136,0.04)] backdrop-blur-xl overflow-hidden"
            >
              {/* â”€â”€ Filters & Search Toolbar â”€â”€ */}
              <div className="border-b border-slate-100 p-4 sm:p-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
                  {/* Search bar */}
                  <div className="relative flex-1 max-w-md">
                    <MagnifyingGlass
                      size={16}
                      weight="bold"
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      placeholder="Search by category, quantity, unit or notes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-10 w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-9 pr-4 text-xs font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/15"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                      >
                        âœ•
                      </button>
                    )}
                  </div>

                  {/* Scope & Status Filter Pills */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Scope Selector */}
                    <div className="inline-flex rounded-xl border border-slate-200/90 bg-slate-50 p-1">
                      {["ALL", "SCOPE_1", "SCOPE_2"].map((scope) => (
                        <button
                          key={scope}
                          type="button"
                          onClick={() => setSelectedScope(scope)}
                          className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                            selectedScope === scope
                              ? "bg-white text-teal-900 shadow-2xs font-extrabold border border-teal-200/60"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          {scope === "ALL"
                            ? "All Scopes"
                            : scope.replace("_", " ")}
                        </button>
                      ))}
                    </div>

                    {/* Status Selector */}
                    <div className="inline-flex rounded-xl border border-slate-200/90 bg-slate-50 p-1">
                      {[
                        { key: "ALL", label: "All Status" },
                        { key: "DRAFT", label: "Draft" },
                        { key: "REVIEW", label: "In Review" },
                        { key: "VERIFIED", label: "Verified" },
                      ].map((st) => (
                        <button
                          key={st.key}
                          type="button"
                          onClick={() => setSelectedStatus(st.key)}
                          className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                            selectedStatus === st.key
                              ? "bg-white text-teal-900 shadow-2xs font-extrabold border border-teal-200/60"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={fetchData}
                      title="Refresh"
                      className="flex size-9 items-center justify-center rounded-xl border border-slate-200/90 bg-white text-slate-600 hover:text-teal-700 hover:bg-teal-50/50 transition-colors"
                    >
                      <ArrowsClockwise size={15} weight="bold" />
                    </button>
                  </div>
                </div>
              </div>

              {/* â”€â”€ Table â”€â”€ */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[840px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-teal-100/70 bg-gradient-to-r from-teal-50/50 via-slate-50/60 to-teal-50/30 text-[11px] font-black uppercase tracking-wider text-slate-600">
                      <th className="px-5 py-3.5"># Date</th>
                      <th className="px-5 py-3.5">Activity Category</th>
                      <th className="px-5 py-3.5">Scope</th>
                      <th className="px-5 py-3.5">Recorded Quantity</th>
                      <th className="px-5 py-3.5">Verification Status</th>
                      <th className="px-5 py-3.5">Calculated COâ‚‚e</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                            <span className="flex size-8 animate-spin items-center justify-center rounded-full border-2 border-teal-600 border-t-transparent" />
                            <span className="text-xs font-bold">
                              Loading activity records...
                            </span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredData.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-16 text-center">
                          <div className="mx-auto flex max-w-sm flex-col items-center justify-center gap-3">
                            <div className="flex size-12 items-center justify-center rounded-2xl bg-teal-50 border border-teal-200 text-teal-700">
                              <Sparkle size={24} weight="bold" />
                            </div>
                            <h3 className="text-sm font-extrabold text-slate-900">
                              No activity records found
                            </h3>
                            <p className="text-xs text-slate-500">
                              {searchQuery || selectedScope !== "ALL" || selectedStatus !== "ALL"
                                ? "No matching records found. Try adjusting your filters or search query."
                                : "Add your first activity intake record to start tracking organizational carbon emissions."}
                            </p>
                            {!searchQuery && selectedScope === "ALL" && selectedStatus === "ALL" && (
                              <button
                                type="button"
                                onClick={() => router.push("/activity-data/add")}
                                className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:from-teal-500 hover:to-cyan-500 cursor-pointer"
                              >
                                <Plus size={14} weight="bold" />
                                Add First Activity
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredData.map((item, index) => {
                        const meta = getCategoryMeta(item.category);
                        const Icon = meta.icon;
                        const co2e = item.calculations?.[0]?.co2eKg;

                        return (
                          <tr
                            key={item.id}
                            className="group hover:bg-teal-50/30 transition-colors"
                          >
                            {/* Date */}
                            <td className="px-5 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2.5">
                                <span className="text-[11px] font-bold text-slate-400 tabular-nums">
                                  {String(index + 1).padStart(2, "0")}
                                </span>
                                <span className="text-xs font-bold text-slate-900">
                                  {item.activityDate
                                    ? new Date(item.activityDate).toLocaleDateString(
                                        "en-GB",
                                        { day: "numeric", month: "short", year: "numeric" }
                                      )
                                    : "N/A"}
                                </span>
                              </div>
                            </td>

                            {/* Category with Icon */}
                            <td className="px-5 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2.5">
                                <div
                                  className="flex size-7 items-center justify-center rounded-lg border transition-transform group-hover:scale-105"
                                  style={{
                                    backgroundColor: meta.bg,
                                    borderColor: meta.border,
                                    color: meta.color,
                                  }}
                                >
                                  <Icon size={15} weight="fill" />
                                </div>
                                <span className="text-xs font-bold text-slate-800">
                                  {meta.label}
                                </span>
                              </div>
                            </td>

                            {/* Scope Badge */}
                            <td className="px-5 py-4 whitespace-nowrap">
                              <span
                                className={`inline-block rounded-md px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                                  item.scope === "SCOPE_1"
                                    ? "bg-amber-50 text-amber-800 border border-amber-200/90"
                                    : "bg-teal-50 text-teal-800 border border-teal-200/90"
                                }`}
                              >
                                {item.scope?.replace("_", " ") || "SCOPE 1"}
                              </span>
                            </td>

                            {/* Quantity & Unit */}
                            <td className="px-5 py-4 whitespace-nowrap">
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-xs font-extrabold text-slate-900 tabular-nums">
                                  {Number(item.quantity).toLocaleString()}
                                </span>
                                <span className="text-[11px] font-bold text-slate-500">
                                  {item.unit}
                                </span>
                              </div>
                            </td>

                            {/* Status */}
                            <td className="px-5 py-4 whitespace-nowrap">
                              {getStatusBadge(item.status)}
                            </td>

                            {/* Calculated CO2e */}
                            <td className="px-5 py-4 whitespace-nowrap">
                              {item.status === "CALCULATED" || co2e !== undefined ? (
                                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 text-xs font-black text-emerald-800 tabular-nums">
                                  {Math.round(co2e || 0).toLocaleString()} kg COâ‚‚e
                                </span>
                              ) : (
                                <span className="text-xs font-semibold text-slate-400">
                                  Pending Calc
                                </span>
                              )}
                            </td>

                            {/* Action Buttons */}
                            <td className="px-5 py-4 whitespace-nowrap text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setViewActivity(item)}
                                  className="flex size-7 items-center justify-center rounded-lg text-slate-500 hover:text-teal-700 hover:bg-teal-50 transition-colors cursor-pointer"
                                  title="View Record Details"
                                >
                                  <Eye size={15} weight="bold" />
                                </button>

                                {(item.status === "DRAFT" || item.status === "REJECTED") && !isLocked && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleSubmit(item.id)}
                                      className="flex size-7 items-center justify-center rounded-lg text-teal-600 hover:text-teal-800 hover:bg-teal-50 transition-colors cursor-pointer"
                                      title="Submit for Verification"
                                    >
                                      <PaperPlaneRight size={15} weight="bold" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDelete(item.id)}
                                      className="flex size-7 items-center justify-center rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                                      title="Delete Draft"
                                    >
                                      <Trash size={15} weight="bold" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-3 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Showing <strong>{filteredData.length}</strong> of{" "}
                  <strong>{data.length}</strong> total records
                </span>
                <span className="font-medium text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md text-[11px]">
                  GHG Protocol Aligned
                </span>
              </div>
            </motion.div>

          </div>
        </main>
      </div>

      {/* Modal Dialogs */}
      <AnimatePresence>
        {isModalOpen && (
          <AddActivityModal
            onClose={() => setIsModalOpen(false)}
            onSuccess={() => {
              setIsModalOpen(false);
              fetchData();
            }}
          />
        )}
        {viewActivity && (
          <ViewActivityModal
            activity={viewActivity}
            onClose={() => setViewActivity(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

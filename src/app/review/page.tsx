"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { EASE } from "@/lib/animations";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import {
  getActivityData,
  verifyActivityData,
  rejectActivityData,
  calculateEmissions,
  startReviewActivityData,
} from "@/lib/api";
import {
  CheckCircle,
  XCircle,
  Calculator,
  Eye,
  WarningCircle,
  ArrowRight,
  MagnifyingGlass,
  Clock,
  ArrowsClockwise,
  Sparkle,
  ShieldCheck,
  FileText,
  Lightning,
  Flame,
  Snowflake,
  Car,
  Drop,
  Wind,
  Leaf,
  Check,
  X,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import CalculationResultModal from "./CalculationResultModal";
import ReviewDetailsModal from "./ReviewDetailsModal";
import { useReportingPeriodContext } from "@/context/ReportingPeriodContext";

/* ─── Category Icon & Color Mapping ─────────────────────────────────── */
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

export default function ReviewPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Reject Modal State
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Calculation & View State
  const [calcResult, setCalcResult] = useState<any>(null);
  const [viewActivity, setViewActivity] = useState<any>(null);

  const { isPeriodReady, activePeriodId } = useReportingPeriodContext();

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getActivityData();
      if (response.success && response.data) {
        setData(response.data);
      } else {
        toast.error("Failed to fetch review data");
      }
    } catch (err: any) {
      toast.error(err.message || "Error loading review data");
    } finally {
      setLoading(false);
    }
  };

  // The review queue is period-scoped, so wait for the reporting period to
  // resolve before loading - otherwise the list is unfiltered.
  useEffect(() => {
    if (!isPeriodReady) return;
    fetchData();
  }, [isPeriodReady, activePeriodId]);

  const handleVerify = async (id: string) => {
    if (
      !confirm(
        "Approve and verify this activity data? CO₂e emissions will be automatically calculated."
      )
    )
      return;
    try {
      await verifyActivityData(id);
    } catch (err: any) {
      toast.error(err.message || "Failed to verify");
      return;
    }

    // Calculation runs after a successful verify. Failures are reported
    // explicitly - previously this catch swallowed the reason and claimed
    // success, which is why nothing appeared to be calculated.
    try {
      const calcRes = await calculateEmissions(id);
      if (calcRes && (calcRes.success || calcRes.data)) {
        setCalcResult(calcRes.data || calcRes);
      }
      toast.success("Activity verified & CO₂e calculated");
      fetchData();
    } catch (calcErr: any) {
      toast.success("Activity verified");
      toast.error(
        calcErr?.message || "Verified, but CO₂e calculation failed. Retry from Calculations."
      );
      fetchData();
    }
  };

  const handleStartReview = async (id: string) => {
    try {
      await startReviewActivityData(id);
      toast.success("Review process initiated");
      fetchData();
      setViewActivity(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to start review");
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectId || !rejectReason.trim()) return;
    try {
      await rejectActivityData(rejectId, rejectReason);
      toast.success("Activity rejected & returned to contributor");
      setRejectId(null);
      setRejectReason("");
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to reject");
    }
  };

  const handleCalculate = async (id: string) => {
    try {
      const res = await calculateEmissions(id);
      if (res.success && res.data) {
        setCalcResult(res.data);
        fetchData();
      } else {
        toast.error(res.message || "Calculation failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Calculation failed");
    }
  };

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
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-bold text-amber-800">
            <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
            Submitted
          </span>
        );
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

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm.trim() ||
        (item.category || "").toLowerCase().includes(q) ||
        (item.scope || "").toLowerCase().includes(q) ||
        String(item.quantity || "").toLowerCase().includes(q) ||
        (item.unit || "").toLowerCase().includes(q);

      let matchesFilter = true;
      if (filter === "Submitted") matchesFilter = item.status === "SUBMITTED";
      else if (filter === "Under Review")
        matchesFilter = item.status === "UNDER_REVIEW";
      else if (filter === "Verified")
        matchesFilter =
          item.status === "VERIFIED" || item.status === "CALCULATED";
      else if (filter === "Rejected") matchesFilter = item.status === "REJECTED";

      return matchesSearch && matchesFilter;
    });
  }, [data, searchTerm, filter]);

  const stats = useMemo(() => {
    const totalCount = data.length;
    const submittedCount = data.filter((d) => d.status === "SUBMITTED").length;
    const underReviewCount = data.filter((d) => d.status === "UNDER_REVIEW").length;
    const verifiedCount = data.filter((d) => d.status === "VERIFIED" || d.status === "CALCULATED").length;
    const rejectedCount = data.filter((d) => d.status === "REJECTED").length;

    return {
      totalCount,
      submittedCount,
      underReviewCount,
      verifiedCount,
      rejectedCount,
    };
  }, [data]);

  return (
    <div className="flex h-screen flex-row bg-[#f8fafc]">
      <Sidebar
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        active="review"
        onChange={() => {}}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-gradient-to-b from-[#f0fbf9]/60 via-[#f8fafc] to-[#edf9f7]/40">
        <Topbar
          onMenu={() => setMenuOpen(true)}
          title="Data Review & Audit"
          subtitle="Audit submitted activity logs, verify source evidence, and trigger emissions calculations"
        />

        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">
          <div className="mx-auto flex max-w-[1280px] flex-col gap-6">

            {/* ── Top Header ── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                  Data Review &amp; Quality Audit
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Review primary activity records, verify evidence against bills, and approve for calculation.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-teal-200/80 bg-teal-50/90 px-3.5 py-1 text-xs font-bold text-teal-800 shadow-2xs">
                <ShieldCheck size={14} weight="fill" className="text-teal-600" />
                <span>Quality Gate 1 (QG-1) Verification</span>
              </div>
            </div>

            {/* ── Summary Stats Ribbon ── */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              {/* Submitted / Awaiting Audit */}
              <div className="rounded-2xl border border-amber-100/90 bg-white/90 p-4 sm:p-5 shadow-[0_4px_20px_rgba(245,158,11,0.03)] backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Awaiting Audit
                  </span>
                  <div className="flex size-8 items-center justify-center rounded-xl bg-amber-50 border border-amber-200 text-amber-700">
                    <Clock size={16} weight="bold" />
                  </div>
                </div>
                <div className="mt-2.5 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
                    {stats.submittedCount}
                  </span>
                  <span className="text-xs font-semibold text-amber-700">submitted</span>
                </div>
              </div>

              {/* In Active Review */}
              <div className="rounded-2xl border border-cyan-100/90 bg-white/90 p-4 sm:p-5 shadow-[0_4px_20px_rgba(8,145,178,0.03)] backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    In Progress
                  </span>
                  <div className="flex size-8 items-center justify-center rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-700">
                    <Eye size={16} weight="bold" />
                  </div>
                </div>
                <div className="mt-2.5 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
                    {stats.underReviewCount}
                  </span>
                  <span className="text-xs font-semibold text-cyan-700">under review</span>
                </div>
              </div>

              {/* Verified & Calculated */}
              <div className="rounded-2xl border border-teal-100/90 bg-white/90 p-4 sm:p-5 shadow-[0_4px_20px_rgba(13,148,136,0.03)] backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Verified
                  </span>
                  <div className="flex size-8 items-center justify-center rounded-xl bg-teal-50 border border-teal-200 text-teal-700">
                    <CheckCircle size={16} weight="bold" />
                  </div>
                </div>
                <div className="mt-2.5 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
                    {stats.verifiedCount}
                  </span>
                  <span className="text-xs font-semibold text-teal-700">approved</span>
                </div>
              </div>

              {/* Rejected */}
              <div className="rounded-2xl border border-rose-100/90 bg-white/90 p-4 sm:p-5 shadow-[0_4px_20px_rgba(244,63,94,0.03)] backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Action Required
                  </span>
                  <div className="flex size-8 items-center justify-center rounded-xl bg-rose-50 border border-rose-200 text-rose-700">
                    <XCircle size={16} weight="bold" />
                  </div>
                </div>
                <div className="mt-2.5 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
                    {stats.rejectedCount}
                  </span>
                  <span className="text-xs font-semibold text-rose-700">rejected</span>
                </div>
              </div>
            </div>

            {/* ── Table Card Container ── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="rounded-2xl border border-teal-100/90 bg-white/95 shadow-[0_8px_30px_rgba(13,148,136,0.04)] backdrop-blur-xl overflow-hidden"
            >
              {/* ── Toolbar: Filter Tabs & Search ── */}
              <div className="border-b border-slate-100 p-4 sm:p-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
                  {/* Search Bar */}
                  <div className="relative flex-1 max-w-md">
                    <MagnifyingGlass
                      size={16}
                      weight="bold"
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      placeholder="Search by category, scope, quantity, or submitter..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="h-10 w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-9 pr-4 text-xs font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/15"
                    />
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => setSearchTerm("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Filter Pills */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="inline-flex rounded-xl border border-slate-200/90 bg-slate-50 p-1">
                      {[
                        { key: "All", label: "All Records" },
                        { key: "Submitted", label: "Submitted" },
                        { key: "Under Review", label: "In Review" },
                        { key: "Verified", label: "Verified" },
                        { key: "Rejected", label: "Rejected" },
                      ].map((t) => (
                        <button
                          key={t.key}
                          type="button"
                          onClick={() => setFilter(t.key)}
                          className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                            filter === t.key
                              ? "bg-white text-teal-900 shadow-2xs font-extrabold border border-teal-200/60"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={fetchData}
                      title="Refresh"
                      className="flex size-9 items-center justify-center rounded-xl border border-slate-200/90 bg-white text-slate-600 hover:text-teal-700 hover:bg-teal-50/50 transition-colors cursor-pointer"
                    >
                      <ArrowsClockwise size={15} weight="bold" />
                    </button>
                  </div>
                </div>
              </div>

              {/* ── Table ── */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[840px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-teal-100/70 bg-gradient-to-r from-teal-50/50 via-slate-50/60 to-teal-50/30 text-[11px] font-black uppercase tracking-wider text-slate-600">
                      <th className="px-5 py-3.5"># Date</th>
                      <th className="px-5 py-3.5">Activity Category</th>
                      <th className="px-5 py-3.5">Quantity</th>
                      <th className="px-5 py-3.5">Submitted By</th>
                      <th className="px-5 py-3.5">Audit Status</th>
                      <th className="px-5 py-3.5">Emissions CO₂e</th>
                      <th className="px-5 py-3.5 text-right">Audit Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                            <span className="flex size-8 animate-spin items-center justify-center rounded-full border-2 border-teal-600 border-t-transparent" />
                            <span className="text-xs font-bold">
                              Loading review queue...
                            </span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredData.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-16 text-center">
                          <div className="mx-auto flex max-w-sm flex-col items-center justify-center gap-3">
                            <div className="flex size-12 items-center justify-center rounded-2xl bg-teal-50 border border-teal-200 text-teal-700">
                              <ShieldCheck size={24} weight="bold" />
                            </div>
                            <h3 className="text-sm font-extrabold text-slate-900">
                              No activities found in this queue
                            </h3>
                            <p className="text-xs text-slate-500">
                              {searchTerm || filter !== "All"
                                ? "No records match your selected filter or search query."
                                : "There are currently no activity records waiting for verification."}
                            </p>
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
                                <div>
                                  <span className="text-xs font-bold text-slate-800 block leading-tight">
                                    {meta.label}
                                  </span>
                                  <span
                                    className={`inline-block mt-0.5 text-[9.5px] font-extrabold uppercase ${
                                      item.scope === "SCOPE_1"
                                        ? "text-amber-700"
                                        : "text-teal-700"
                                    }`}
                                  >
                                    {item.scope?.replace("_", " ") || "SCOPE 1"}
                                  </span>
                                </div>
                              </div>
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

                            {/* Submitter */}
                            <td className="px-5 py-4 whitespace-nowrap">
                              <span className="text-xs font-semibold text-slate-700">
                                {item.createdBy?.firstName
                                  ? `${item.createdBy.firstName} ${item.createdBy.lastName || ""}`
                                  : "System User"}
                              </span>
                            </td>

                            {/* Status */}
                            <td className="px-5 py-4 whitespace-nowrap">
                              {getStatusBadge(item.status)}
                            </td>

                            {/* Calculated CO2e */}
                            <td className="px-5 py-4 whitespace-nowrap">
                              {item.status === "CALCULATED" || co2e !== undefined ? (
                                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 text-xs font-black text-emerald-800 tabular-nums">
                                  {Math.round(co2e || 0).toLocaleString()} kg CO₂e
                                </span>
                              ) : (
                                <span className="text-xs font-semibold text-slate-400">
                                  —
                                </span>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="px-5 py-4 whitespace-nowrap text-right">
                              <button
                                type="button"
                                onClick={() => setViewActivity(item)}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50/80 px-3 py-1.5 text-xs font-bold text-teal-900 shadow-2xs hover:bg-teal-100 hover:border-teal-300 transition-all cursor-pointer"
                              >
                                <span>Audit Record</span>
                                <ArrowRight size={13} weight="bold" />
                              </button>
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
                  <strong>{data.length}</strong> total records in review queue
                </span>
                <span className="font-medium text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md text-[11px]">
                  Quality Gate 1 Active
                </span>
              </div>
            </motion.div>

          </div>
        </main>
      </div>

      {/* Reject Modal */}
      <AnimatePresence>
        {rejectId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setRejectId(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.96 }}
              transition={{ duration: 0.25, ease: EASE }}
              className="relative z-10 w-full max-w-md rounded-2xl border border-rose-200 bg-white p-6 shadow-2xl shadow-rose-950/10"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 border border-rose-200 text-rose-600">
                  <WarningCircle size={22} weight="fill" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    Reject Activity Entry
                  </h2>
                  <p className="text-xs text-slate-500">
                    Provide clear feedback for the contributor to revise
                  </p>
                </div>
              </div>

              <form onSubmit={handleReject} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700">
                    Rejection Reason <span className="text-rose-600">*</span>
                  </label>
                  <textarea
                    required
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="e.g. Electricity bill amount does not match sub-meter SM-02. Please re-check invoice units."
                    className="h-24 w-full resize-none rounded-xl border border-slate-200 p-3 text-xs font-medium text-slate-900 outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-500/15"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setRejectId(null)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors cursor-pointer"
                  >
                    Return for Revision
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Calculation Result Modal */}
      <AnimatePresence>
        {calcResult && (
          <CalculationResultModal
            result={calcResult}
            onClose={() => setCalcResult(null)}
          />
        )}
        {viewActivity && (
          <ReviewDetailsModal
            activity={viewActivity}
            onClose={() => setViewActivity(null)}
            onVerify={handleVerify}
            onStartReview={handleStartReview}
            onRejectClick={(id) => setRejectId(id)}
            onCalculate={handleCalculate}
            onSuccess={() => {
              setViewActivity(null);
              fetchData();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

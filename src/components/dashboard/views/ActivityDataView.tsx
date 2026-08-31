"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { EASE } from "@/lib/animations";
import { getActivityData, deleteActivityData, submitActivityData } from "@/lib/api";
import {
  Plus,
  UploadSimple,
  Trash,
  Eye,
  PaperPlaneRight,
  LockKey,
  MapPin,
  CheckCircle,
  Clock,
  Sparkle,
  WarningCircle,
  MagnifyingGlass,
  Funnel,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import AddActivityModal from "@/app/activity-data/AddActivityModal";
import ImportActivityModal from "@/app/activity-data/ImportActivityModal";
import ViewActivityModal from "@/app/activity-data/ViewActivityModal";
import { useReportingPeriodStatus } from "@/hooks/useReportingPeriodStatus";
import { usePhysicalStructure } from "@/hooks/usePhysicalStructure";
import Section from "@/components/dashboard/Section";
import SetupProgressBanner from "@/components/dashboard/SetupProgressBanner";
import PhysicalStructureCard from "@/components/dashboard/PhysicalStructureCard";
import type { TabId } from "@/components/dashboard/Sidebar";

export default function ActivityDataView() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [viewActivity, setViewActivity] = useState<any>(null);

  // Filters for the table
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterScope, setFilterScope] = useState("ALL");

  const { isLocked } = useReportingPeriodStatus();
  const { orgName, reportingPeriod, stats, hierarchy, loading: structureLoading, isEmpty: structureEmpty } = usePhysicalStructure();

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getActivityData();
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setData([]);
      }
    } catch (err: any) {
      console.warn("Could not fetch activity data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this activity record?")) return;
    try {
      await deleteActivityData(id);
      toast.success("Activity record deleted");
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    }
  };

  const handleSubmit = async (id: string) => {
    if (!confirm("Submit this activity for review? It will be ready for calculation.")) return;
    try {
      await submitActivityData(id);
      toast.success("Activity submitted successfully");
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit");
    }
  };

  const filteredData = data.filter((item) => {
    const matchesSearch =
      (item.category || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.locationPath || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "ALL" || item.status === filterStatus;
    const matchesScope = filterScope === "ALL" || item.scope === filterScope;
    return matchesSearch && matchesStatus && matchesScope;
  });

  const draftCount = data.filter((d) => d.status === "DRAFT").length;
  const submittedCount = data.filter((d) => d.status === "SUBMITTED" || d.status === "UNDER_REVIEW").length;
  const verifiedCount = data.filter((d) => d.status === "VERIFIED" || d.status === "CALCULATED").length;

  // Dummy navigate handler since we're already on the activity-data page
  const handleNavigate = (_tab: TabId) => {};

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT":
        return (
          <span className="inline-flex items-center gap-[4px] rounded-full border border-amber-200/80 bg-amber-50 px-[8px] py-[2px] text-[11px] font-bold text-amber-700">
            <Clock size={11} weight="fill" />
            Draft
          </span>
        );
      case "SUBMITTED":
      case "UNDER_REVIEW":
        return (
          <span className="inline-flex items-center gap-[4px] rounded-full border border-indigo-200/80 bg-indigo-50 px-[8px] py-[2px] text-[11px] font-bold text-indigo-700">
            <Sparkle size={11} weight="fill" />
            Submitted
          </span>
        );
      case "VERIFIED":
      case "CALCULATED":
        return (
          <span className="inline-flex items-center gap-[4px] rounded-full border border-teal-200/80 bg-teal-50 px-[8px] py-[2px] text-[11px] font-bold text-teal-700">
            <CheckCircle size={11} weight="fill" />
            Verified
          </span>
        );
      default:
        return (
          <span className="rounded-full bg-slate-100 px-[8px] py-[2px] text-[11px] font-semibold text-slate-600">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-[20px] pb-[32px]">
      {/* â”€â”€ Organisation Setup & Physical Hierarchy (from Phase 2) â”€â”€ */}
      <SetupProgressBanner
        orgName={orgName}
        reportingPeriod={reportingPeriod}
        stats={stats}
        loading={structureLoading}
        onNavigate={handleNavigate}
      />

      <PhysicalStructureCard
        hierarchy={hierarchy}
        loading={structureLoading}
        isEmpty={structureEmpty}
        delay={0.1}
      />
      {/* â”€â”€ Top Header & Stats Banner â”€â”€ */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: EASE }}
        className="flex flex-col gap-[16px] rounded-[20px] border border-white/60 bg-white/70 backdrop-blur-2xl p-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-[16px]">
          <div>
            <div className="flex items-center gap-[8px]">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600">Reporting Period: FY 2025–26</span>
            </div>
            <h1 className="text-[22px] font-bold tracking-tight text-slate-900 mt-[2px]">Activity Data</h1>
            <p className="text-[13px] text-slate-500 mt-[2px]">
              Collect and manage operational data used to calculate your university's carbon footprint.
            </p>
            <div className="mt-4">
              <div className="mb-1 text-[13px] font-semibold text-slate-700">Data Collection Progress: 45%</div>
              <div className="h-[6px] w-48 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full bg-indigo-600" style={{ width: "45%" }}></div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-[10px] shrink-0">
            <button
              onClick={() => !isLocked && setIsAddOpen(true)}
              disabled={isLocked}
              className={`flex items-center gap-[6px] rounded-[10px] px-[14px] py-[9px] text-[12.5px] font-bold text-white shadow-sm transition-all ${
                isLocked ? "bg-slate-300 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]"
              }`}
            >
              {isLocked ? <LockKey size={14} weight="bold" /> : <Plus size={14} weight="bold" />}
              <span>Add Activity</span>
            </button>

            <button
              onClick={() => !isLocked && setIsImportOpen(true)}
              disabled={isLocked}
              className="flex items-center gap-[6px] rounded-[10px] border border-slate-200/80 bg-white px-[14px] py-[9px] text-[12.5px] font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition-all"
            >
              <UploadSimple size={14} weight="bold" />
              <span>Import Excel/CSV</span>
            </button>
          </div>
        </div>

        {/* Quick status counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-[12px] border-t border-slate-100/80 pt-[16px]">
          <div className="rounded-[12px] bg-slate-50/70 border border-slate-200/60 p-[12px]">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total Logged</p>
            <p className="text-[20px] font-bold text-slate-900 mt-[2px]">{data.length}</p>
          </div>
          <div className="rounded-[12px] bg-amber-50/50 border border-amber-200/60 p-[12px]">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">Drafts</p>
            <p className="text-[20px] font-bold text-amber-900 mt-[2px]">{draftCount}</p>
          </div>
          <div className="rounded-[12px] bg-indigo-50/50 border border-indigo-200/60 p-[12px]">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-700">Submitted / Review</p>
            <p className="text-[20px] font-bold text-indigo-900 mt-[2px]">{submittedCount}</p>
          </div>
          <div className="rounded-[12px] bg-teal-50/50 border border-teal-200/60 p-[12px]">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-teal-700">Verified</p>
            <p className="text-[20px] font-bold text-teal-900 mt-[2px]">{verifiedCount}</p>
          </div>
        </div>
      </motion.div>

      {/* â”€â”€ Activity Records Table â”€â”€ */}
      <Section
        title="Activity Log"
        subtitle="Primary activity records with location breakdown"
        delay={0.15}
      >
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-[12px] p-[16px] border-b border-slate-200/70 bg-white/50">
          <div className="relative w-full sm:max-w-[240px]">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-[10px] text-slate-400">
              <MagnifyingGlass size={14} weight="bold" />
            </div>
            <input 
              type="text" 
              placeholder="Search category or location..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-[8px] border border-slate-200 py-[8px] pl-[32px] pr-[12px] text-[13px] outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-[12px] w-full sm:w-auto">
            <div className="relative w-full sm:w-[160px]">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-[10px] text-slate-400">
                <Funnel size={14} weight="bold" />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full appearance-none rounded-[8px] border border-slate-200 bg-white py-[8px] pl-[32px] pr-[12px] text-[13px] outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="VERIFIED">Verified</option>
              </select>
            </div>
            <div className="relative w-full sm:w-[160px]">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-[10px] text-slate-400">
                <Funnel size={14} weight="bold" />
              </div>
              <select
                value={filterScope}
                onChange={(e) => setFilterScope(e.target.value)}
                className="w-full appearance-none rounded-[8px] border border-slate-200 bg-white py-[8px] pl-[32px] pr-[12px] text-[13px] outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Scopes</option>
                <option value="SCOPE_1">Scope 1</option>
                <option value="SCOPE_2">Scope 2</option>
                <option value="SCOPE_3">Scope 3</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200/70 bg-slate-50/60 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="px-[14px] py-[10px]">Date</th>
                <th className="px-[14px] py-[10px]">Activity & Scope</th>
                <th className="px-[14px] py-[10px]">Location (Campus / Building / Floor)</th>
                <th className="px-[14px] py-[10px]">Consumption</th>
                <th className="px-[14px] py-[10px]">Status</th>
                <th className="px-[14px] py-[10px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-[36px] text-center text-[13px] text-slate-400">
                    Loading activity records...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-[40px] text-center">
                    <div className="flex flex-col items-center justify-center gap-[6px]">
                      <span className="flex h-[48px] w-[48px] items-center justify-center rounded-full bg-indigo-50 text-indigo-600 mb-[8px]">
                        <Plus size={24} weight="bold" />
                      </span>
                      <p className="text-[16px] font-bold text-slate-900">Start Building Your Carbon Profile</p>
                      <p className="text-[13px] text-slate-500 max-w-[320px] mb-4">
                        Add your first operational activity to begin calculating your university's carbon footprint.
                      </p>
                      <div className="flex flex-col gap-2 w-full max-w-[200px]">
                        <button
                          onClick={() => !isLocked && setIsAddOpen(true)}
                          disabled={isLocked}
                          className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-[13px] font-bold text-white hover:bg-indigo-700 transition-colors"
                        >
                          <Plus size={16} weight="bold" /> Add Your First Activity
                        </button>
                        <button
                          onClick={() => !isLocked && setIsImportOpen(true)}
                          disabled={isLocked}
                          className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-[13px] font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <UploadSimple size={16} weight="bold" /> Import Data
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Date */}
                    <td className="px-[14px] py-[14px] text-[13px] font-semibold tabular-nums text-slate-800">
                      {item.activityDate
                        ? new Date(item.activityDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                        : "â€”"}
                    </td>

                    {/* Activity & Scope */}
                    <td className="px-[14px] py-[14px]">
                      <div>
                        <p className="text-[13.5px] font-bold text-slate-900">{item.category?.replace(/_/g, " ")}</p>
                        <span
                          className={`mt-[2px] inline-block text-[10.5px] font-semibold ${
                            item.scope === "SCOPE_1" ? "text-indigo-600" : "text-teal-600"
                          }`}
                        >
                          {item.scope?.replace("_", " ")}
                        </span>
                      </div>
                    </td>

                    {/* Location Path */}
                    <td className="px-[14px] py-[14px]">
                      <div className="flex items-center gap-[4px] text-[12.5px] font-medium text-slate-700">
                        <MapPin size={13} className="text-indigo-500 shrink-0" weight="fill" />
                        <span className="truncate max-w-[240px]">
                          {item.locationPath ||
                            [item.campus || "Main Campus", item.building || "Campus Total", item.floor]
                              .filter(Boolean)
                              .join(" / ")}
                        </span>
                      </div>
                    </td>

                    {/* Consumption */}
                    <td className="px-[14px] py-[14px]">
                      <span className="text-[13.5px] font-bold tabular-nums text-slate-900">
                        {Number(item.quantity).toLocaleString()}
                      </span>{" "}
                      <span className="text-[12px] font-medium text-slate-500">{item.unit}</span>
                    </td>

                    {/* Status */}
                    <td className="px-[14px] py-[14px]">{getStatusBadge(item.status)}</td>

                    {/* Actions */}
                    <td className="px-[14px] py-[14px] text-right">
                      <div className="flex items-center justify-end gap-[6px]">
                        {item.status === "DRAFT" ? (
                          <>
                            <button
                              onClick={() => handleSubmit(item.id)}
                              className="flex items-center gap-[3px] rounded-[6px] bg-indigo-50 px-[8px] py-[4px] text-[11.5px] font-bold text-indigo-700 hover:bg-indigo-100 transition-colors"
                              title="Submit for verification"
                            >
                              <PaperPlaneRight size={13} weight="bold" />
                              <span>Submit</span>
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="rounded-[6px] p-[5px] text-rose-500 hover:bg-rose-50 transition-colors"
                              title="Delete Draft"
                            >
                              <Trash size={15} weight="bold" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setViewActivity(item)}
                            className="rounded-[6px] p-[5px] text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                            title="View Details"
                          >
                            <Eye size={15} weight="bold" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Section>

      {/* â”€â”€ Modals â”€â”€ */}
      <AnimatePresence>
        {isAddOpen && (
          <AddActivityModal
            onClose={() => setIsAddOpen(false)}
            onSuccess={() => {
              setIsAddOpen(false);
              fetchData();
            }}
          />
        )}
        {isImportOpen && (
          <ImportActivityModal
            onClose={() => setIsImportOpen(false)}
            onSuccess={() => {
              setIsImportOpen(false);
              fetchData();
            }}
          />
        )}
        {viewActivity && (
          <ViewActivityModal activity={viewActivity} onClose={() => setViewActivity(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

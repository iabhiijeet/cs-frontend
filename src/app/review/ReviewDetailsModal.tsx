"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
  X,
  FileText,
  CheckCircle,
  WarningCircle,
  Calculator,
  MagnifyingGlassPlus,
  PencilSimple,
  FloppyDisk,
  PlayCircle,
  LockKey,
  Leaf,
  ShieldCheck,
  CalendarBlank,
} from "@phosphor-icons/react";
import { EASE } from "@/lib/animations";
import { updateActivityData } from "@/lib/api";
import { toast } from "sonner";
import { useReportingPeriodStatus } from "@/hooks/useReportingPeriodStatus";

interface ReviewDetailsModalProps {
  activity: any;
  onClose: () => void;
  onVerify: (id: string) => void;
  onStartReview: (id: string) => void;
  onRejectClick: (id: string) => void;
  onCalculate: (id: string) => void;
  onSuccess: () => void;
}

export default function ReviewDetailsModal({
  activity,
  onClose,
  onVerify,
  onStartReview,
  onRejectClick,
  onCalculate,
  onSuccess,
}: ReviewDetailsModalProps) {
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    quantity: activity?.quantity || 0,
    unit: activity?.unit || "",
    activityDate: activity?.activityDate
      ? new Date(activity.activityDate).toISOString().split("T")[0]
      : "",
  });

  const { isLocked } = useReportingPeriodStatus();

  if (!activity) return null;

  const handleSave = async () => {
    try {
      setLoading(true);
      const res = await updateActivityData(activity.id, {
        quantity: Number(formData.quantity),
        unit: formData.unit,
        activityDate: new Date(formData.activityDate).toISOString(),
      });
      if (res.success) {
        toast.success("Activity updated successfully");
        setEditMode(false);
        onSuccess();
      } else {
        toast.error(res.message || "Failed to update");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.96 }}
        transition={{ duration: 0.25, ease: EASE }}
        className="relative z-10 w-full max-w-4xl rounded-2xl border border-teal-100/90 bg-white p-6 shadow-2xl shadow-teal-950/10 max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200 text-teal-700">
              <MagnifyingGlassPlus size={22} weight="bold" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                Review &amp; Audit Activity Data
              </h2>
              <p className="text-xs text-slate-500">
                Compare user entered numbers with source documents and verify calculations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-5">
            {/* Left: Source Document Card */}
            <div className="space-y-4">
              <div className="rounded-xl border border-teal-100 bg-teal-50/40 p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 mb-3">
                  <FileText size={16} className="text-teal-600" />
                  <span>Attached Evidence</span>
                </div>
                {activity.document ? (
                  <div className="space-y-2.5">
                    <div className="border-b border-teal-200/50 pb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                        File Name
                      </span>
                      <span className="text-xs font-semibold text-slate-900 break-all">
                        {activity.document.fileName}
                      </span>
                    </div>
                    {activity.document.fileUrl && (
                      <a
                        href={activity.document.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 w-full rounded-lg bg-white border border-teal-200 px-3 py-2 text-xs font-bold text-teal-900 hover:bg-teal-50 transition-colors"
                      >
                        <FileText size={14} />
                        <span>Open Document</span>
                      </a>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">
                    No attachment provided. Logged via manual self-declaration.
                  </p>
                )}
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Contributor Info
                </span>
                <p className="text-xs font-bold text-slate-800">
                  {activity.createdBy?.firstName
                    ? `${activity.createdBy.firstName} ${activity.createdBy.lastName || ""}`
                    : "System Intake"}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Logged on{" "}
                  {new Date(activity.createdAt || activity.activityDate).toLocaleDateString("en-GB")}
                </p>
              </div>
            </div>

            {/* Right: Data Comparison Table */}
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200/90 overflow-hidden bg-white shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10.5px] tracking-wider">
                    <tr>
                      <th className="px-4 py-2.5">Field</th>
                      <th className="px-4 py-2.5">OCR Extracted</th>
                      <th className="px-4 py-2.5 text-slate-900">User Entered</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="px-4 py-3 font-semibold text-slate-600">Category</td>
                      <td className="px-4 py-3 text-slate-400">
                        {activity.document?.extractedData?.category || "—"}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900">
                        {activity.category.replace(/_/g, " ")}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-semibold text-slate-600">GHG Scope</td>
                      <td className="px-4 py-3 text-slate-400">
                        {activity.document?.extractedData?.scope || "—"}
                      </td>
                      <td className="px-4 py-3 font-bold text-teal-800">
                        {activity.scope.replace("_", " ")}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-semibold text-slate-600">Recorded Quantity</td>
                      <td className="px-4 py-3 text-slate-400">
                        {activity.document?.extractedData?.quantity
                          ? `${activity.document.extractedData.quantity} ${activity.document.extractedData.unit || ""}`
                          : "—"}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900">
                        {editMode ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={formData.quantity}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  quantity: e.target.value as any,
                                })
                              }
                              className="h-8 w-24 rounded-lg border border-teal-300 px-2.5 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-teal-500/20"
                            />
                            <input
                              type="text"
                              value={formData.unit}
                              onChange={(e) =>
                                setFormData({ ...formData, unit: e.target.value })
                              }
                              className="h-8 w-16 rounded-lg border border-teal-300 px-2.5 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-teal-500/20"
                            />
                          </div>
                        ) : (
                          `${activity.quantity} ${activity.unit}`
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-semibold text-slate-600">Activity Date</td>
                      <td className="px-4 py-3 text-slate-400">
                        {activity.document?.extractedData?.activityDate
                          ? new Date(
                              activity.document.extractedData.activityDate
                            ).toLocaleDateString("en-GB")
                          : "—"}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900">
                        {editMode ? (
                          <input
                            type="date"
                            value={formData.activityDate}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                activityDate: e.target.value,
                              })
                            }
                            className="h-8 rounded-lg border border-teal-300 px-2.5 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-teal-500/20"
                          />
                        ) : (
                          new Date(activity.activityDate).toLocaleDateString("en-GB")
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {editMode && (
                <div className="flex justify-end">
                  <button
                    disabled={loading}
                    onClick={handleSave}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-4 py-2 text-xs font-bold text-white shadow-2xs hover:from-teal-500 hover:to-cyan-500 cursor-pointer disabled:opacity-50"
                  >
                    <FloppyDisk size={14} weight="bold" />
                    <span>{loading ? "Saving..." : "Save Corrections"}</span>
                  </button>
                </div>
              )}

              {/* Verified Result Card */}
              {activity.status === "VERIFIED" && activity.calculations?.length > 0 && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-950 mb-1.5">
                    <Calculator size={16} weight="fill" className="text-emerald-600" />
                    <span>Applied Emission Calculation</span>
                  </div>
                  <div className="rounded-lg bg-white border border-emerald-200/80 p-3 font-mono text-xs text-emerald-900 font-bold">
                    {activity.quantity} {activity.unit} ×{" "}
                    {activity.calculations[0].emissionFactor?.factorValue || "0.7117"}{" "}
                    kgCO₂e/{activity.unit} ={" "}
                    <span className="text-emerald-700 text-sm font-black">
                      {activity.calculations[0].co2eKg.toFixed(2)} kgCO₂e
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="mt-5 pt-4 border-t border-slate-100 shrink-0 flex items-center justify-between gap-3">
          <div>
            {isLocked && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200">
                <LockKey size={14} weight="bold" /> Reporting Period is Locked
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Close
            </button>

            {!isLocked && (
              <>
                {activity.status === "SUBMITTED" && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onStartReview(activity.id)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <PlayCircle size={15} weight="bold" />
                      <span>Start Review</span>
                    </button>
                    <button
                      onClick={() => {
                        onVerify(activity.id);
                        onClose();
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:from-teal-500 hover:via-cyan-500 hover:to-sky-500 cursor-pointer"
                    >
                      <CheckCircle size={15} weight="bold" />
                      <span>Verify &amp; Calculate</span>
                    </button>
                  </div>
                )}

                {activity.status === "UNDER_REVIEW" && (
                  <>
                    {!editMode && (
                      <button
                        onClick={() => setEditMode(true)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <PencilSimple size={14} weight="bold" />
                        <span>Edit Values</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        onRejectClick(activity.id);
                        onClose();
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/80 px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                    >
                      <WarningCircle size={14} weight="bold" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => {
                        onVerify(activity.id);
                        onClose();
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:from-teal-500 hover:via-cyan-500 hover:to-sky-500 cursor-pointer"
                    >
                      <CheckCircle size={15} weight="bold" />
                      <span>Verify &amp; Calculate</span>
                    </button>
                  </>
                )}

                {(activity.status === "VERIFIED" || activity.status === "CALCULATED") && (
                  <button
                    onClick={() => {
                      onCalculate(activity.id);
                      onClose();
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-700 to-cyan-700 px-4 py-2 text-xs font-bold text-white shadow-sm hover:from-teal-600 hover:to-cyan-600 cursor-pointer"
                  >
                    <Calculator size={15} weight="bold" />
                    <span>Recalculate Emissions</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

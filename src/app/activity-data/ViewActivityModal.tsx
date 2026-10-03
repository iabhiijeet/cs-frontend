"use client";

import { motion } from "motion/react";
import { X, FileText, CheckCircle, Leaf, CalendarBlank, MapPin, Gauge, Sparkle } from "@phosphor-icons/react";
import { EASE } from "@/lib/animations";

export default function ViewActivityModal({
  activity,
  onClose,
}: {
  activity: any;
  onClose: () => void;
}) {
  if (!activity) return null;

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
        className="relative z-10 w-full max-w-xl rounded-2xl border border-teal-100/90 bg-white p-6 shadow-2xl shadow-teal-950/10 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="mb-6 flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200 text-teal-700">
              <Leaf size={20} weight="fill" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                Activity Record Details
              </h2>
              <p className="text-xs text-slate-500">
                Audit record metadata and verification status
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

        <div className="space-y-5">
          {/* Main Activity details Grid */}
          <div className="grid grid-cols-2 gap-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 p-4">
            <div>
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Category
              </span>
              <span className="text-xs font-bold text-slate-900">
                {activity.category?.replace(/_/g, " ") || "N/A"}
              </span>
            </div>

            <div>
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                GHG Scope
              </span>
              <span className="inline-block rounded-md bg-teal-50 border border-teal-200 px-2 py-0.5 text-[10px] font-extrabold text-teal-900 uppercase">
                {activity.scope?.replace("_", " ") || "SCOPE 1"}
              </span>
            </div>

            <div>
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Recorded Consumption
              </span>
              <span className="text-xs font-extrabold text-slate-900 tabular-nums">
                {Number(activity.quantity).toLocaleString()} {activity.unit}
              </span>
            </div>

            <div>
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Activity Date
              </span>
              <span className="text-xs font-bold text-slate-900">
                {activity.activityDate
                  ? new Date(activity.activityDate).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "N/A"}
              </span>
            </div>

            <div>
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Status
              </span>
              <span className="text-xs font-bold text-teal-800">
                {activity.status}
              </span>
            </div>

            <div>
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Calculated CO₂e
              </span>
              <span className="text-xs font-black text-emerald-700">
                {activity.calculations?.[0]?.co2eKg
                  ? `${Math.round(activity.calculations[0].co2eKg).toLocaleString()} kg CO₂e`
                  : "Pending calculation"}
              </span>
            </div>

            {activity.description && (
              <div className="col-span-2 pt-2 border-t border-slate-200/60">
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Description / Reference Notes
                </span>
                <p className="text-xs text-slate-700 font-medium leading-relaxed">
                  {activity.description}
                </p>
              </div>
            )}
          </div>

          {/* Source Document Section */}
          {activity.document && (
            <div className="rounded-xl border border-teal-100 bg-teal-50/40 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <FileText size={16} className="text-teal-600" />
                  <span>Linked Source Evidence</span>
                </div>
                <span className="text-[11px] font-semibold text-slate-600">
                  {activity.document.fileName || "Document"}
                </span>
              </div>
              {activity.document.fileUrl && (
                <a
                  href={activity.document.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-lg bg-white border border-teal-200 px-3 py-1.5 text-xs font-bold text-teal-900 hover:bg-teal-50 transition-colors"
                >
                  View Attachment
                </a>
              )}
            </div>
          )}

          {/* Verification Seal */}
          {activity.verifierId && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
              <div className="flex items-start gap-3">
                <CheckCircle
                  size={20}
                  weight="fill"
                  className="text-emerald-600 shrink-0 mt-0.5"
                />
                <div>
                  <h3 className="text-xs font-bold text-emerald-900">
                    Verified by {activity.verifier?.firstName || "Auditor"}
                  </h3>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    Verified on{" "}
                    {new Date(activity.verifiedAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Footer Action */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-slate-100 hover:bg-slate-200 px-5 py-2 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

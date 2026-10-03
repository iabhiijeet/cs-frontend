"use client";

import { motion } from "motion/react";
import { X, CheckCircle, Leaf, Tag, Database, Sparkle } from "@phosphor-icons/react";
import { EASE } from "@/lib/animations";

interface CalculationResultModalProps {
  result: any;
  onClose: () => void;
}

export default function CalculationResultModal({
  result,
  onClose,
}: CalculationResultModalProps) {
  const co2e = result.co2eKg ? Math.round(result.co2eKg) : 0;
  const emissionFactor = result.emissionFactor || 0;
  const factorUnit = result.factorUnit || "kgCO2e/unit";
  const source = result.factorSource || "GHG Protocol";
  const version = result.factorVersion || "Latest";
  const factorName = result.factorName || "Standard Grid & Fuel Factor";

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
        className="relative z-10 w-full max-w-md rounded-2xl border border-teal-100/90 bg-white p-6 shadow-2xl shadow-teal-950/10"
      >
        {/* Header */}
        <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200 text-teal-700">
              <CheckCircle size={22} weight="fill" className="text-teal-600" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                Emissions Calculated
              </h2>
              <p className="text-xs text-slate-500">
                Verified and computed using IPCC / GHG Protocol standards
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

        <div className="space-y-4">
          {/* Main Emission Result Box */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-teal-200/80 bg-gradient-to-b from-teal-50/80 to-cyan-50/40 py-6 text-center shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-900">
              Computed Carbon Footprint
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-4xl font-black text-slate-900 tracking-tight tabular-nums">
                {co2e.toLocaleString()}
              </span>
              <span className="text-sm font-extrabold text-teal-700">kg CO₂e</span>
            </div>
            {co2e > 1000 && (
              <span className="mt-1 text-xs font-bold text-teal-800">
                ≈ {(co2e / 1000).toFixed(2)} metric tonnes CO₂e
              </span>
            )}
          </div>

          {/* Factor Details Grid */}
          <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-4 space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Applied Emission Factor Methodology
            </span>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-600 font-semibold">
                <Leaf size={15} className="text-teal-600" />
                <span>Factor Value</span>
              </div>
              <span className="font-extrabold text-slate-900">
                {typeof emissionFactor === "number" ? emissionFactor.toFixed(4) : emissionFactor}{" "}
                <span className="font-medium text-slate-500">{factorUnit}</span>
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-600 font-semibold">
                <Tag size={15} className="text-teal-600" />
                <span>Factor Name</span>
              </div>
              <span className="font-bold text-slate-800 max-w-[200px] truncate text-right">
                {factorName}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-600 font-semibold">
                <Database size={15} className="text-teal-600" />
                <span>Source Authority</span>
              </div>
              <span className="font-bold text-slate-800">
                {source} <span className="text-teal-700 text-[11px]">({version})</span>
              </span>
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600 px-4 py-2.5 text-xs font-bold text-white shadow-[0_4px_16px_rgba(13,148,136,0.25)] hover:from-teal-500 hover:via-cyan-500 hover:to-sky-500 transition-all cursor-pointer"
          >
            Done &amp; Update Dashboard
          </button>
        </div>
      </motion.div>
    </div>
  );
}

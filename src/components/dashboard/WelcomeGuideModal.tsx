"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Sparkle,
  Lightning,
  ShieldCheck,
  ChartLineUp,
  Buildings,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  FileText,
  Compass,
} from "@phosphor-icons/react";
import { EASE } from "@/lib/animations";

interface WelcomeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STEPS = [
  {
    step: 1,
    badge: "Step 1 of 3 · Intake",
    title: "Log your primary activity data",
    description:
      "Start by adding your electricity bills, diesel fuel usage, natural gas, or vehicle mileage. You can enter them manually or upload PDF invoices and CSV spreadsheets.",
    icon: Lightning,
    color: "#0d9488",
    bg: "#f0fdfa",
    border: "#99f6e4",
    actionLabel: "Next: Data Review",
    hint: "Navigate to Activity Data in sidebar or click + Add Activity",
  },
  {
    step: 2,
    badge: "Step 2 of 3 · Quality Gate",
    title: "Verify evidence in the Review Center",
    description:
      "Every uploaded bill or activity record enters the Review Queue. Here, quality reviewers compare numbers against original utility documents before verifying them.",
    icon: ShieldCheck,
    color: "#0891b2",
    bg: "#ecfeff",
    border: "#a5f3fc",
    actionLabel: "Next: Automatic Calculations",
    hint: "Navigate to Review Center to approve and verify entries",
  },
  {
    step: 3,
    badge: "Step 3 of 3 · Live Footprint",
    title: "Emissions calculate automatically",
    description:
      "As soon as an entry is approved, CarbonSynq applies GHG Protocol & IPCC emission factors to calculate exact CO₂e. Your charts, Scope 1 & Scope 2 breakdowns, and reduction targets populate instantly.",
    icon: ChartLineUp,
    color: "#059669",
    bg: "#ecfdf5",
    border: "#a7f3d0",
    actionLabel: "Get Started: Add First Activity",
    hint: "Your dashboard analytics stay audit-ready 24/7",
  },
];

export default function WelcomeGuideModal({
  isOpen,
  onClose,
}: WelcomeGuideModalProps) {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!isOpen) return null;

  const current = STEPS[currentSlide];
  const Icon = current.icon;

  const handleNext = () => {
    if (currentSlide < STEPS.length - 1) {
      setCurrentSlide((p) => p + 1);
    } else {
      onClose();
      router.push("/activity-data/add");
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
        className="relative z-10 w-full max-w-lg rounded-2xl border border-teal-100/90 bg-white p-6 shadow-2xl shadow-teal-950/15"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-2xs">
              <Compass size={20} weight="fill" />
            </div>
            <div>
              <span className="text-[10.5px] font-black uppercase tracking-wider text-teal-700">
                Quick Start Guide
              </span>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight leading-tight">
                How CarbonSynq Works
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Slide Visual Container */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div
              className="flex items-center gap-3.5 rounded-2xl border p-4"
              style={{
                backgroundColor: current.bg,
                borderColor: current.border,
              }}
            >
              <div
                className="flex size-12 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
                style={{
                  background: `linear-gradient(135deg, ${current.color}, #06b6d4)`,
                }}
              >
                <Icon size={24} weight="fill" />
              </div>
              <div>
                <span
                  className="inline-block rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider"
                  style={{
                    backgroundColor: "#ffffff",
                    color: current.color,
                  }}
                >
                  {current.badge}
                </span>
                <h3 className="text-sm font-black text-slate-900 mt-1">
                  {current.title}
                </h3>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              {current.description}
            </p>

            <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3 flex items-center gap-2 text-xs font-semibold text-slate-700">
              <Sparkle size={15} className="text-teal-600 shrink-0" weight="fill" />
              <span>{current.hint}</span>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation & Progress Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          {/* Progress Pips */}
          <div className="flex items-center gap-1.5">
            {STEPS.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentSlide(i)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  i === currentSlide
                    ? "w-6 bg-teal-600"
                    : "w-2 bg-slate-200 hover:bg-slate-300"
                }`}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2">
            {currentSlide > 0 && (
              <button
                type="button"
                onClick={() => setCurrentSlide((p) => p - 1)}
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <ArrowLeft size={14} weight="bold" />
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:from-teal-500 hover:via-cyan-500 hover:to-sky-500 transition-all cursor-pointer"
            >
              <span>{current.actionLabel}</span>
              <ArrowRight size={14} weight="bold" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

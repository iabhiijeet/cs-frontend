"use client";

import React from "react";
import { motion } from "motion/react";
import {
  Building,
  Buildings,
  CheckCircle,
  CirclesThreePlus,
  Compass,
  Stack,
  Sparkle,
  ArrowRight,
  PlusCircle,
} from "@phosphor-icons/react";
import CountUp from "@/components/dashboard/CountUp";
import { EASE } from "@/lib/animations";
import type { TabId } from "@/components/dashboard/Sidebar";
import type { PhysicalStructureStats } from "@/hooks/usePhysicalStructure";

interface SetupProgressBannerProps {
  orgName: string;
  reportingPeriod: string;
  stats: PhysicalStructureStats;
  loading: boolean;
  onNavigate: (tab: TabId) => void;
}

export default function SetupProgressBanner({
  orgName,
  reportingPeriod,
  stats,
  loading,
  onNavigate,
}: SetupProgressBannerProps) {
  const checklist = [
    { label: "Organisation profile", done: true },
    { label: "Campus structure", done: stats.campusCount > 0 },
    { label: "Building structure", done: stats.buildingCount > 0 },
    { label: "Floor structure", done: stats.floorCount > 0 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="relative overflow-hidden rounded-[20px] border border-white/60 bg-white/70 backdrop-blur-2xl p-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
    >
      {/* ── Top Row: Welcome & Organisation Identity ── */}
      <div className="flex flex-col gap-[16px] md:flex-row md:items-center md:justify-between border-b border-slate-100/80 pb-[20px]">
        <div className="flex items-center gap-[14px]">
          <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br from-teal-600 to-teal-800 text-white shadow-[0_4px_16px_rgba(13,148,136,0.25)]">
            <Compass size={24} weight="fill" />
          </div>
          <div>
            <div className="flex items-center gap-[8px]">
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-teal-700">Welcome to CarbonSynq</span>
              <span className="rounded-full border border-teal-200 bg-teal-50 px-[8px] py-[2px] text-[10.5px] font-semibold text-teal-800">
                Setup Complete
              </span>
            </div>
            <h1 className="mt-[2px] text-[22px] font-bold tracking-tight text-slate-900">{orgName}</h1>
          </div>
        </div>

        <div className="flex items-center gap-[8px]">
          <span className="text-[12px] font-medium text-slate-400">Reporting Period:</span>
          <span className="rounded-full border border-slate-200/70 bg-white/90 px-[12px] py-[4px] text-[12px] font-bold tabular-nums text-slate-800 shadow-sm">
            {reportingPeriod}
          </span>
        </div>
      </div>

      {/* ── Middle Row: 3 Dynamic Physical Structure Cards + Next Step CTA ── */}
      <div className="mt-[20px] grid grid-cols-1 gap-[14px] sm:grid-cols-2 lg:grid-cols-4">
        {/* Campuses Card */}
        <motion.div
          whileHover={{ y: -3 }}
          className="flex items-center gap-[14px] rounded-[16px] border border-white/60 bg-gradient-to-br from-white/80 to-teal-50/30 p-[16px] shadow-sm transition-all"
        >
          <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[12px] bg-teal-50 text-teal-700">
            <Buildings size={22} weight="duotone" />
          </div>
          <div>
            <p className="text-[11.5px] font-semibold uppercase tracking-wider text-slate-400">Campuses</p>
            <p className="text-[24px] font-bold leading-none tracking-tight text-slate-900 mt-[4px]">
              {loading ? "..." : <CountUp value={stats.campusCount} delay={0.1} />}
            </p>
          </div>
        </motion.div>

        {/* Buildings Card */}
        <motion.div
          whileHover={{ y: -3 }}
          className="flex items-center gap-[14px] rounded-[16px] border border-white/60 bg-gradient-to-br from-white/80 to-cyan-50/30 p-[16px] shadow-sm transition-all"
        >
          <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[12px] bg-cyan-50 text-cyan-700">
            <Building size={22} weight="duotone" />
          </div>
          <div>
            <p className="text-[11.5px] font-semibold uppercase tracking-wider text-slate-400">Buildings</p>
            <p className="text-[24px] font-bold leading-none tracking-tight text-slate-900 mt-[4px]">
              {loading ? "..." : <CountUp value={stats.buildingCount} delay={0.2} />}
            </p>
          </div>
        </motion.div>

        {/* Floors Card */}
        <motion.div
          whileHover={{ y: -3 }}
          className="flex items-center gap-[14px] rounded-[16px] border border-white/60 bg-gradient-to-br from-white/80 to-emerald-50/30 p-[16px] shadow-sm transition-all"
        >
          <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[12px] bg-emerald-50 text-emerald-700">
            <Stack size={22} weight="duotone" />
          </div>
          <div>
            <p className="text-[11.5px] font-semibold uppercase tracking-wider text-slate-400">Floors</p>
            <p className="text-[24px] font-bold leading-none tracking-tight text-slate-900 mt-[4px]">
              {loading ? "..." : <CountUp value={stats.floorCount} delay={0.3} />}
            </p>
          </div>
        </motion.div>

        {/* Next Step Action Card */}
        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          className="flex flex-col justify-between rounded-[16px] border border-teal-300/80 bg-gradient-to-br from-teal-600 via-teal-700 to-cyan-700 p-[16px] text-white shadow-[0_8px_24px_rgba(13,148,136,0.2)]"
        >
          <div>
            <div className="flex items-center gap-[6px] text-[11px] font-semibold uppercase tracking-wider text-teal-100">
              <Sparkle size={13} weight="fill" />
              <span>Next Step</span>
            </div>
            <p className="mt-[4px] text-[13.5px] font-bold leading-tight text-white">Add your activity data</p>
          </div>

          <button
            onClick={() => onNavigate("activity-data")}
            className="mt-[10px] flex items-center justify-center gap-[6px] rounded-[10px] bg-white px-[12px] py-[7px] text-[12px] font-bold text-teal-800 shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <PlusCircle size={15} weight="bold" />
            <span>Add Activity Data</span>
            <ArrowRight size={12} weight="bold" />
          </button>
        </motion.div>
      </div>

      {/* ── Bottom Row: Setup Progress Checklist ── */}
      <div className="mt-[18px] flex flex-wrap items-center justify-between gap-[12px] border-t border-slate-100/80 pt-[14px]">
        <div className="flex items-center gap-[6px] text-[12px] font-semibold text-slate-500">
          <span>Setup Progress:</span>
        </div>
        <div className="flex flex-wrap items-center gap-[16px]">
          {checklist.map((item) => (
            <div key={item.label} className="flex items-center gap-[5px] text-[12px] font-medium text-slate-600">
              <CheckCircle size={15} weight="fill" className="text-emerald-500" />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

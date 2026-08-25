"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Buildings,
  Building,
  Stack,
  CaretDown,
  CaretRight,
  MapPin,
  Users,
  Ruler,
  Wind,
  TreeStructure,
  PlusCircle,
} from "@phosphor-icons/react";
import Section from "@/components/dashboard/Section";
import type { PhysicalHierarchy, PhysicalCampus, PhysicalBuilding, PhysicalFloor } from "@/app/onboarding/_types/onboarding";
import { EASE } from "@/lib/animations";
import Link from "next/link";

interface PhysicalStructureCardProps {
  hierarchy: PhysicalHierarchy | null;
  loading: boolean;
  isEmpty: boolean;
  delay?: number;
}

export default function PhysicalStructureCard({
  hierarchy,
  loading,
  isEmpty,
  delay = 0.2,
}: PhysicalStructureCardProps) {
  const [expandedCampuses, setExpandedCampuses] = useState<Record<string, boolean>>({ "0": true });
  const [expandedBuildings, setExpandedBuildings] = useState<Record<string, boolean>>({ "0-0": true, "0-1": true });

  const toggleCampus = (idx: string) => {
    setExpandedCampuses((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleBuilding = (idx: string) => {
    setExpandedBuildings((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  if (loading) {
    return (
      <Section
        title="Physical Structure"
        subtitle="Campuses, buildings, and floors"
        delay={delay}
      >
        <div className="flex flex-col gap-[12px] py-[8px]">
          <div className="h-[48px] w-full animate-pulse rounded-[12px] bg-slate-100/70" />
          <div className="ml-[24px] h-[36px] w-[80%] animate-pulse rounded-[10px] bg-slate-100/50" />
          <div className="ml-[48px] h-[28px] w-[60%] animate-pulse rounded-[8px] bg-slate-100/40" />
        </div>
      </Section>
    );
  }

  if (isEmpty || !hierarchy || !hierarchy.campuses || hierarchy.campuses.length === 0) {
    return (
      <Section
        title="Physical Structure"
        subtitle="Campuses, buildings, and floors"
        delay={delay}
      >
        <div className="flex flex-col items-center justify-center rounded-[14px] border border-dashed border-slate-200 bg-slate-50/50 py-[32px] text-center">
          <div className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-indigo-50 text-indigo-600 mb-[10px]">
            <TreeStructure size={22} weight="duotone" />
          </div>
          <p className="text-[14px] font-bold text-slate-800">Your physical structure isn't set up yet</p>
          <p className="mt-[4px] text-[12.5px] text-slate-500 max-w-[360px]">
            Complete your campus, building and floor setup to enable floor-wise carbon tracking.
          </p>
          <Link
            href="/university-intake"
            className="mt-[16px] inline-flex items-center gap-[6px] rounded-[10px] bg-indigo-600 px-[16px] py-[8px] text-[12px] font-bold text-white shadow-sm hover:bg-indigo-700 transition-colors"
          >
            <PlusCircle size={15} weight="bold" />
            <span>Complete Setup</span>
          </Link>
        </div>
      </Section>
    );
  }

  return (
    <Section
      title="Physical Structure"
      subtitle="Campuses, buildings, and floors hierarchy"
      delay={delay}
      action={
        <div className="flex items-center gap-[6px] rounded-full border border-indigo-100/60 bg-indigo-50/70 px-[10px] py-[3px] text-[11px] font-semibold text-indigo-700">
          <TreeStructure size={14} weight="bold" />
          <span>{hierarchy.campuses.length} {hierarchy.campuses.length === 1 ? "Campus" : "Campuses"}</span>
        </div>
      }
    >
      <div className="flex flex-col gap-[14px]">
        {hierarchy.campuses.map((campus: PhysicalCampus, cIdx: number) => {
          const cKey = String(cIdx);
          const isCampusExpanded = expandedCampuses[cKey] ?? true;
          const buildingsCount = campus.buildings?.length || 0;

          return (
            <div
              key={campus.name + cIdx}
              className="rounded-[16px] border border-slate-200/70 bg-gradient-to-b from-white/90 to-slate-50/40 p-[16px] shadow-sm transition-all"
            >
              {/* ── Campus Header Row ── */}
              <button
                onClick={() => toggleCampus(cKey)}
                className="flex w-full items-center justify-between gap-[12px] text-left"
              >
                <div className="flex items-center gap-[10px] min-w-0">
                  <div className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-[10px] bg-indigo-50 text-indigo-600 font-bold">
                    <Buildings size={20} weight="duotone" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-[8px]">
                      <h3 className="truncate text-[15px] font-bold text-slate-900">{campus.name}</h3>
                      {campus.code && (
                        <span className="rounded-[6px] bg-slate-100 px-[6px] py-[1.5px] text-[10.5px] font-bold text-slate-600">
                          {campus.code}
                        </span>
                      )}
                    </div>
                    {(campus.city || campus.region) && (
                      <p className="mt-[2px] flex items-center gap-[4px] text-[11.5px] text-slate-400">
                        <MapPin size={12} weight="fill" />
                        <span>{[campus.city, campus.region].filter(Boolean).join(", ")}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-[8px]">
                  <span className="text-[12px] font-semibold text-slate-500">
                    {buildingsCount} {buildingsCount === 1 ? "Building" : "Buildings"}
                  </span>
                  <div className="flex h-[24px] w-[24px] items-center justify-center rounded-full bg-slate-100 text-slate-500">
                    {isCampusExpanded ? <CaretDown size={14} weight="bold" /> : <CaretRight size={14} weight="bold" />}
                  </div>
                </div>
              </button>

              {/* ── Campus Buildings (Collapsible) ── */}
              <AnimatePresence>
                {isCampusExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className="overflow-hidden"
                  >
                    <div className="mt-[14px] flex flex-col gap-[10px] pl-[14px] md:pl-[24px] border-l-2 border-indigo-100">
                      {campus.buildings && campus.buildings.length > 0 ? (
                        campus.buildings.map((bldg: PhysicalBuilding, bIdx: number) => {
                          const bKey = `${cIdx}-${bIdx}`;
                          const isBldgExpanded = expandedBuildings[bKey] ?? true;
                          const floorsCount = bldg.floors?.length || 0;

                          return (
                            <div
                              key={bldg.name + bIdx}
                              className="rounded-[12px] border border-slate-200/60 bg-white/90 p-[12px] shadow-sm"
                            >
                              {/* Building Row */}
                              <button
                                onClick={() => toggleBuilding(bKey)}
                                className="flex w-full items-center justify-between gap-[10px] text-left"
                              >
                                <div className="flex items-center gap-[8px] min-w-0">
                                  <div className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-[8px] bg-purple-50 text-purple-600">
                                    <Building size={16} weight="duotone" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-[6px]">
                                      <span className="truncate text-[13.5px] font-bold text-slate-800">{bldg.name}</span>
                                      {bldg.code && (
                                        <span className="rounded-[4px] bg-slate-100 px-[5px] py-[1px] text-[10px] font-bold text-slate-500">
                                          {bldg.code}
                                        </span>
                                      )}
                                      {bldg.buildingType && (
                                        <span className="hidden sm:inline-block rounded-full bg-purple-50 px-[6px] py-[1px] text-[10px] font-semibold text-purple-700">
                                          {bldg.buildingType}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-[10px] text-[11px] text-slate-400 mt-[2px]">
                                      {bldg.areaSqm && (
                                        <span className="flex items-center gap-[3px]">
                                          <Ruler size={11} />
                                          <span>{bldg.areaSqm.toLocaleString()} m²</span>
                                        </span>
                                      )}
                                      {bldg.occupancy && (
                                        <span className="flex items-center gap-[3px]">
                                          <Users size={11} />
                                          <span>{bldg.occupancy} people</span>
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-[6px]">
                                  <span className="text-[11.5px] font-semibold text-slate-500">
                                    {floorsCount} {floorsCount === 1 ? "Floor" : "Floors"}
                                  </span>
                                  <div className="flex h-[20px] w-[20px] items-center justify-center rounded-full bg-slate-100 text-slate-500">
                                    {isBldgExpanded ? <CaretDown size={12} weight="bold" /> : <CaretRight size={12} weight="bold" />}
                                  </div>
                                </div>
                              </button>

                              {/* Building Floors (Collapsible) */}
                              <AnimatePresence>
                                {isBldgExpanded && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.25, ease: EASE }}
                                    className="overflow-hidden"
                                  >
                                    <div className="mt-[10px] flex flex-wrap gap-[6px] pl-[12px] pt-[8px] border-t border-slate-100">
                                      {bldg.floors && bldg.floors.length > 0 ? (
                                        bldg.floors.map((fl: PhysicalFloor, fIdx: number) => (
                                          <div
                                            key={fl.name + fIdx}
                                            className="flex items-center gap-[6px] rounded-[8px] border border-slate-200/70 bg-slate-50/70 px-[10px] py-[4px] text-[11.5px]"
                                          >
                                            <Stack size={13} className="text-teal-600" />
                                            <span className="font-semibold text-slate-700">{fl.name}</span>
                                            {fl.code && (
                                              <span className="rounded bg-white px-[4px] py-[0.5px] text-[9.5px] font-bold text-slate-500 shadow-2xs">
                                                {fl.code}
                                              </span>
                                            )}
                                            {fl.metadata?.acCount && (
                                              <span className="flex items-center gap-[2px] text-[10.5px] text-slate-400">
                                                <Wind size={10} />
                                                <span>{fl.metadata.acCount} ACs</span>
                                              </span>
                                            )}
                                          </div>
                                        ))
                                      ) : (
                                        <span className="text-[11.5px] italic text-slate-400">No individual floors logged</span>
                                      )}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })
                      ) : (
                        <div className="rounded-[10px] bg-slate-50 p-[10px] text-[12px] text-slate-400 italic">
                          No buildings logged under this campus
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

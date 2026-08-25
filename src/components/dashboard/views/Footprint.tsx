"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Airplane, ArrowDownRight, ArrowUpRight, Building, Factory, Truck, Users } from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import Section from "@/components/dashboard/Section";
import CountUp from "@/components/dashboard/CountUp";
import BarList from "@/components/dashboard/BarList";
import VerticalBars from "@/components/dashboard/VerticalBars";
import Donut from "@/components/dashboard/Donut";
import { EASE } from "@/lib/animations";
import { useDashboardContext } from "@/hooks/useDashboardContext";

const ICONS: Record<string, Icon> = {
  airplane: Airplane,
  users: Users,
  building: Building,
  truck: Truck,
  factory: Factory,
};

const SCOPE_TINT: Record<string, string> = {
  S1: "#3730a3", // indigo-800
  S2: "#4f46e5", // indigo-600
  S3: "#818cf8", // indigo-400
};

export default function Footprint() {
  const { data: { FOOTPRINT_GROUPS, TOTAL_12M } } = useDashboardContext();
  const [selected, setSelected] = useState(0);
  const group = FOOTPRINT_GROUPS[selected] || FOOTPRINT_GROUPS[0];

  if (!group) return null;

  return (
    <div className="flex flex-col gap-[16px]">
      <div className="grid grid-cols-1 gap-[16px] sm:grid-cols-2 xl:grid-cols-5">
        {FOOTPRINT_GROUPS.map((g: any, i: number) => {
          const Icon = ICONS[g.icon as keyof typeof ICONS];
          const active = selected === i;
          return (
            <motion.button
              key={g.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.05 + i * 0.07 }}
              whileHover={{ y: -2 }}
              onClick={() => setSelected(i)}
              className={`relative flex flex-col rounded-[14px] border p-[16px] text-left transition-all duration-300 ${
                active 
                  ? "border-indigo-200/60 bg-indigo-50/50 shadow-[0_12px_32px_rgba(55,48,163,0.12)] -translate-y-1" 
                  : "border-white/60 bg-white/70 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(55,48,163,0.08)]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`flex h-[28px] w-[28px] items-center justify-center rounded-[8px] transition-colors duration-200 ${
                    active ? "bg-indigo-600 text-white" : "bg-indigo-50 text-indigo-600"
                  }`}
                >
                  {Icon && <Icon size={15} weight={active ? "fill" : "regular"} />}
                </span>
                <span
                  className={`flex items-center gap-[2px] rounded-full px-[6px] py-[2px] text-[10.5px] font-semibold tabular-nums ${
                    g.delta < 0 ? "bg-teal-50 text-teal-700" : "bg-rose-50 text-rose-700"
                  }`}
                >
                  {g.delta < 0 ? <ArrowDownRight size={11} weight="bold" /> : <ArrowUpRight size={11} weight="bold" />}
                  {Math.abs(g.delta)}%
                </span>
              </div>
              <p className="mt-[12px] text-[12.5px] font-medium text-slate-500">{g.name}</p>
              <p className="mt-[4px] text-[22px] font-semibold leading-none tracking-[-0.6px] tabular-nums text-slate-900">
                <CountUp value={g.value} delay={0.1 + i * 0.07} />
              </p>
              <p className="mt-[6px] text-[11px] text-slate-400">
                {Math.round(g.share * 100)}% of footprint
              </p>

              {/* Unique Professional Active Indicator */}
              {active && (
                <motion.div
                  layoutId="activeFootprintTab"
                  className="absolute bottom-0 left-[15%] h-[3px] w-[70%] rounded-t-full bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.6)]"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-[16px] lg:grid-cols-3">
        <Section
          title="Footprint by group"
          subtitle="Total CO₂e per group over the reporting period"
          className="lg:col-span-2"
          delay={0.15}
          action={
            <span className="rounded-full bg-indigo-50 border border-indigo-100/50 px-[8px] py-[2px] text-[11px] font-semibold text-indigo-700">
              <CountUp value={TOTAL_12M} suffix=" tCO₂e total" delay={0.3} />
            </span>
          }
        >
          <VerticalBars
            data={FOOTPRINT_GROUPS.map((g: any, i: number) => ({
              label: g.name.split(" ")[0],
              value: g.value,
              color: i === selected ? "#4f46e5" : i % 2 === 0 ? "#6366f1" : "#818cf8",
            }))}
            delay={0.2}
            suffix=""
            height={230}
          />
        </Section>

        <Section title="Group share" subtitle="Share of total footprint" delay={0.2}>
          <Donut
            segments={FOOTPRINT_GROUPS.map((g: any, i: number) => ({
              key: g.key,
              name: g.name,
              value: g.value,
              share: g.share,
              color: i === 0 ? "#4f46e5" : i === 1 ? "#6366f1" : i === 2 ? "#818cf8" : i === 3 ? "#a5b4fc" : "#e0e7ff",
            }))}
            centerValue={TOTAL_12M}
            centerLabel="Total"
            centerSuffix="tCO₂e"
            delay={0.2}
          />
        </Section>
      </div>

      <div className="grid grid-cols-1 gap-[16px] lg:grid-cols-3">
        <Section
          title={group.name}
          subtitle={group.description}
          className="lg:col-span-2"
          delay={0.25}
          action={
            <span className="flex items-center gap-[6px] rounded-full border border-indigo-100/50 bg-indigo-50 px-[8px] py-[2px] text-[11px] font-medium text-indigo-700">
              <span className="h-[7px] w-[7px] rounded-full" style={{ backgroundColor: group.items?.[0] ? SCOPE_TINT[group.items[0].scope] : "#ccc" }} />
              {Math.round(group.share * 100)}% of footprint
            </span>
          }
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={selected}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              <BarList
                rows={(group.items || []).map((it: any) => ({ label: it.name, value: it.value, badge: it.scope }))}
                delay={0.1}
              />
            </motion.div>
          </AnimatePresence>
        </Section>

        <Section title="Insights" subtitle="Top-line observations" delay={0.3}>
          <div className="flex flex-col gap-[12px]">
            {(() => {
              if (!FOOTPRINT_GROUPS || FOOTPRINT_GROUPS.length === 0) return [];
              const sortedByValue = [...FOOTPRINT_GROUPS].sort((a, b) => b.value - a.value);
              const sortedByDelta = [...FOOTPRINT_GROUPS].sort((a, b) => b.delta - a.delta);
              const largest = sortedByValue[0];
              const fastest = sortedByDelta[0]; 
              const reduced = sortedByDelta[sortedByDelta.length - 1]; 

              return [
                { label: "Largest contributor", value: largest.name, sub: `${Math.round(largest.share * 100)}% of total footprint`, icon: largest.icon },
                { label: "Fastest growing", value: fastest.name, sub: `${fastest.delta > 0 ? "+" : ""}${fastest.delta}% vs last year`, icon: fastest.icon },
                { label: "Reduced the most", value: reduced.name, sub: `${reduced.delta > 0 ? "+" : ""}${reduced.delta}% vs last year`, icon: reduced.icon },
              ];
            })().map((ins: any, i: number) => {
              const Icon = ICONS[ins.icon];
              return (
                <motion.div
                  key={ins.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: EASE, delay: 0.35 + i * 0.08 }}
                  className="flex items-center gap-[12px] rounded-[14px] border border-white/60 bg-white/70 backdrop-blur-2xl shadow-sm p-[12px] hover:shadow-md transition-shadow"
                >
                  <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[8px] bg-indigo-50 text-indigo-600">
                    {Icon && <Icon size={15} />}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-slate-400">{ins.label}</p>
                    <p className="truncate text-[13px] font-medium text-slate-900">{ins.value}</p>
                    <p className="text-[11px] text-slate-500">{ins.sub}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Section>
      </div>
    </div>
  );
}

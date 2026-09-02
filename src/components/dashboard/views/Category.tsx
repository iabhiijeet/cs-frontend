"use client";

import { motion, AnimatePresence } from "motion/react";
import { ArrowDownRight, ArrowUpRight, ChartBar, ChartPieSlice, Stack, TrendDown } from "@phosphor-icons/react";
import Section from "@/components/dashboard/Section";
import CountUp from "@/components/dashboard/CountUp";
import BarList from "@/components/dashboard/BarList";
import VerticalBars from "@/components/dashboard/VerticalBars";
import Donut from "@/components/dashboard/Donut";
import { EASE } from "@/lib/animations";
import { useDashboardContext } from "@/hooks/useDashboardContext";

export default function Category() {
  const { data: { CATEGORIES, TOTAL_12M, KPIS } } = useDashboardContext();

  const SCOPE_FROM_CATEGORIES = (() => {
    const s1 = CATEGORIES.filter((c: any) => c.scope === "S1").reduce((a: number, c: any) => a + c.value, 0);
    const s2 = CATEGORIES.filter((c: any) => c.scope === "S2").reduce((a: number, c: any) => a + c.value, 0);
    const total = s1 + s2 || 1;
    return [
      { key: "scope1", name: "Scope 1 — Direct", value: s1, share: s1 / total, color: "#3730a3" },
      { key: "scope2", name: "Scope 2 — Energy", value: s2, share: s2 / total, color: "#4f46e5" },
    ];
  })();

  const STATS = [
    {
      label: "Total footprint",
      value: TOTAL_12M,
      suffix: " tCO₂e",
      delta: KPIS[0]?.delta ?? 0,
      good: true,
      Icon: Stack,
    },
    {
      label: "Scope 2 share",
      value: Math.round(SCOPE_FROM_CATEGORIES[1].share * 100),
      suffix: "%",
      delta: 0,
      good: false,
      Icon: ChartPieSlice,
    },
    {
      label: "Largest category",
      value: CATEGORIES[0] ? CATEGORIES[0].value : 0,
      suffix: " tCO₂e",
      delta: CATEGORIES[0] ? CATEGORIES[0].trend : 0,
      good: CATEGORIES[0] ? CATEGORIES[0].trend < 0 : false,
      Icon: ChartBar,
      caption: CATEGORIES[0] ? CATEGORIES[0].name : "None",
    },
    {
      label: "Best reduction",
      value: (() => {
        const best = [...CATEGORIES].sort((a: any, b: any) => a.trend - b.trend)[0];
        return best ? Math.abs(best.trend) : 0;
      })(),
      suffix: "%",
      delta: (() => {
        const best = [...CATEGORIES].sort((a: any, b: any) => a.trend - b.trend)[0];
        return best ? best.trend : 0;
      })(),
      good: true,
      Icon: TrendDown,
      caption: (() => {
        const best = [...CATEGORIES].sort((a: any, b: any) => a.trend - b.trend)[0];
        return best ? best.name : "None";
      })(),
    },
  ];

  return (
    <div className="flex flex-col gap-[16px]">
      <div className="grid grid-cols-1 gap-[16px] sm:grid-cols-2 xl:grid-cols-4">
        {STATS.map((s, i) => {
          const Icon = s.Icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.05 + i * 0.08 }}
              whileHover={{ y: -4 }}
              className="group relative flex flex-col rounded-[14px] border border-white/60 bg-white/70 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-[18px] transition-all duration-300 overflow-hidden hover:shadow-[0_12px_32px_rgba(55,48,163,0.12)]"
            >
              {/* Animated gradient accent on hover */}
              <motion.div
                className="pointer-events-none absolute inset-0 rounded-[14px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: "radial-gradient(ellipse at top left, rgba(99,102,241,0.08) 0%, transparent 70%)" }}
              />
              {/* Glowing top border */}
              <div className="absolute top-0 left-[15%] h-[2px] w-[70%] scale-x-0 group-hover:scale-x-100 rounded-b-full bg-gradient-to-r from-indigo-500 via-purple-400 to-teal-400 transition-transform duration-500 origin-left" />
              <div className="flex items-center justify-between gap-[8px]">
                <p className="text-[12.5px] font-medium text-slate-500">{s.label}</p>
                <span className="flex h-[26px] w-[26px] items-center justify-center rounded-[8px] bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                  <Icon size={14} />
                </span>
              </div>
              <p className="mt-[12px] text-[24px] font-semibold leading-none tracking-[-0.7px] tabular-nums text-slate-900">
                <CountUp value={s.value} suffix={s.suffix} delay={0.1 + i * 0.08} />
              </p>
              <div className="mt-[8px] flex items-center gap-[6px]">
                <span
                  className={`flex items-center gap-[2px] rounded-full px-[6px] py-[2px] text-[10.5px] font-semibold tabular-nums ${
                    s.good ? "bg-teal-50 text-teal-700" : "bg-rose-50 text-rose-700"
                  }`}
                >
                  {s.delta < 0 ? <ArrowDownRight size={11} weight="bold" /> : <ArrowUpRight size={11} weight="bold" />}
                  {Math.abs(s.delta)}%
                </span>
                <span className="truncate text-[11px] text-slate-400">{s.caption ?? "vs last 12 months"}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-[16px] lg:grid-cols-3">
        <Section
          title="All categories"
          subtitle="Ranked by emissions, with 12-month change"
          className="lg:col-span-2"
          delay={0.15}
          action={
            <span className="rounded-full border border-indigo-100/50 bg-indigo-50 px-[8px] py-[2px] text-[11px] font-medium text-indigo-700">
              {CATEGORIES.length} categories
            </span>
          }
        >
          <BarList
            rows={CATEGORIES.map((c: any) => ({
              label: c.name,
              value: c.value,
              badge: c.scope,
              sublabel: `${c.sources} sources · ${c.trend > 0 ? "+" : ""}${c.trend}%`,
            }))}
            delay={0.15}
          />
        </Section>

        <Section title="Scope mix" subtitle="Emissions split across scopes" delay={0.2}>
          <Donut segments={SCOPE_FROM_CATEGORIES} centerValue={TOTAL_12M} centerLabel="Total" centerSuffix="tCO₂e" delay={0.2} />
        </Section>
      </div>

      <Section
        title="Category comparison"
        subtitle="Relative size of each category"
        delay={0.25}
        action={
          <div className="flex items-center gap-[10px] text-[11px] font-medium text-slate-400">
            {["S1", "S2", "S3"].map((s, i) => (
              <span key={s} className="flex items-center gap-[5px]">
                <span className="h-[7px] w-[7px] rounded-full" style={{ backgroundColor: ["#3730a3", "#4f46e5", "#818cf8"][i] }} />
                {s}
              </span>
            ))}
          </div>
        }
      >
        <VerticalBars
          data={CATEGORIES.map((c: any) => ({
            label: c.name,
            value: c.value,
            color: c.scope === "S1" ? "#3730a3" : c.scope === "S2" ? "#4f46e5" : "#818cf8",
          }))}
          delay={0.2}
          height={240}
        />
      </Section>
    </div>
  );
}

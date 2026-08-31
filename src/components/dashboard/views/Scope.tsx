"use client";

import { motion, AnimatePresence } from "motion/react";
import { ArrowDownRight, ArrowUpRight, Flame, Lightning, GlobeHemisphereWest, TrendUp, Gauge, ShareNetwork, Sparkle } from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import Section from "@/components/dashboard/Section";
import CountUp from "@/components/dashboard/CountUp";
import AreaChart from "@/components/dashboard/AreaChart";
import Donut from "@/components/dashboard/Donut";
import BarList from "@/components/dashboard/BarList";
import { EASE } from "@/lib/animations";
import { useDashboardContext } from "@/hooks/useDashboardContext";

export interface ScopeDetail {
  key: "scope1" | "scope2" | "scope3";
  num: string;
  name: string;
  headline: string;
  description: string;
  color: string;
  share: number;
  total: number;
  delta: number;
  intensity: number;
  monthly: { month: string; value: number }[];
  sources: { name: string; value: number; share: number }[];
}

const ICONS: Record<ScopeDetail["key"], Icon> = {
  scope1: Flame,
  scope2: Lightning,
  scope3: GlobeHemisphereWest,
};

const METRICS: { key: string; Icon: Icon; label: string }[] = [
  { key: "share", Icon: ShareNetwork, label: "Share of total footprint" },
  { key: "delta", Icon: TrendUp, label: "Change vs last 12 months" },
  { key: "intensity", Icon: Gauge, label: "Intensity · tCO₂e per FTE" },
];

// Scope-specific accent colors mapping to Indigo palette
const SCOPE_ACCENT: Record<string, { gradient: string; glow: string; badge: string }> = {
  scope1: {
    gradient: "from-indigo-900 via-indigo-700 to-indigo-500",
    glow: "rgba(79,70,229,0.25)",
    badge: "bg-indigo-100/60 text-indigo-200",
  },
  scope2: {
    gradient: "from-violet-900 via-purple-700 to-purple-500",
    glow: "rgba(139,92,246,0.25)",
    badge: "bg-purple-100/60 text-purple-200",
  },
  scope3: {
    gradient: "from-teal-900 via-teal-700 to-teal-500",
    glow: "rgba(13,148,136,0.25)",
    badge: "bg-teal-100/60 text-teal-200",
  },
};

export default function Scope({ scope }: { scope: ScopeDetail["key"] }) {
  const { data: { SCOPE_DETAILS } } = useDashboardContext();
  const detail = SCOPE_DETAILS.find((d: any) => d.key === scope)!;
  const ScopeIcon = ICONS[detail.key as keyof typeof ICONS];
  const accent = SCOPE_ACCENT[detail.key] ?? SCOPE_ACCENT.scope1;

  const metrics = [
    {
      Icon: METRICS[0].Icon,
      label: METRICS[0].label,
      value: detail.share * 100,
      suffix: "%",
      decimals: 0,
      good: true,
      delta: null as number | null,
    },
    {
      Icon: METRICS[1].Icon,
      label: METRICS[1].label,
      value: Math.abs(detail.delta),
      suffix: "%",
      decimals: 1,
      good: detail.delta < 0,
      delta: detail.delta,
    },
    {
      Icon: METRICS[2].Icon,
      label: METRICS[2].label,
      value: detail.intensity,
      suffix: "",
      decimals: 1,
      good: true,
      delta: null as number | null,
    },
  ];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={scope}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.35, ease: EASE }}
        className="flex flex-col gap-[16px]"
      >
        {/* ── Hero Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="relative overflow-hidden rounded-[20px] border border-white/60 bg-white/70 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.05)]"
        >
          {/* Subtle left-side scope accent bar */}
          <div className="absolute left-0 top-0 h-full w-[4px] rounded-l-[20px]" style={{ background: `linear-gradient(180deg, ${detail.color}, ${detail.color}60)` }} />

          <div className="flex flex-col gap-[20px] pl-[28px] pr-[24px] py-[24px] md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-[16px]">
              <motion.span
                whileHover={{ scale: 1.08 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[14px] shadow-sm"
                style={{ backgroundColor: `${detail.color}18`, color: detail.color }}
              >
                <ScopeIcon size={24} weight="fill" />
              </motion.span>
              <div>
                <div className="flex items-center gap-[8px]">
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-slate-400">Scope {detail.num}</p>
                  <span className="rounded-full border border-indigo-100/60 bg-indigo-50 px-[8px] py-[2px] text-[10.5px] font-semibold text-indigo-600">
                    {Math.round(detail.share * 100)}% of total
                  </span>
                </div>
                <h2 className="mt-[4px] text-[20px] font-bold tracking-[-0.4px] text-slate-900">{detail.name}</h2>
                <p className="mt-[2px] text-[12.5px] leading-relaxed text-slate-500">{detail.headline}</p>
              </div>
            </div>

            <div className="flex items-baseline gap-[10px] md:flex-col md:items-end">
              <p className="text-[40px] font-bold leading-none tracking-[-1.5px] tabular-nums text-slate-900">
                <CountUp value={detail.total} delay={0.2} />
                <span className="ml-[8px] text-[15px] font-medium text-slate-400">tCO₂e</span>
              </p>
              <span
                className={`flex items-center gap-[3px] rounded-full px-[10px] py-[3px] text-[11px] font-semibold tabular-nums ${
                  detail.delta < 0 ? "bg-teal-50 text-teal-700" : "bg-rose-50 text-rose-600"
                }`}
              >
                {detail.delta < 0 ? <ArrowDownRight size={12} weight="bold" /> : <ArrowUpRight size={12} weight="bold" />}
                {Math.abs(detail.delta)}%
                <span className="font-normal opacity-70">vs last 12 months</span>
              </span>
            </div>
          </div>

          {/* Bottom row: description + top sources pills */}
          <div className="border-t border-slate-100 pl-[28px] pr-[24px] py-[14px] flex flex-col gap-[12px] md:flex-row md:items-start md:justify-between">
            <p className="text-[12.5px] leading-relaxed text-slate-500 max-w-[560px]">{detail.description}</p>
            {/* Top sources quick-view */}
            <div className="flex flex-wrap gap-[6px] shrink-0">
              {detail.sources.slice(0, 3).map((s: any, idx: number) => (
                <span
                  key={s.name}
                  className="flex items-center gap-[5px] rounded-full border border-slate-200/60 bg-slate-50 px-[10px] py-[4px] text-[11px] font-medium text-slate-600"
                >
                  <span
                    className="h-[6px] w-[6px] rounded-full shrink-0"
                    style={{ backgroundColor: detail.color, opacity: 1 - idx * 0.25 }}
                  />
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── AI Scope Insight Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: EASE, delay: 0.1 }}
          className="flex flex-col md:flex-row md:items-center gap-[14px] rounded-[16px] border border-indigo-100/60 bg-gradient-to-r from-indigo-50/60 to-white/40 backdrop-blur-sm p-[18px] shadow-sm"
        >
          <div className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
            <Sparkle size={16} weight="fill" />
          </div>
          <div className="flex-1">
            <p className="text-[13px] font-semibold text-indigo-900">
              {detail.delta < 0
                ? `Great progress on Scope ${detail.num}! Emissions are down ${Math.abs(detail.delta)}% this year.`
                : `Scope ${detail.num} emissions grew by ${Math.abs(detail.delta)}% — action is recommended.`}
            </p>
            <p className="mt-[2px] text-[12px] text-indigo-700/80">
              {`Top contributor: `}<strong>{detail.sources[0]?.name ?? "N/A"}</strong>{` accounts for ${Math.round((detail.sources[0]?.share ?? 0) * 100)}% of this scope's total.`}
            </p>
          </div>
          <div className="flex items-center gap-[6px] shrink-0">
            <span className="flex items-center gap-[4px] rounded-full bg-indigo-100/60 px-[10px] py-[4px] text-[11px] font-semibold text-indigo-700">
              <span className="relative flex h-[6px] w-[6px]">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-60" />
                <span className="relative h-[6px] w-[6px] rounded-full bg-indigo-500" />
              </span>
              Auto-synced
            </span>
          </div>
        </motion.div>

        {/* ── Metric Cards ── */}
        <div className="grid grid-cols-1 gap-[16px] sm:grid-cols-3">
          {metrics.map((m, i) => {
            const MetricIcon = m.Icon;
            return (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE, delay: 0.15 + i * 0.08 }}
                whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(55,48,163,0.10)" }}
                className="group relative flex items-center gap-[14px] overflow-hidden rounded-[16px] border border-white/60 bg-white/70 backdrop-blur-2xl p-[18px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300"
              >
                {/* Hover glow */}
                <div className="pointer-events-none absolute inset-0 rounded-[16px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: "radial-gradient(ellipse at top left, rgba(99,102,241,0.08) 0%, transparent 70%)" }} />
                {/* Top accent border on hover */}
                <div className="absolute top-0 left-[15%] h-[2px] w-[70%] scale-x-0 group-hover:scale-x-100 rounded-b-full bg-gradient-to-r from-indigo-500 via-purple-400 to-teal-400 transition-transform duration-500 origin-center" />

                <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[10px] bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                  <MetricIcon size={17} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[11.5px] text-slate-500">{m.label}</p>
                  <p className="mt-[2px] text-[20px] font-bold leading-none tracking-[-0.5px] tabular-nums text-slate-900">
                    <CountUp value={m.value} decimals={m.decimals} suffix={m.suffix} delay={0.2 + i * 0.08} />
                  </p>
                  {m.delta !== null && (
                    <p className={`mt-[3px] text-[10.5px] font-semibold ${m.good ? "text-teal-600" : "text-rose-500"}`}>
                      {m.delta < 0 ? "↓" : "↑"} {Math.abs(m.delta)}% year over year
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── Charts ── */}
        <div className="grid grid-cols-1 gap-[16px] lg:grid-cols-3 items-start">
          <Section
            title={`Scope ${detail.num} — monthly trend`}
            subtitle="Emissions per month, all scopes for comparison"
            className="lg:col-span-2"
            delay={0.2}
          >
            <AreaChart defaultMode={detail.key} delay={0.2} />
          </Section>

          <Section title="Source mix" subtitle="Where these emissions come from" delay={0.25}>
            <Donut
              segments={detail.sources.map((s: any, idx: number) => ({
                key: s.name,
                name: s.name,
                value: s.value,
                share: s.share,
                color: idx === 0 ? "#4f46e5" : idx === 1 ? "#6366f1" : idx === 2 ? "#818cf8" : "#a5b4fc",
              }))}
              centerValue={detail.total}
              centerLabel="Total"
              centerSuffix="tCO₂e"
              delay={0.2}
            />
          </Section>
        </div>

        {/* ── Sources list ── */}
        <Section
          title={`Scope ${detail.num} sources`}
          subtitle="Individual sources contributing to this scope"
          delay={0.3}
          action={
            <span className="flex items-center gap-[6px] rounded-full border border-indigo-100/50 bg-indigo-50 px-[8px] py-[2px] text-[11px] font-medium text-indigo-700">
              <Sparkle size={11} weight="fill" />
              {detail.sources.length} sources
            </span>
          }
        >
          <div className="mx-auto max-w-[720px]">
            <BarList
              rows={detail.sources.map((s: any) => ({ label: s.name, value: s.value, sublabel: `${Math.round(s.share * 100)}% of scope` }))}
              delay={0.25}
              color="#4f46e5"
            />
          </div>
        </Section>
      </motion.div>
    </AnimatePresence>
  );
}

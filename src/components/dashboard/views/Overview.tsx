"use client";

import { ArrowRight, Sparkle } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import KpiCard from "@/components/dashboard/KpiCard";
import AreaChart from "@/components/dashboard/AreaChart";
import Donut from "@/components/dashboard/Donut";
import CategoryList from "@/components/dashboard/CategoryList";
import TargetPanel from "@/components/dashboard/TargetPanel";
import ActivityTable from "@/components/dashboard/ActivityTable";
import Section from "@/components/dashboard/Section";
import CountUp from "@/components/dashboard/CountUp";
import { EASE } from "@/lib/animations";
import type { TabId } from "@/components/dashboard/Sidebar";
import { useDashboardContext } from "@/hooks/useDashboardContext";
import { getRecommendations } from "@/lib/api";

const GROUP_ICONS: Record<string, string> = {
  airplane: "✈",
  users: "👤",
  building: "🏢",
  truck: "🚚",
  factory: "🏭",
};

// Bar colors for footprint groups
const GROUP_BAR_COLORS = [
  "linear-gradient(90deg, #1e3a5f, #2563eb)",
  "linear-gradient(90deg, #0e4c6e, #0891b2)",
  "linear-gradient(90deg, #312e81, #6366f1)",
  "linear-gradient(90deg, #134e4a, #0d9488)",
  "linear-gradient(90deg, #1e1b4b, #8b5cf6)",
];

export default function Overview({ onNavigate }: { onNavigate: (tab: TabId) => void }) {
  const { data: { KPIS, SCOPES, FOOTPRINT_GROUPS, TOTAL_12M } } = useDashboardContext();

  const [topRecs, setTopRecs] = useState<any[]>([]);

  useEffect(() => {
    getRecommendations({ priority: "HIGH" }).then(r => {
      if (r.success) setTopRecs((r.data || []).slice(0, 3));
    }).catch(() => {});
  }, []);

  return (
    <div className="flex flex-col gap-[20px] pb-[32px]">
      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 gap-[16px] sm:grid-cols-2 xl:grid-cols-4">
        {KPIS.map((kpi: any, i: number) => (
          <KpiCard key={kpi.label} kpi={kpi} delay={0.05 + i * 0.08} />
        ))}
      </div>

      {/* ── Emissions Over Time + Scope Donut ── */}
      <div className="grid grid-cols-1 gap-[16px] lg:grid-cols-3">
        <Section
          title="Emissions over time"
          subtitle="Total CO₂e per month, broken down by scope"
          className="lg:col-span-2"
          delay={0.2}
        >
          <AreaChart delay={0.15} />
        </Section>
        <Section
          title="Scope breakdown"
          subtitle="Share of total footprint"
          delay={0.25}
        >
          <Donut segments={SCOPES} centerValue={TOTAL_12M} centerLabel="Total" centerSuffix="tCO₂e" delay={0.2} />
        </Section>
      </div>

      {/* ── Top Row: Overview + Targets ── */}
      <div className="grid grid-cols-1 gap-[16px] lg:grid-cols-2 items-start">
        <Section title="Biggest sources" subtitle="Emissions by category" delay={0.3}>
          <CategoryList delay={0.15} />
        </Section>
        <Section title="2030 reduction target" subtitle="Science-based · aligned to 1.5 °C" delay={0.35}>
          <TargetPanel delay={0.2} />
        </Section>
      </div>

      {/* ── Top Recommendations ── */}
      {topRecs.length > 0 && (
        <Section
          title="Top recommendations"
          subtitle="High-impact actions to reduce emissions"
          delay={0.4}
          action={
            <button
              onClick={() => onNavigate("recommendations")}
              className="flex items-center gap-[4px] rounded-[8px] bg-slate-50 px-[12px] py-[6px] text-[13px] font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              View all <ArrowRight size={12} weight="bold" />
            </button>
          }
        >
          <div className="grid grid-cols-1 gap-[14px] md:grid-cols-3">
            {topRecs.map((rec) => (
              <button
                key={rec.id}
                onClick={() => onNavigate("recommendations")}
                className="flex flex-col gap-[8px] rounded-[16px] border border-slate-200/60 bg-white p-[20px] text-left hover:border-indigo-200 hover:bg-indigo-50/30 hover:shadow-sm transition-all cursor-pointer"
              >
                <div className="flex items-center gap-[8px]">
                  <span className="flex h-[24px] w-[24px] items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                    <Sparkle size={12} weight="fill" />
                  </span>
                  <h4 className="text-[14px] font-semibold text-slate-900 line-clamp-1">{rec.title}</h4>
                </div>
                <p className="text-[13px] text-slate-500 line-clamp-2 leading-relaxed">{rec.description}</p>
              </button>
            ))}
          </div>
        </Section>
      )}

      {/* ── Recent Activity + Footprint by Group ── */}
      <div className="grid grid-cols-1 gap-[16px] lg:grid-cols-3 items-start">
        <Section
          title="Recent activity"
          subtitle="Latest data automatically processed from your integrations"
          className="lg:col-span-2"
          delay={0.45}
          action={
            <button
              onClick={() => onNavigate("reports")}
              className="flex items-center gap-[4px] rounded-[8px] bg-slate-50 px-[12px] py-[6px] text-[13px] font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              View all <ArrowRight size={12} weight="bold" />
            </button>
          }
        >
          <ActivityTable delay={0.1} />
        </Section>

        {/* Footprint by Group panel */}
        <Section
          title="Footprint by group"
          subtitle="Where emissions actually come from"
          delay={0.45}
          action={
            <button
              onClick={() => onNavigate("footprint")}
              className="flex items-center gap-[4px] text-[12px] font-semibold text-slate-500 transition-colors hover:text-slate-900"
            >
              Details <ArrowRight size={12} weight="bold" />
            </button>
          }
        >
          <div className="flex h-full flex-col">
            <div className="flex flex-col gap-[20px]">
              {FOOTPRINT_GROUPS.map((g: any, i: number) => (
                <motion.button
                  key={g.key}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, ease: EASE, delay: 0.5 + i * 0.07 }}
                  onClick={() => onNavigate("footprint")}
                  className="group flex items-center gap-[12px] text-left"
                >
                  <span className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-[8px] bg-slate-100 text-[13px] shadow-sm transition-colors group-hover:bg-slate-200">
                    {GROUP_ICONS[g.icon] ?? "📊"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="mb-[5px] flex items-baseline justify-between gap-[8px]">
                      <span className="truncate text-[13px] font-medium text-slate-600 transition-colors group-hover:text-slate-900">
                        {g.name}
                      </span>
                      <span className="text-[12px] font-bold tabular-nums text-slate-800">
                        <CountUp value={g.value} delay={0.55 + i * 0.07} />
                      </span>
                    </div>
                    <div className="h-[5px] w-full overflow-hidden rounded-full bg-slate-100">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${FOOTPRINT_GROUPS[0] ? (g.value / FOOTPRINT_GROUPS[0].value) * 100 : 0}%` }}
                        transition={{ duration: 1, ease: EASE, delay: 0.55 + i * 0.07 }}
                        className="h-full rounded-full"
                        style={{ background: GROUP_BAR_COLORS[i % GROUP_BAR_COLORS.length] }}
                      />
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            <div className="mt-auto mb-[20px] rounded-[16px] bg-gradient-to-br from-indigo-50/50 to-white/30 border border-indigo-100/50 p-[16px]">
              <div className="flex items-start gap-[12px]">
                <div className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                  <Sparkle size={14} weight="fill" />
                </div>
                <div>
                  <h4 className="text-[13px] font-semibold text-indigo-900">Supply Chain Dominance</h4>
                  <p className="mt-[4px] text-[12px] leading-relaxed text-indigo-700/80">
                    Accounts for <strong>54%</strong> of your footprint. We recommend auditing your top 3 tier-1 suppliers this quarter.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200/60 pt-[14px]">
              <p className="text-[13px] text-slate-500 font-medium">Total across groups</p>
              <p className="text-[14px] font-bold tabular-nums text-slate-900">
                <CountUp value={TOTAL_12M} suffix=" tCO₂e" delay={0.8} />
              </p>
            </div>
          </div>
        </Section>
      </div>

      {/* ── Smart Insights Banner (Automation Feature) ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="flex flex-col md:flex-row md:items-center items-start gap-[16px] rounded-[16px] border border-indigo-100 bg-gradient-to-r from-indigo-50 to-white p-[20px] shadow-[0_2px_12px_rgba(55,48,163,0.06)]"
      >
        <div className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
          <Sparkle size={20} weight="fill" />
        </div>
        <div className="flex-1">
          <h3 className="text-[15px] font-semibold tracking-tight text-indigo-900">Automated Insights Active</h3>
          <p className="mt-[4px] text-[14px] leading-relaxed text-indigo-700/80">
            Your Scope 2 (energy) emissions have spiked this month. We&apos;ve auto-generated new recommendations to help you reduce electricity consumption.
          </p>
        </div>
        <button onClick={() => onNavigate("recommendations")} className="mt-[12px] md:mt-0 w-full md:w-auto shrink-0 rounded-full bg-white px-[16px] py-[8px] text-[13px] font-semibold text-indigo-600 shadow-sm transition-colors hover:bg-indigo-50 border border-indigo-100">
          Review Actions
        </button>
      </motion.div>
    </div>
  );
}

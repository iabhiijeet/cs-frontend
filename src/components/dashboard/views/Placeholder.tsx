"use client";

import { motion } from "motion/react";
import {
  FileText,
  GearSix,
  Database,
  Files,
  ListChecks,
  Calculator,
  Users,
  CalendarBlank,
  ChartLineUp,
  Target,
  ShieldCheck,
  Lightbulb,
  Bell,
  Scroll,
} from "@phosphor-icons/react";
import { EASE } from "@/lib/animations";
import type { TabId } from "@/components/dashboard/Sidebar";

const TAB_META: Record<string, { title: string; desc: string; Icon: any }> = {
  "activity-data": {
    title: "Activity Data Management",
    desc: "Log your campus, building, and floor-wise activity records (electricity, DG fuel, refrigerants, travel) to calculate emissions.",
    Icon: Database,
  },
  reports: {
    title: "Sustainability Reports",
    desc: "Sustainability reports, audit exports and disclosure-ready statements will live here.",
    Icon: FileText,
  },
  settings: {
    title: "Settings & Configuration",
    desc: "Workspace preferences, data integrations and team access controls.",
    Icon: GearSix,
  },
  documents: {
    title: "Evidence Documents & Invoices",
    desc: "Upload and verify utility bills, fuel receipts, and emission factor certificates.",
    Icon: Files,
  },
  review: {
    title: "Data Review & Audit",
    desc: "Review and approve logged activity records before finalizing reporting.",
    Icon: ListChecks,
  },
  calculations: {
    title: "Emission Calculations",
    desc: "Detailed mathematical formulas and emission factor breakdowns per scope.",
    Icon: Calculator,
  },
  team: {
    title: "Team & Permissions",
    desc: "Manage team members, roles, and campus/building data access.",
    Icon: Users,
  },
  "reporting-periods": {
    title: "Reporting Periods",
    desc: "Configure fiscal years, baseline periods, and reporting deadlines.",
    Icon: CalendarBlank,
  },
  "emission-factors": {
    title: "Emission Factors Library",
    desc: "CEA grid factors, IPCC fuel factors, and custom supplier emission factors.",
    Icon: ChartLineUp,
  },
  targets: {
    title: "Net Zero & Reduction Targets",
    desc: "Track science-based reduction milestones and progress towards Net Zero.",
    Icon: Target,
  },
  "data-quality": {
    title: "Data Quality & Assurance",
    desc: "Inspect data completeness, automated estimation confidence, and audit readiness.",
    Icon: ShieldCheck,
  },
  recommendations: {
    title: "AI Recommendations",
    desc: "High-impact automated decarbonization interventions and supplier initiatives.",
    Icon: Lightbulb,
  },
  notifications: {
    title: "Alerts & Notifications",
    desc: "Automated anomaly alerts, threshold warnings, and reporting deadline reminders.",
    Icon: Bell,
  },
  "audit-logs": {
    title: "System Audit Logs",
    desc: "Immutable change logs and activity tracking for compliance audits.",
    Icon: Scroll,
  },
};

export default function Placeholder({ tab }: { tab: TabId }) {
  const meta = TAB_META[tab] || {
    title: tab.charAt(0).toUpperCase() + tab.slice(1).replace("-", " "),
    desc: "Section under active configuration.",
    Icon: Database,
  };

  const Icon = meta.Icon;

  return (
    <motion.div
      key={tab}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="flex min-h-[45dvh] flex-col items-center justify-center rounded-[20px] border border-white/60 bg-white/70 backdrop-blur-2xl p-[36px] text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
    >
      <span className="flex h-[54px] w-[54px] items-center justify-center rounded-[16px] bg-indigo-50 text-indigo-600 shadow-sm">
        <Icon size={26} weight="duotone" />
      </span>
      <h2 className="mt-[18px] text-[19px] font-bold tracking-tight text-slate-900">
        {meta.title}
      </h2>
      <p className="mt-[6px] max-w-[420px] text-[13.5px] leading-relaxed text-slate-500">
        {meta.desc}
      </p>
    </motion.div>
  );
}

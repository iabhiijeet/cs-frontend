"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Database } from "@phosphor-icons/react";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import Overview from "@/components/dashboard/views/Overview";
import Footprint from "@/components/dashboard/views/Footprint";
import Category from "@/components/dashboard/views/Category";
import Scope from "@/components/dashboard/views/Scope";
import Placeholder from "@/components/dashboard/views/Placeholder";
import ReportsView from "@/components/dashboard/views/ReportsView";
import ActivityDataView from "@/components/dashboard/views/ActivityDataView";
import DashboardFilterBar from "@/components/dashboard/DashboardFilterBar";
import { EASE } from "@/lib/animations";
import type { TabId } from "@/components/dashboard/Sidebar";

type ScopeKey = "scope1" | "scope2";

const TITLES: Record<TabId, { title: string; subtitle: string }> = {
  overview: { title: "Overview", subtitle: "Carbon footprint at a glance" },
  footprint: { title: "Footprint overview", subtitle: "Emissions by activity group" },
  category: { title: "Emissions by category", subtitle: "Where emissions come from, ranked" },
  scope1: { title: "Scope 1", subtitle: "Direct emissions from owned sources" },
  scope2: { title: "Scope 2", subtitle: "Indirect emissions from energy" },
  reports: { title: "Reports", subtitle: "Sustainability and audit exports" },
  settings: { title: "Settings", subtitle: "Workspace and team preferences" },
  "activity-data": { title: "Activity Data", subtitle: "Manage your imported activity data" },
  documents: { title: "Documents", subtitle: "Manage uploaded supporting documents" },
  review: { title: "Review Center", subtitle: "Review and approve data" },
  calculations: { title: "Calculations", subtitle: "CO₂e emission calculations" },
  "reporting-periods": { title: "Reporting Periods", subtitle: "Manage reporting periods" },
  "emission-factors": { title: "Emission Factors", subtitle: "Global emission factor library" },
  baseline: { title: "Baseline", subtitle: "Historical baseline comparisons" },
  targets: { title: "Targets", subtitle: "Reduction targets and progress" },
  "data-quality": { title: "Data Quality", subtitle: "Monitor carbon data completeness" },
  recommendations: { title: "Recommendations", subtitle: "Actionable steps to reduce emissions" },
  notifications: { title: "Notifications", subtitle: "System alerts and notifications" },
  "audit-logs": { title: "Audit Logs", subtitle: "System activity history" },
  team: { title: "Team", subtitle: "Manage your team" },
};

import { DashboardProvider, useDashboardContext } from "@/hooks/useDashboardContext";

function DashboardContent() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [tab, setTab] = useState<TabId>("overview");
  
  // Auto-login utility removed for production

  const { data, loading, error, fallbackUsed } = useDashboardContext();

  const meta = TITLES[tab];

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4 text-[#71717a]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-black/10 border-t-black" />
          <p className="text-sm font-medium">Loading your footprint data...</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    const isMissingOrg = error.includes("missing its organisation");
    const handleAction = () => {
      if (isMissingOrg) {
        const orgType = localStorage.getItem('carbonsynq_org_type');
        window.location.href = orgType === 'university' ? '/university-intake' : '/onboarding';
      } else {
        window.location.reload();
      }
    };

    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#fafafa]">
        <div className="flex flex-col items-center gap-4 text-red-500">
          <p className="text-sm font-medium">Error loading data: {error}</p>
          <button 
            className="rounded bg-black px-4 py-2 text-sm text-white" 
            onClick={handleAction}
          >
            {isMissingOrg ? "Complete Onboarding" : "Retry"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh bg-slate-50 relative overflow-hidden">
      {/* ── Premium Atmospheric Background ── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -left-[10%] -top-[10%] h-[50%] w-[50%] rounded-full bg-indigo-400/10 blur-[120px]" />
        <div className="absolute -right-[10%] top-[20%] h-[40%] w-[40%] rounded-full bg-teal-400/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[20%] h-[40%] w-[50%] rounded-full bg-blue-400/10 blur-[120px]" />
      </div>

      <div className="relative z-10 flex w-full">
        <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} active={tab} onChange={setTab} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenu={() => setMenuOpen(true)} title={meta.title} subtitle={meta.subtitle} />

        <main className="flex-1 px-[20px] py-[24px] md:px-[32px]">
          <div className="mx-auto flex max-w-[1240px] flex-col">
            {fallbackUsed && (
              <div className="mb-[14px] flex items-center gap-[8px] rounded-[10px] border border-blue-100 bg-blue-50 px-[14px] py-[10px] text-[12px] font-medium text-blue-700">
                <span className="h-[7px] w-[7px] shrink-0 rounded-full bg-blue-400" />
                Showing demo data — no emission data has been imported yet{error ? ` (${error})` : ""}.
              </div>
            )}
            <DashboardFilterBar />

            {data ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, ease: EASE }}
                >
                  {tab === "overview" && <Overview onNavigate={setTab} />}
                  {tab === "footprint" && <Footprint />}
                  {tab === "category" && <Category />}
                  {tab === "scope1" && <Scope scope={"scope1" as ScopeKey} />}
                  {tab === "scope2" && <Scope scope={"scope2" as ScopeKey} />}
                  {tab === "reports" && <ReportsView />}
                  {tab === "activity-data" && <ActivityDataView />}
                  {tab !== "overview" &&
                    tab !== "footprint" &&
                    tab !== "category" &&
                    tab !== "scope1" &&
                    tab !== "scope2" &&
                    tab !== "reports" &&
                    tab !== "activity-data" && <Placeholder tab={tab} />}
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="mt-[40px] flex flex-col items-center justify-center text-center p-[40px] border border-black/[0.08] rounded-[12px] bg-white">
                <div className="flex h-[48px] w-[48px] items-center justify-center rounded-full bg-black/5 mb-[16px]">
                  <Database size={24} className="text-[#a1a1aa]" />
                </div>
                <h3 className="text-[16px] font-semibold text-black mb-[4px]">No reporting period found</h3>
                <p className="text-[13px] text-[#71717a] max-w-[280px]">
                  Please set up a reporting period in Settings to get started.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (

      <DashboardProvider>
        <DashboardContent />
      </DashboardProvider>

  );
}

"use client";

import { useEffect, useState } from "react";
import type { ComponentType } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { getUniversity, getActivityData } from "@/lib/api";
import {
  ArrowUpRight,
  ChartBar,
  FileText,
  Flame,
  GearSix,
  GlobeHemisphereWest,
  House,
  Lightning,
  MapTrifold,
  X,
  Users,
  Database,
  ListChecks,
  Files,
  CalendarBlank,
  Leaf,
  ShieldCheck,
  ChartLineUp,
  Target,
  Lightbulb,
  SignOut,
} from "@phosphor-icons/react";
import type { IconProps } from "@phosphor-icons/react";
import Logo from "@/components/ui/Logo";
import { EASE } from "@/lib/animations";
import { useAuth } from "@/context/AuthContext";

export type TabId = "overview" | "footprint" | "category" | "scope1" | "scope2" | "activity-data" | "documents" | "review" | "calculations" | "reports" | "team" | "settings" | "reporting-periods" | "emission-factors" | "baseline" | "targets" | "data-quality" | "recommendations" | "notifications" | "audit-logs" | "initiatives" | "suppliers" | "materiality" | "tasks" | "voids" | "inventory" | "knowledge" | "imports" | "pcf-studies" | "supplier-requests" | "insights" | "departments";

interface NavEntry {
  id: TabId;
  label: string;
  Icon: ComponentType<IconProps>;
  tint?: string;
}

const NAV_GROUPS: { label: string; items: NavEntry[] }[] = [
  {
    label: "Analyze",
    items: [
      { id: "overview", label: "Overview", Icon: House },
      { id: "footprint", label: "Footprint overview", Icon: MapTrifold },
      { id: "category", label: "Emissions by category", Icon: ChartBar },
    ],
  },
  {
    label: "Carbon",
    items: [
      { id: "scope1", label: "Scope 1", Icon: Flame, tint: "#0f766e" },
      { id: "scope2", label: "Scope 2", Icon: Lightning, tint: "#06b6d4" },
    ],
  },
  {
    label: "Manage",
    items: [
      { id: "activity-data", label: "Activity Data", Icon: Database },
      { id: "documents", label: "Documents", Icon: Files },
      { id: "review", label: "Review", Icon: ListChecks },
      { id: "calculations", label: "Calculations", Icon: ChartBar },
      { id: "baseline", label: "Baseline", Icon: ChartLineUp },
      { id: "targets", label: "Targets", Icon: Target },
      { id: "data-quality", label: "Data Quality", Icon: ShieldCheck },
      { id: "recommendations", label: "Recommendations", Icon: Lightbulb },
      { id: "reports", label: "Reports", Icon: FileText },
      { id: "reporting-periods", label: "Reporting Periods", Icon: CalendarBlank },
      { id: "emission-factors", label: "Emission Factors", Icon: Leaf },
      { id: "team", label: "Team", Icon: Users },
      { id: "settings", label: "Settings", Icon: GearSix },
    ],
  },
];

const WORKSPACE_FALLBACK = "Workspace";

interface NavItemProps {
  entry: NavEntry;
  active: boolean;
  badge?: number;
  onClick: () => void;
}

function NavItem({ entry, active, badge, onClick }: NavItemProps) {
  const Icon = entry.Icon;
  const color = entry.tint ?? "#0d9488";
  return (
    <button
      onClick={onClick}
      className={`relative flex w-full items-center justify-between rounded-[8px] px-[10px] py-[8px] text-[13px] font-medium transition-colors duration-200 cursor-pointer ${
        active ? "text-slate-900 font-bold" : "text-[#71717a] hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      {active && (
        <motion.span
          layoutId="dash-nav"
          transition={{ type: "spring", stiffness: 500, damping: 40 }}
          className="absolute inset-0 rounded-[8px] border border-teal-100/80 bg-teal-50/60 shadow-[0_1px_3px_rgba(0,0,0,0.03)]"
        />
      )}
      <div className="relative z-10 flex items-center gap-[10px]">
        <Icon size={16} weight={active ? "fill" : "regular"} style={{ color: active ? color : undefined }} />
        <span>{entry.label}</span>
      </div>

      {badge && badge > 0 ? (
        <span className="relative z-10 flex items-center justify-center rounded-full bg-cyan-100 border border-cyan-200 px-1.5 py-0.2 text-[10px] font-black text-cyan-800 tabular-nums">
          {badge}
        </span>
      ) : active ? (
        <span
          className="relative z-10 h-[5px] w-[5px] rounded-full"
          style={{ backgroundColor: color }}
        />
      ) : null}
    </button>
  );
}

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  active: TabId;
  onChange: (tab: TabId) => void;
}

export default function Sidebar({ open, onClose, active, onChange }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [orgName, setOrgName] = useState(WORKSPACE_FALLBACK);
  const [reviewCount, setReviewCount] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;
    const uId = user?.universityId;
    if (!uId) {
      setOrgName(WORKSPACE_FALLBACK);
    } else {
      getUniversity(uId)
        .then((res) => {
          if (cancelled) return;
          if (res.success && res.data?.name) setOrgName(res.data.name);
        })
        .catch(() => {
          if (!cancelled) setOrgName(WORKSPACE_FALLBACK);
        });
    }

    // Fetch review count for badge
    getActivityData()
      .then((res) => {
        if (cancelled) return;
        if (res.success && res.data) {
          const pending = res.data.filter(
            (a: any) => a.status === "SUBMITTED" || a.status === "UNDER_REVIEW"
          ).length;
          setReviewCount(pending);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [user?.universityId]);

  const DEDICATED_PAGES = [
    "activity-data",
    "documents",
    "review",
    "calculations",
    "team",
    "settings",
    "reporting-periods",
    "emission-factors",
    "baseline",
    "targets",
    "data-quality",
    "recommendations",
    "reports",
    "notifications",
    "audit-logs",
  ];

  const handleNavClick = (entryId: TabId) => {
    if (DEDICATED_PAGES.includes(entryId)) {
      router.push(`/${entryId}`);
    } else {
      if (pathname !== "/dashboard" && pathname !== "/") {
        router.push(`/dashboard?tab=${entryId}`);
      } else {
        onChange(entryId);
      }
    }
    onClose();
  };

  const content = (
    <div className="flex h-full w-[252px] flex-col border-r border-black/[0.06] bg-white">
      <div className="flex items-center justify-between px-[16px] pt-[16px] pb-[12px]">
        <Link href="/" className="flex items-center gap-[8px]">
          <Logo className="h-[20px] w-auto" />
          <span className="text-[15px] font-semibold tracking-[-0.2px] text-black">Carbonsynq</span>
        </Link>
        <button onClick={onClose} className="flex items-center justify-center text-[#a1a1aa] hover:text-black lg:hidden">
          <X size={18} />
        </button>
      </div>

      <div className="px-[12px]">
        <div className="flex items-center gap-[8px] rounded-[8px] border border-black/[0.06] bg-[#fafafa] px-[10px] py-[8px]">
          <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[6px] bg-slate-800 text-[10px] font-bold text-white">
            {orgName.slice(0, 1)}
          </span>
          <span className="truncate text-[13px] font-medium text-black" title={orgName}>
            {orgName}
          </span>
        </div>
      </div>

      <nav className="custom-scrollbar mt-[14px] flex flex-1 flex-col gap-[18px] overflow-y-auto px-[12px]">
        {NAV_GROUPS.map((group) => {
          return (
            <div key={group.label}>
              <p className="mb-[6px] px-[10px] text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[#a1a1aa]">
                {group.label}
              </p>
              <div className="flex flex-col gap-[2px]">
                {group.items.map((entry) => (
                  <NavItem
                    key={entry.id}
                    entry={entry}
                    active={active === entry.id}
                    badge={entry.id === "review" ? reviewCount : undefined}
                    onClick={() => handleNavClick(entry.id)}
                  />
                ))}
              </div>
            </div>
          );
        })}

        <div className="mt-[2px] rounded-[10px] border border-slate-200 bg-slate-50 p-[12px]">
          <div className="flex items-center justify-between">
            <p className="text-[12px] font-semibold text-slate-700">2030 target</p>
            <span className="text-[10.5px] font-semibold text-teal-600">−42%</span>
          </div>
          <div className="mt-[8px] h-[4px] w-full overflow-hidden rounded-full bg-slate-200">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "44%" }}
              transition={{ duration: 1.2, ease: EASE, delay: 0.4 }}
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #0f766e, #06b6d4)" }}
            />
          </div>
          <p className="mt-[8px] text-[11px] leading-snug text-slate-500">−18.6% of −42% target met</p>
        </div>
      </nav>

      <div className="border-t border-black/[0.06] p-[12px]">
        <Link
          href="/"
          className="mb-[8px] flex items-center justify-between rounded-[8px] px-[10px] py-[8px] text-[13px] font-medium text-[#71717a] transition-colors hover:bg-black/[0.03] hover:text-black"
        >
          View live site
          <ArrowUpRight size={14} className="text-[#a1a1aa]" />
        </Link>
        <div className="flex items-center gap-[10px] rounded-[8px] px-[10px] py-[8px]">
          <span className="flex h-[28px] w-[28px] items-center justify-center rounded-full bg-slate-800 text-[11px] font-semibold text-white uppercase">
            {user?.firstName?.slice(0, 1) || "U"}
            {user?.lastName?.slice(0, 1) || ""}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-black">
              {user?.firstName} {user?.lastName || ""}
            </p>
            <div className="mt-[2px] flex items-center gap-[6px]">
              <p className="truncate text-[11px] text-[#a1a1aa]">{user?.email}</p>
              <span className="rounded-full border border-black/10 bg-black/5 px-[6px] py-[1px] text-[8.5px] font-bold uppercase tracking-wider text-black">
                {user?.role?.replace("_", " ") || "USER"}
              </span>
            </div>
          </div>
          <button
            onClick={logout}
            title="Log out"
            aria-label="Log out"
            className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-[6px] text-[#71717a] transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <SignOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="sticky top-0 hidden h-dvh lg:block">{content}</aside>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
              onClick={onClose}
            />
            <motion.div
              initial={{ x: -264 }}
              animate={{ x: 0 }}
              exit={{ x: -264 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="absolute top-0 bottom-0 left-0"
            >
              {content}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

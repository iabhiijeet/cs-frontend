"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react";

interface Props {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export default function PageShell({ title, subtitle, icon, actions, children }: Props) {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            {icon && <div className="text-teal-600">{icon}</div>}
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
              {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
        {children}
      </div>
    </div>
  );
}

export function EmptyState({ title, desc, icon }: { title: string; desc?: string; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-20 px-8 text-center">
      {icon && <div className="mb-4 text-slate-300 text-5xl">{icon}</div>}
      <p className="text-base font-semibold text-slate-700">{title}</p>
      {desc && <p className="mt-1 text-sm text-slate-400">{desc}</p>}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    DRAFT: "bg-slate-100 text-slate-600",
    SUBMITTED: "bg-blue-50 text-blue-700",
    UNDER_REVIEW: "bg-yellow-50 text-yellow-700",
    APPROVED: "bg-green-50 text-green-700",
    REJECTED: "bg-red-50 text-red-700",
    VERIFIED: "bg-teal-50 text-teal-700",
    ACTIVE: "bg-green-50 text-green-700",
    CLOSED: "bg-slate-100 text-slate-600",
    OPEN: "bg-blue-50 text-blue-700",
  };
  const cls = colors[status] ?? "bg-slate-100 text-slate-500";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      {status?.replace(/_/g, " ")}
    </span>
  );
}

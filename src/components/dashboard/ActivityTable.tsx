"use client";

import { motion } from "motion/react";
import { ArrowRight, CheckCircle, Clock, DotsThree, WarningCircle } from "@phosphor-icons/react";
import { EASE } from "@/lib/animations";
import { useDashboardContext } from "@/hooks/useDashboardContext";
import { Plus } from "@phosphor-icons/react";
import { toast } from "sonner";
import { useState } from "react";

const STATUS = {
  Synced: { icon: CheckCircle, cls: "text-teal-700 bg-teal-50 border-teal-200" },
  Processed: { icon: Clock, cls: "text-blue-700 bg-blue-50 border-blue-200" },
  "Needs review": { icon: WarningCircle, cls: "text-amber-700 bg-amber-50 border-amber-200" },
} as const;

export default function ActivityTable({ delay = 0 }: { delay?: number }) {
  const { data: { ACTIVITY } } = useDashboardContext();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const hasData = ACTIVITY && ACTIVITY.length > 0;

  return (
    <div className="flex h-full flex-col">
      <div className="mb-[14px] flex items-center justify-between">
        <div className="flex items-center gap-[10px]">
          <button
            onClick={() => toast.success("Data entry form will be opened")}
            className="flex items-center gap-[5px] rounded-full bg-slate-900 px-[12px] py-[5px] text-[11.5px] font-semibold text-white transition-colors hover:bg-slate-700"
          >
            <Plus size={12} weight="bold" />
            Add data
          </button>
        </div>
        <button className="flex items-center gap-[4px] text-[12px] font-semibold text-slate-500 transition-colors hover:text-slate-900">
          View all <ArrowRight size={12} weight="bold" />
        </button>
      </div>
      <div className="mt-[16px] flex-1 overflow-x-auto pb-[60px]">
        {hasData ? (
          <table className="w-full min-w-[560px] border-collapse">
            <thead>
              <tr className="text-left text-[11.5px] font-semibold uppercase tracking-[0.06em] text-slate-500">
                <th className="pb-[10px] pr-[16px] font-semibold">Source</th>
                <th className="pb-[10px] pr-[16px] font-semibold">Category</th>
                <th className="pb-[10px] pr-[16px] font-semibold">Scope</th>
                <th className="pb-[10px] pr-[16px] text-right font-semibold">CO₂e</th>
                <th className="pb-[10px] font-semibold">Status</th>
                <th className="pb-[10px] w-[40px]"></th>
              </tr>
            </thead>
            <tbody>
              {ACTIVITY.map((row: any, i: number) => {
                const st = STATUS[row.status as keyof typeof STATUS] || STATUS.Synced;
                const Icon = st.icon;
                return (
                  <motion.tr
                    key={row.source}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, ease: EASE, delay: 0.06 * i + delay }}
                    whileHover={{ backgroundColor: "rgba(15,23,42,0.02)" }}
                    className="group border-t border-slate-100 cursor-default relative"
                  >
                    <td className="py-[14px] pr-[16px]">
                      <p className="text-[14px] font-semibold text-slate-800">{row.source}</p>
                      <div className="mt-[2px] flex items-center gap-[4px] text-[11.5px] text-slate-500">
                        <span className="h-[6px] w-[6px] rounded-full bg-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.2)]"></span>
                        Auto-synced 2h ago
                      </div>
                    </td>
                    <td className="py-[14px] pr-[16px] text-[13px] text-slate-600">{row.type}</td>
                    <td className="py-[14px] pr-[16px]">
                      <span className="rounded-[8px] border border-slate-200 bg-slate-50 px-[8px] py-[3px] text-[11.5px] font-semibold text-slate-600">
                        {row.scope}
                      </span>
                    </td>
                    <td className="py-[14px] pr-[16px] text-right text-[14px] font-bold text-slate-900 tabular-nums">
                      {row.value}
                    </td>
                    <td className="py-[14px]">
                      <span className={`inline-flex items-center gap-[5px] rounded-full border px-[8px] py-[3px] text-[11px] font-medium ${st.cls}`}>
                        <Icon size={11} weight="fill" />
                        {row.status}
                      </span>
                    </td>
                    <td className="py-[13px] pl-[8px] relative text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenu(activeMenu === row.source ? null : row.source);
                        }}
                        className="text-slate-300 transition-colors duration-200 hover:text-slate-700 focus:outline-none"
                      >
                        <DotsThree size={16} className={activeMenu === row.source ? "text-slate-700 opacity-100" : "opacity-0 group-hover:opacity-100"} />
                      </button>

                      {activeMenu === row.source && (
                        <div className="absolute right-0 top-[30px] z-10 w-[130px] rounded-[10px] border border-slate-100 bg-white p-[6px] shadow-[0_8px_24px_rgba(15,23,42,0.12)]">
                          {row.status === "Needs review" && (
                            <>
                              <button
                                onClick={() => { setActiveMenu(null); toast.success("Activity approved"); }}
                                className="w-full rounded-[6px] px-[8px] py-[6px] text-left text-[12px] font-medium text-teal-700 hover:bg-teal-50"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => { setActiveMenu(null); toast.error("Activity rejected"); }}
                                className="w-full rounded-[6px] px-[8px] py-[6px] text-left text-[12px] font-medium text-red-600 hover:bg-red-50"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => { setActiveMenu(null); toast.info("Edit mode active"); }}
                            className="w-full rounded-[6px] px-[8px] py-[6px] text-left text-[12px] font-medium text-slate-600 hover:bg-slate-50"
                          >
                            Edit log
                          </button>
                        </div>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="flex h-[200px] flex-col items-center justify-center rounded-[12px] border border-dashed border-slate-200 bg-slate-50">
            <div className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-slate-100">
              <Clock size={20} className="text-slate-400" />
            </div>
            <p className="mt-[12px] text-[13px] font-semibold text-slate-700">No recent activity</p>
            <p className="mt-[4px] text-[12px] text-slate-400">Click &apos;Add data&apos; to log your first emission.</p>
          </div>
        )}
      </div>

      {hasData && (
        <div className="mt-[14px] flex items-center justify-between border-t border-slate-100 pt-[12px]">
          <p className="text-[11.5px] text-slate-400">Showing {ACTIVITY.length} records</p>
          <div className="flex items-center gap-[2px]">
            <button className="flex h-[26px] items-center justify-center rounded-[6px] border border-slate-200 bg-white px-[8px] text-[11.5px] font-medium text-slate-400">Prev</button>
            <button className="flex h-[26px] items-center justify-center rounded-[6px] bg-slate-900 px-[9px] text-[11.5px] font-semibold text-white">1</button>
            <button className="flex h-[26px] items-center justify-center rounded-[6px] border border-slate-200 bg-white px-[8px] text-[11.5px] font-medium text-slate-500">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}

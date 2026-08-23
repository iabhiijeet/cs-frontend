"use client";

import { useDashboardContext } from "@/hooks/useDashboardContext";

export default function DashboardFilterBar() {
  const { filters, setFilters, periods } = useDashboardContext();

  const periodOptions: { id: string; name: string }[] = (periods || []).map((rp: any) => ({
    id: rp.id,
    name: rp.name,
  }));

  return (
    <div className="flex flex-wrap items-center gap-[12px] rounded-[12px] border border-black/[0.08] bg-white p-[16px] shadow-[0_1px_3px_rgba(0,0,0,0.02)] mb-[24px]">
      <div className="flex items-center gap-[8px]">
        <span className="text-[12px] font-semibold text-[#71717a] uppercase tracking-wide">Filters</span>
      </div>

      <div className="h-[24px] w-[1px] bg-black/[0.08] mx-[4px]"></div>

      {/* Reporting Period — functional; drives /dashboard/summary */}
      <div className="flex flex-col gap-[4px]">
        <select
          className="rounded-[6px] border border-black/[0.1] bg-white px-[10px] py-[6px] text-[13px] text-black outline-none focus:border-black focus:ring-1 focus:ring-black"
          value={filters.reportingPeriodId}
          onChange={(e) => setFilters((prev: any) => ({ ...prev, reportingPeriodId: e.target.value }))}
        >
          {!filters.reportingPeriodId && <option value="">Default period</option>}
          {periodOptions.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Campus / Building / Floor — no corresponding V2 query parameters exist,
          so they cannot filter API results. Disabled rather than fake-filtering. */}
      <div className="flex flex-wrap items-center gap-[12px]" title="Filtering by location is not yet supported by the API">
        {["All Campuses", "All Buildings", "All Floors"].map((label) => (
          <select
            key={label}
            disabled
            className="rounded-[6px] border border-black/[0.1] bg-white px-[10px] py-[6px] text-[13px] text-[#a1a1aa] outline-none cursor-not-allowed"
          >
            <option>{label}</option>
          </select>
        ))}
      </div>

    </div>
  );
}

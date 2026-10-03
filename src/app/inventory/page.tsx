"use client";
import { useEffect, useState } from "react";
import { ChartPie } from "@phosphor-icons/react";
import PageShell, { EmptyState, StatusBadge } from "@/components/dashboard/PageShell";
import { getInventory, getPeriods } from "@/lib/api";

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [periods, setPeriods] = useState<any[]>([]);
  const [periodId, setPeriodId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalTco2e, setTotalTco2e] = useState(0);

  useEffect(() => {
    getPeriods({ limit: "50" }).then(r => {
      const ps = r?.data?.items ?? r?.data ?? [];
      setPeriods(ps);
      if (ps.length > 0) setPeriodId(ps[0].id);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const load = async (pid: string) => {
    if (!pid) return;
    setLoading(true); setError("");
    try {
      const res = await getInventory(pid, { limit: 100 });
      const rows = res?.data?.items ?? res?.data ?? [];
      setItems(rows);
      setTotalTco2e(rows.reduce((acc: number, r: any) => acc + (Number(r.value_tco2e) || 0), 0));
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };

  useEffect(() => { if (periodId) load(periodId); }, [periodId]);

  return (
    <PageShell title="Emission Inventory" subtitle="Combined primary and supplemental emission inventory" icon={<ChartPie size={28} />}
      actions={
        <select value={periodId} onChange={e => setPeriodId(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
          <option value="">Select period...</option>
          {periods.map((p: any) => <option key={p.id} value={p.id}>{p.name ?? p.year}</option>)}
        </select>
      }>
      {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
      {!periodId ? <EmptyState title="Select a reporting period" desc="Choose a period above to view the emission inventory." icon={<ChartPie size={40} />} />
      : loading ? <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" /></div>
      : (
        <>
          <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase text-slate-500 tracking-wide">Total Emissions</p>
              <p className="mt-2 text-3xl font-black text-teal-600">{totalTco2e.toFixed(1)}<span className="text-sm font-normal text-slate-400 ml-1">tCO2e</span></p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase text-slate-500 tracking-wide">Records</p>
              <p className="mt-2 text-3xl font-black text-slate-800">{items.length}</p>
            </div>
          </div>
          {items.length === 0 ? <EmptyState title="No inventory records" desc="No emission records found for this period." icon={<ChartPie size={40} />} />
          : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-100 bg-slate-50">
                  <tr>{["Category","Scope","Value (tCO2e)","Status","Date"].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((row: any, i: number) => (
                    <tr key={row.id ?? i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-800">{row.category ?? row.activity_category ?? "-"}</td>
                      <td className="px-4 py-3 text-slate-500">{row.scope ?? "-"}</td>
                      <td className="px-4 py-3 text-teal-700 font-semibold">{row.value_tco2e != null ? Number(row.value_tco2e).toFixed(3) : "-"}</td>
                      <td className="px-4 py-3"><StatusBadge status={row.status ?? "APPROVED"} /></td>
                      <td className="px-4 py-3 text-slate-400">{row.date ? new Date(row.date).toLocaleDateString() : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </PageShell>
  );
}
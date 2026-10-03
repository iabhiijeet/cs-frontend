"use client";
import { useEffect, useState } from "react";
import { Buildings } from "@phosphor-icons/react";
import PageShell, { EmptyState } from "@/components/dashboard/PageShell";
import { getDepartments } from "@/lib/api";

export default function DepartmentsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getDepartments({ limit: "100" })
      .then(r => setItems(r?.data?.items ?? r?.data ?? []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageShell title="Departments" subtitle="University departments for KPI data collection" icon={<Buildings size={28} />}>
      {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
      {loading ? (
        <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" /></div>
      ) : items.length === 0 ? (
        <EmptyState title="No departments" desc="Departments are configured by administrators." icon={<Buildings size={40} />} />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr>{["Name","Campus","Head","Created"].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((d: any) => (
                <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800">{d.name}</td>
                  <td className="px-4 py-3 text-slate-500">{d.campus_name ?? "-"}</td>
                  <td className="px-4 py-3 text-slate-500">{d.head_name ?? "-"}</td>
                  <td className="px-4 py-3 text-slate-400">{d.created_at ? new Date(d.created_at).toLocaleDateString() : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageShell>
  );
}
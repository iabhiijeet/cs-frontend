"use client";
import { useEffect, useState } from "react";
import { Recycle, CheckCircle, XCircle } from "@phosphor-icons/react";
import PageShell, { EmptyState, StatusBadge } from "@/components/dashboard/PageShell";
import { getVoids, approveVoid, rejectVoid } from "@/lib/api";

export default function VoidsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try { const res = await getVoids(); setItems(res?.data?.items ?? res?.data ?? []); }
    catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleApprove = async (id: string) => {
    try { await approveVoid(id); load(); } catch (e: any) { alert(e.message); }
  };
  const handleReject = async (id: string) => {
    const reason = prompt("Reason for rejection?");
    if (!reason) return;
    try { await rejectVoid(id, { reason }); load(); } catch (e: any) { alert(e.message); }
  };

  return (
    <PageShell title="Inventory Voids" subtitle="Review traceable corrections to emission records" icon={<Recycle size={28} />}>
      {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
      {loading ? <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" /></div>
      : items.length === 0 ? <EmptyState title="No pending voids" desc="Void requests appear here when emission records need correction." icon={<Recycle size={40} />} />
      : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr>{["Emission ID","Reason","Requested By","Status","Actions"].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((v: any) => (
                <tr key={v.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">{(v.emission_id ?? "").slice(0, 8)}...</td>
                  <td className="px-4 py-3 text-slate-700 max-w-xs"><p className="truncate">{v.reason ?? "-"}</p></td>
                  <td className="px-4 py-3 text-slate-500">{v.created_by_name ?? "-"}</td>
                  <td className="px-4 py-3"><StatusBadge status={v.status ?? "PENDING"} /></td>
                  <td className="px-4 py-3">
                    {v.status === "PENDING" && (
                      <div className="flex gap-2">
                        <button onClick={() => handleApprove(v.id)} className="flex items-center gap-1 rounded-lg bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-100"><CheckCircle size={12} /> Approve</button>
                        <button onClick={() => handleReject(v.id)} className="flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"><XCircle size={12} /> Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageShell>
  );
}
"use client";
import { useEffect, useState } from "react";
import { Buildings, Plus } from "@phosphor-icons/react";
import PageShell, { EmptyState, StatusBadge } from "@/components/dashboard/PageShell";
import { getSupplierRequests, createSupplierRequest, approveSupplierRequest, rejectSupplierRequest, inviteSupplier } from "@/lib/api";

export default function SupplierRequestsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try { const res = await getSupplierRequests(); setItems(res?.data?.items ?? res?.data ?? []); }
    catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try { await createSupplierRequest(form); setShowForm(false); setForm({ title: "", description: "" }); load(); }
    catch (e: any) { alert(e.message); } finally { setSaving(false); }
  };

  const handleAction = async (id: string, action: "approve" | "reject" | "invite") => {
    try {
      if (action === "approve") await approveSupplierRequest(id);
      else if (action === "reject") { const reason = prompt("Reason?"); if (!reason) return; await rejectSupplierRequest(id, { reason }); }
      else await inviteSupplier(id);
      load();
    } catch (e: any) { alert(e.message); }
  };

  return (
    <PageShell title="Supplier Requests" subtitle="Supply chain data requests and responses" icon={<Buildings size={28} />}
      actions={<button onClick={() => setShowForm(true)} className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"><Plus size={16} /> New Request</button>}>
      {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
      {showForm && (
        <form onSubmit={handleCreate} className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-slate-800 mb-4">New Supplier Request</h3>
          <div className="grid gap-4">
            <div><label className="block text-xs font-semibold text-slate-600 mb-1">Title *</label><input required value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" /></div>
            <div><label className="block text-xs font-semibold text-slate-600 mb-1">Description</label><textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} rows={2} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" /></div>
          </div>
          <div className="mt-4 flex gap-2">
            <button type="submit" disabled={saving} className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60">{saving ? "Creating..." : "Create"}</button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
          </div>
        </form>
      )}
      {loading ? <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" /></div>
      : items.length === 0 ? <EmptyState title="No supplier requests" desc="Create a request to collect ESG data from suppliers." icon={<Buildings size={40} />} />
      : (
        <div className="space-y-3">
          {items.map((item: any) => (
            <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1"><StatusBadge status={item.status ?? "PENDING"} /></div>
                  <h3 className="font-semibold text-slate-800 text-sm">{item.title}</h3>
                  {item.description && <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.description}</p>}
                </div>
                <div className="flex gap-2 shrink-0">
                  {item.status === "PENDING" && <button onClick={() => handleAction(item.id, "invite")} className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100">Send Invite</button>}
                  <button onClick={() => handleAction(item.id, "approve")} className="rounded-lg bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-100">Approve</button>
                  <button onClick={() => handleAction(item.id, "reject")} className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100">Reject</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
"use client";
import { useEffect, useState } from "react";
import { Package, Plus } from "@phosphor-icons/react";
import PageShell, { EmptyState, StatusBadge } from "@/components/dashboard/PageShell";
import { getPcfStudies, createPcfStudy, submitPcfStudy, approvePcfStudy, rejectPcfStudy } from "@/lib/api";

export default function PcfStudiesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", productName: "" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try { const res = await getPcfStudies(); setItems(res?.data?.items ?? res?.data ?? []); }
    catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      await createPcfStudy({ name: form.name, description: form.description, product_name: form.productName });
      setShowForm(false); setForm({ name: "", description: "", productName: "" }); load();
    } catch (e: any) { alert(e.message); } finally { setSaving(false); }
  };

  const handleAction = async (id: string, action: "submit" | "approve" | "reject") => {
    try {
      if (action === "submit") await submitPcfStudy(id);
      else if (action === "approve") await approvePcfStudy(id);
      else { const reason = prompt("Rejection reason?"); if (!reason) return; await rejectPcfStudy(id, { reason }); }
      load();
    } catch (e: any) { alert(e.message); }
  };

  return (
    <PageShell title="PCF Studies" subtitle="Product Carbon Footprint screening studies" icon={<Package size={28} />}
      actions={<button onClick={() => setShowForm(true)} className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"><Plus size={16} /> New Study</button>}>
      {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
      {showForm && (
        <form onSubmit={handleCreate} className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-slate-800 mb-4">New PCF Study</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="block text-xs font-semibold text-slate-600 mb-1">Study Name *</label><input required value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" /></div>
            <div><label className="block text-xs font-semibold text-slate-600 mb-1">Product Name</label><input value={form.productName} onChange={e => setForm(f => ({...f, productName: e.target.value}))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" /></div>
            <div className="sm:col-span-2"><label className="block text-xs font-semibold text-slate-600 mb-1">Description</label><textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} rows={2} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" /></div>
          </div>
          <div className="mt-4 flex gap-2">
            <button type="submit" disabled={saving} className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60">{saving ? "Creating..." : "Create Study"}</button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
          </div>
        </form>
      )}
      {loading ? <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" /></div>
      : items.length === 0 ? <EmptyState title="No PCF studies yet" desc="Create a PCF screening study to assess product carbon footprints." icon={<Package size={40} />} />
      : (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((item: any) => (
            <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between mb-2"><h3 className="font-semibold text-slate-800">{item.name}</h3><StatusBadge status={item.status ?? "DRAFT"} /></div>
              {item.product_name && <p className="text-xs text-slate-500 mb-1">Product: <span className="font-medium">{item.product_name}</span></p>}
              {item.description && <p className="text-xs text-slate-400 mb-3 line-clamp-2">{item.description}</p>}
              <div className="flex gap-2">
                {item.status === "DRAFT" && <button onClick={() => handleAction(item.id, "submit")} className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100">Submit</button>}
                {item.status === "SUBMITTED" && (
                  <>
                    <button onClick={() => handleAction(item.id, "approve")} className="rounded-lg bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-100">Approve</button>
                    <button onClick={() => handleAction(item.id, "reject")} className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100">Reject</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
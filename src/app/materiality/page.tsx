"use client";
import { useEffect, useState } from "react";
import { Scales, Plus } from "@phosphor-icons/react";
import PageShell, { EmptyState, StatusBadge } from "@/components/dashboard/PageShell";
import { getMaterialityAssessments, createMateriality, closeMateriality, reopenMateriality, approveMateriality } from "@/lib/api";

export default function MaterialityPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try { const res = await getMaterialityAssessments(); setItems(res?.data?.items ?? res?.data ?? []); }
    catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try { await createMateriality(form); setShowForm(false); setForm({ title: "", description: "" }); load(); }
    catch (e: any) { alert(e.message); } finally { setSaving(false); }
  };

  const doAction = async (id: string, action: "close" | "reopen" | "approve") => {
    try {
      if (action === "close") await closeMateriality(id);
      else if (action === "reopen") await reopenMateriality(id);
      else await approveMateriality(id);
      load();
    } catch (e: any) { alert(e.message); }
  };

  return (
    <PageShell title="Materiality Assessments" subtitle="Stakeholder engagement and ESG materiality analysis" icon={<Scales size={28} />}
      actions={<button onClick={() => setShowForm(true)} className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"><Plus size={16} /> New Assessment</button>}>
      {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
      {showForm && (
        <form onSubmit={handleCreate} className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-slate-800 mb-4">New Materiality Assessment</h3>
          <div className="grid gap-4">
            <div><label className="block text-xs font-semibold text-slate-600 mb-1">Title *</label><input required value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" /></div>
            <div><label className="block text-xs font-semibold text-slate-600 mb-1">Description</label><textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} rows={3} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" /></div>
          </div>
          <div className="mt-4 flex gap-2">
            <button type="submit" disabled={saving} className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60">{saving ? "Saving..." : "Create"}</button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
          </div>
        </form>
      )}
      {loading ? <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" /></div>
      : items.length === 0 ? <EmptyState title="No assessments yet" desc="Create a materiality assessment to engage stakeholders." icon={<Scales size={40} />} />
      : (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((item: any) => (
            <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between mb-2"><h3 className="font-semibold text-slate-800">{item.title}</h3><StatusBadge status={item.status ?? "OPEN"} /></div>
              {item.description && <p className="text-xs text-slate-500 mb-4 line-clamp-2">{item.description}</p>}
              <div className="flex gap-2 flex-wrap">
                {item.status === "OPEN" && <button onClick={() => doAction(item.id, "close")} className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200">Close</button>}
                {item.status === "CLOSED" && (
                  <>
                    <button onClick={() => doAction(item.id, "reopen")} className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100">Reopen</button>
                    <button onClick={() => doAction(item.id, "approve")} className="rounded-lg bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-100">Approve</button>
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
"use client";
import { useEffect, useState } from "react";
import { Rocket, Plus, PencilSimple } from "@phosphor-icons/react";
import PageShell, { EmptyState, StatusBadge } from "@/components/dashboard/PageShell";
import { getInitiatives, createInitiative, updateInitiative } from "@/lib/api";

export default function InitiativesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", targetYear: "", projectedSavingsTco2e: "" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getInitiatives();
      setItems(res?.data?.items ?? res?.data ?? []);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      await createInitiative({ ...form, projectedSavingsTco2e: Number(form.projectedSavingsTco2e) || 0, targetYear: Number(form.targetYear) || undefined });
      setShowForm(false); setForm({ name: "", description: "", targetYear: "", projectedSavingsTco2e: "" }); load();
    } catch (e: any) { alert(e.message); }
    finally { setSaving(false); }
  };

  return (
    <PageShell title="Initiatives" subtitle="Track sustainability initiatives and their progress" icon={<Rocket size={28} />}
      actions={<button onClick={() => setShowForm(true)} className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"><Plus size={16} /> New Initiative</button>}>
      {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
      {showForm && (
        <form onSubmit={handleCreate} className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-slate-800 mb-4">New Initiative</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><label className="block text-xs font-semibold text-slate-600 mb-1">Name *</label><input required value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" /></div>
            <div><label className="block text-xs font-semibold text-slate-600 mb-1">Target Year</label><input type="number" value={form.targetYear} onChange={e => setForm(f => ({...f, targetYear: e.target.value}))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" /></div>
            <div><label className="block text-xs font-semibold text-slate-600 mb-1">Projected Savings (tCO2e)</label><input type="number" value={form.projectedSavingsTco2e} onChange={e => setForm(f => ({...f, projectedSavingsTco2e: e.target.value}))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" /></div>
            <div><label className="block text-xs font-semibold text-slate-600 mb-1">Description</label><input value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" /></div>
          </div>
          <div className="mt-4 flex gap-2"><button type="submit" disabled={saving} className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60">{saving ? "Saving..." : "Create"}</button><button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button></div>
        </form>
      )}
      {loading ? (
        <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" /></div>
      ) : items.length === 0 ? (
        <EmptyState title="No initiatives yet" desc="Create your first sustainability initiative to start tracking progress." icon={<Rocket size={40} />} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item: any) => (
            <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-slate-800 text-sm leading-tight">{item.name}</h3>
                <StatusBadge status={item.status ?? "ACTIVE"} />
              </div>
              {item.description && <p className="text-xs text-slate-500 mb-3 line-clamp-2">{item.description}</p>}
              <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                {item.targetYear && <span>?? {item.targetYear}</span>}
                {item.projectedSavingsTco2e != null && <span>?? {Number(item.projectedSavingsTco2e).toFixed(1)} tCO2e saved</span>}
                {item.actualSavingsTco2e != null && <span className="text-teal-600 font-semibold">? {Number(item.actualSavingsTco2e).toFixed(1)} actual</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}

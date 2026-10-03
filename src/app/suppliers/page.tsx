"use client";
import { useEffect, useState } from "react";
import { Truck, Plus, Envelope } from "@phosphor-icons/react";
import PageShell, { EmptyState } from "@/components/dashboard/PageShell";
import { getSuppliers, createSupplier } from "@/lib/api";

export default function SuppliersPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", contactEmail: "", category: "" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try { const res = await getSuppliers(); setItems(res?.data?.items ?? res?.data ?? []); }
    catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try { await createSupplier(form); setShowForm(false); setForm({ name: "", contactEmail: "", category: "" }); load(); }
    catch (e: any) { alert(e.message); } finally { setSaving(false); }
  };

  return (
    <PageShell title="Suppliers" subtitle="Manage Scope 3 supply chain suppliers" icon={<Truck size={28} />}
      actions={<button onClick={() => setShowForm(true)} className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"><Plus size={16} /> Add Supplier</button>}>
      {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
      {showForm && (
        <form onSubmit={handleCreate} className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-slate-800 mb-4">New Supplier</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><label className="block text-xs font-semibold text-slate-600 mb-1">Company Name *</label><input required value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" /></div>
            <div><label className="block text-xs font-semibold text-slate-600 mb-1">Contact Email</label><input type="email" value={form.contactEmail} onChange={e => setForm(f => ({...f, contactEmail: e.target.value}))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" /></div>
            <div><label className="block text-xs font-semibold text-slate-600 mb-1">Category</label><input value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} placeholder="e.g. Raw Materials" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" /></div>
          </div>
          <div className="mt-4 flex gap-2">
            <button type="submit" disabled={saving} className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60">{saving ? "Saving..." : "Add Supplier"}</button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
          </div>
        </form>
      )}
      {loading ? <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" /></div>
      : items.length === 0 ? <EmptyState title="No suppliers yet" desc="Add suppliers to track Scope 3 supply chain emissions." icon={<Truck size={40} />} />
      : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50"><tr>{["Name","Category","Contact Email","Created"].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((s: any) => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800">{s.name}</td>
                  <td className="px-4 py-3 text-slate-500">{s.category ?? "-"}</td>
                  <td className="px-4 py-3 text-slate-500">{s.contact_email ?? "-"}</td>
                  <td className="px-4 py-3 text-slate-400">{s.created_at ? new Date(s.created_at).toLocaleDateString() : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageShell>
  );
}
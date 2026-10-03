"use client";
import { useState } from "react";
import { MagnifyingGlass, Article } from "@phosphor-icons/react";
import PageShell, { EmptyState } from "@/components/dashboard/PageShell";
import { knowledgeSearch } from "@/lib/api";

export default function KnowledgePage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length < 2) return;
    setLoading(true); setError(""); setSearched(true);
    try { const res = await knowledgeSearch(query.trim()); setResults(res?.data?.items ?? res?.data ?? []); }
    catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };

  return (
    <PageShell title="Knowledge Search" subtitle="Search approved university records and emission data" icon={<MagnifyingGlass size={28} />}>
      <form onSubmit={handleSearch} className="mb-8 flex gap-3">
        <div className="relative flex-1">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search records, emissions, factors..." className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
        <button type="submit" disabled={loading || query.trim().length < 2} className="rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60">
          {loading ? "Searching..." : "Search"}
        </button>
      </form>
      {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
      {!searched ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center">
          <MagnifyingGlass size={40} className="mx-auto mb-4 text-slate-300" />
          <p className="text-base font-semibold text-slate-600">Search approved records</p>
          <p className="mt-1 text-sm text-slate-400">Enter at least 2 characters to search across all approved university data</p>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" /></div>
      ) : results.length === 0 ? (
        <EmptyState title="No results found" desc={`No approved records match "${query}"`} icon={<Article size={40} />} />
      ) : (
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-500">{results.length} result{results.length !== 1 ? "s" : ""} for <span className="font-semibold text-slate-700">"{query}"</span></p>
          {results.map((r: any, i: number) => (
            <div key={r.id ?? i} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-teal-50 rounded-full px-2 py-0.5">{r.type ?? r.kind ?? "Record"}</span>
                <span className="text-xs text-slate-400">{r.created_at ? new Date(r.created_at).toLocaleDateString() : ""}</span>
              </div>
              <h3 className="font-semibold text-slate-800 text-sm mt-1">{r.name ?? r.title ?? r.description ?? r.id}</h3>
              {r.value_tco2e != null && <p className="text-xs text-teal-700 font-semibold mt-2">{Number(r.value_tco2e).toFixed(3)} tCO2e</p>}
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
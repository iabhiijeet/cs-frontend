"use client";
import { useState } from "react";
import { Brain, Sparkle } from "@phosphor-icons/react";
import PageShell from "@/components/dashboard/PageShell";
import { queryInsights } from "@/lib/api";

const SUGGESTIONS = [
  "What are our top 3 emission sources?",
  "How do our Scope 2 emissions compare to last year?",
  "Which campus has the highest carbon footprint?",
  "What percentage of our emissions come from electricity?",
];

export default function InsightsPage() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleQuery = async (q?: string) => {
    const text = q ?? question;
    if (!text.trim()) return;
    setLoading(true); setError(""); setResult(null);
    try { const res = await queryInsights({ question: text }); setResult(res?.data ?? res); }
    catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };

  return (
    <PageShell title="Insights" subtitle="AI-powered traceable insights from your emission data" icon={<Brain size={28} />}>
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="block text-sm font-semibold text-slate-700 mb-3">Ask a question about your emissions</label>
        <div className="flex gap-3">
          <input
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleQuery()}
            placeholder="e.g. What are our top emission sources?"
            className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button onClick={() => handleQuery()} disabled={loading || !question.trim()} className="flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60">
            <Sparkle size={16} />{loading ? "Thinking..." : "Ask"}
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s, i) => (
            <button key={i} onClick={() => { setQuestion(s); handleQuery(s); }} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-teal-400 hover:bg-teal-50 hover:text-teal-700 transition-colors">
              {s}
            </button>
          ))}
        </div>
      </div>
      {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
      {result && (
        <div className="rounded-2xl border border-teal-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4"><Sparkle size={18} className="text-teal-600" /><span className="text-sm font-semibold text-teal-700">Insight</span></div>
          {typeof result === "string" ? (
            <p className="text-slate-700 leading-relaxed">{result}</p>
          ) : (
            <pre className="text-xs text-slate-600 bg-slate-50 rounded-xl p-4 overflow-x-auto whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
          )}
        </div>
      )}
    </PageShell>
  );
}
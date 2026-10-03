"use client";
import { useState, useRef } from "react";
import { FileCsv, Upload, CheckCircle, Warning } from "@phosphor-icons/react";
import PageShell from "@/components/dashboard/PageShell";
import { previewEmissionsCsv, commitEmissionsCsv } from "@/lib/api";

type PreviewRow = { row: number; errors?: string[]; data?: Record<string, unknown> };

export default function ImportsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<{ valid: PreviewRow[]; invalid: PreviewRow[]; total: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [committed, setCommitted] = useState<{ imported: number } | null>(null);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f); setPreview(null); setCommitted(null); setError("");
  };

  const handlePreview = async () => {
    if (!file) return;
    setLoading(true); setError("");
    try {
      const res = await previewEmissionsCsv(file);
      if (!res.ok) { setError(res.data?.error ?? "Preview failed"); return; }
      setPreview(res.data?.data ?? res.data);
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };

  const handleCommit = async () => {
    if (!file || !preview) return;
    if (!confirm(`Import ${preview.valid?.length ?? 0} valid rows as reviewable drafts?`)) return;
    setLoading(true); setError("");
    try {
      const res = await commitEmissionsCsv(file);
      if (!res.ok) { setError(res.data?.error ?? "Import failed"); return; }
      setCommitted(res.data?.data ?? res.data);
      setPreview(null); setFile(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };

  return (
    <PageShell title="Import Emissions" subtitle="Upload CSV to bulk-import emission records as reviewable drafts" icon={<FileCsv size={28} />}>
      {committed && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-5 py-4">
          <CheckCircle size={24} className="text-green-600 shrink-0" />
          <div>
            <p className="font-semibold text-green-800">Import successful!</p>
            <p className="text-sm text-green-700">{committed.imported} records imported as DRAFT</p>
          </div>
        </div>
      )}
      {error && (
        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
          <Warning size={20} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm mb-6">
        <h3 className="text-base font-semibold text-slate-800 mb-4">Upload CSV File</h3>
        <label className="flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-10 text-center hover:border-teal-400 hover:bg-teal-50 transition-colors">
          <FileCsv size={36} className="mb-3 text-slate-400" />
          <p className="text-sm font-semibold text-slate-600">{file ? file.name : "Click to select CSV file"}</p>
          <p className="text-xs text-slate-400 mt-1">{file ? `${(file.size / 1024).toFixed(1)} KB` : "Supports .csv files"}</p>
          <input ref={fileRef} type="file" accept=".csv" className="sr-only" onChange={handleFileChange} />
        </label>
        <div className="mt-4 flex gap-3">
          <button onClick={handlePreview} disabled={!file || loading} className="rounded-lg bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-900 disabled:opacity-50">
            {loading && !preview ? "Validating..." : "Validate CSV"}
          </button>
          {preview && (preview.valid?.length ?? 0) > 0 && (
            <button onClick={handleCommit} disabled={loading} className="rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50">
              {loading && preview ? "Importing..." : `Import ${preview.valid?.length} rows`}
            </button>
          )}
        </div>
      </div>
      {preview && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-center"><p className="text-2xl font-black text-slate-800">{preview.total ?? 0}</p><p className="text-xs font-semibold text-slate-500 mt-1">Total Rows</p></div>
            <div className="rounded-2xl border border-green-200 bg-green-50 p-5 shadow-sm text-center"><p className="text-2xl font-black text-green-700">{preview.valid?.length ?? 0}</p><p className="text-xs font-semibold text-green-600 mt-1">Valid</p></div>
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm text-center"><p className="text-2xl font-black text-red-700">{preview.invalid?.length ?? 0}</p><p className="text-xs font-semibold text-red-600 mt-1">Invalid</p></div>
          </div>
          {(preview.invalid?.length ?? 0) > 0 && (
            <div className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
              <h4 className="text-sm font-semibold text-red-700 mb-3">Validation Errors</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {preview.invalid?.map((row, i) => (
                  <div key={i} className="rounded-lg bg-red-50 px-3 py-2 text-xs">
                    <span className="font-semibold">Row {row.row}:</span> {row.errors?.join("; ")}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </PageShell>
  );
}
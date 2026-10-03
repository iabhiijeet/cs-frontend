"use client";
import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Receipt, UploadSimple, CheckCircle, Warning, Sparkle, FilePdf, FileImage, Eye, ArrowRight } from "@phosphor-icons/react";
import Topbar from "@/components/dashboard/Topbar";
import { uploadDocumentV2, requestOcr } from "@/lib/api";

type Stage = "upload" | "processing" | "result" | "done";

const ACCEPTED = [".pdf", ".jpg", ".jpeg", ".png", ".webp"];

function getMimeIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return <FilePdf size={32} className="text-red-500" />;
  return <FileImage size={32} className="text-blue-500" />;
}

export default function InvoiceUploadPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [documentId, setDocumentId] = useState("");
  const [ocrResult, setOcrResult] = useState<any>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    const ext = "." + f.name.split(".").pop()?.toLowerCase();
    if (!ACCEPTED.includes(ext)) {
      setError(`Unsupported file type. Accepted: ${ACCEPTED.join(", ")}`);
      return;
    }
    if (f.size > 20 * 1024 * 1024) {
      setError("File too large. Maximum size is 20 MB.");
      return;
    }
    setFile(f);
    setError("");
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true); setError("");
    try {
      const res = await uploadDocumentV2(file);
      if (!res.ok) {
        setError(res.data?.error?.message ?? res.data?.message ?? "Upload failed. Please try again.");
        return;
      }
      const docId = res.data?.data?.id ?? res.data?.id;
      setDocumentId(docId);
      setStage("processing");
      // Request OCR
      try {
        await requestOcr(docId);
      } catch { /* OCR may not be configured - continue anyway */ }
      setStage("result");
      setOcrResult(res.data?.data ?? res.data);
    } catch (e: any) {
      setError(e.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fafc]">
      <Topbar title="Invoice / Document Upload" subtitle="Upload invoices for AI-assisted emission data extraction" />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 mb-6 transition-colors">
            <ArrowLeft size={16} /> Back to Activity Data
          </button>

          {/* Steps indicator */}
          <div className="flex items-center gap-3 mb-8">
            {[
              { label: "Upload Invoice", key: "upload" },
              { label: "Processing", key: "processing" },
              { label: "Review & Save", key: "result" },
            ].map((s, i) => {
              const stages: Stage[] = ["upload","processing","result"];
              const currentIdx = stages.indexOf(stage);
              const stepIdx = i;
              const done = currentIdx > stepIdx;
              const active = currentIdx === stepIdx;
              return (
                <div key={s.key} className="flex items-center gap-2">
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${done ? "bg-teal-600 border-teal-600 text-white" : active ? "border-teal-600 text-teal-600 bg-white" : "border-slate-200 text-slate-400 bg-white"}`}>
                    {done ? <CheckCircle size={14} weight="fill" /> : i + 1}
                  </div>
                  <span className={`text-xs font-semibold hidden sm:block ${active ? "text-teal-700" : done ? "text-teal-600" : "text-slate-400"}`}>{s.label}</span>
                  {i < 2 && <div className={`h-0.5 w-8 rounded-full ${done ? "bg-teal-500" : "bg-slate-200"}`} />}
                </div>
              );
            })}
          </div>

          {error && (
            <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <Warning size={18} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* STAGE: Upload */}
          {stage === "upload" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center">
                  <Receipt size={22} className="text-orange-500" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Upload Invoice or Receipt</h2>
                  <p className="text-xs text-slate-500">PDF, JPG, PNG, WEBP - max 20 MB</p>
                </div>
              </div>

              {!file ? (
                <label
                  onDragOver={e => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={onDrop}
                  className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 text-center cursor-pointer transition-all ${dragging ? "border-teal-400 bg-teal-50" : "border-slate-200 bg-slate-50 hover:border-teal-300 hover:bg-teal-50/40"}`}
                >
                  <UploadSimple size={36} className={`mb-3 transition-colors ${dragging ? "text-teal-500" : "text-slate-300"}`} />
                  <p className="text-sm font-semibold text-slate-600">Drag & drop or click to select</p>
                  <p className="text-xs text-slate-400 mt-1">Electricity bills, fuel receipts, utility invoices</p>
                  <input ref={fileRef} type="file" accept={ACCEPTED.join(",")} className="sr-only" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                </label>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex items-center gap-4">
                  {getMimeIcon(file.name)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{file.name}</p>
                    <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = ""; }} className="text-xs font-semibold text-red-500 hover:text-red-700 shrink-0">Remove</button>
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <button onClick={() => router.back()} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
                <button
                  onClick={handleUpload}
                  disabled={!file || uploading}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-5 py-2.5 text-sm font-bold text-white shadow-md disabled:opacity-50 hover:from-teal-500 hover:to-cyan-500 transition-all"
                >
                  <UploadSimple size={15} weight="bold" />
                  {uploading ? "Uploading..." : "Upload & Extract"}
                </button>
              </div>
            </div>
          )}

          {/* STAGE: Processing */}
          {stage === "processing" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 shadow-sm text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 border border-teal-100 mb-5">
                <Sparkle size={32} className="text-teal-600 animate-pulse" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Processing Document</h2>
              <p className="mt-2 text-sm text-slate-500">Running OCR and extracting emission data...</p>
              <div className="mt-6 flex justify-center">
                <div className="h-2 w-48 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full w-2/3 rounded-full bg-teal-500 animate-pulse" />
                </div>
              </div>
            </div>
          )}

          {/* STAGE: Result */}
          {stage === "result" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-green-200 bg-green-50 px-5 py-4 flex items-center gap-3">
                <CheckCircle size={22} className="text-green-600 shrink-0" />
                <div>
                  <p className="font-semibold text-green-800">Document uploaded successfully!</p>
                  <p className="text-sm text-green-700">Document ID: <span className="font-mono text-xs">{documentId}</span></p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Eye size={18} className="text-slate-500" /> Document Details
                </h3>
                <div className="space-y-3 text-sm">
                  {file && (
                    <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                      {getMimeIcon(file.name)}
                      <div>
                        <p className="font-semibold text-slate-800">{file.name}</p>
                        <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="rounded-lg bg-slate-50 p-3">
                      <p className="font-semibold text-slate-500 mb-1">Status</p>
                      <p className="font-bold text-slate-800">{ocrResult?.status ?? "UPLOADED"}</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-3">
                      <p className="font-semibold text-slate-500 mb-1">OCR</p>
                      <p className="font-bold text-slate-800">{ocrResult?.extraction ? "Available" : "Pending"}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h4 className="text-sm font-bold text-slate-800 mb-3">What's next?</h4>
                <div className="space-y-2">
                  <button onClick={() => router.push(`/documents`)} className="w-full flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3 text-sm"><Eye size={16} className="text-slate-400" /><span className="font-semibold text-slate-700">View in Documents</span></div>
                    <ArrowRight size={14} className="text-slate-400" />
                  </button>
                  <button onClick={() => router.push(`/activity-data/add`)} className="w-full flex items-center justify-between rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 hover:bg-teal-100 transition-colors">
                    <div className="flex items-center gap-3 text-sm"><Sparkle size={16} className="text-teal-600" /><span className="font-semibold text-teal-700">Add Activity Entry Manually</span></div>
                    <ArrowRight size={14} className="text-teal-500" />
                  </button>
                  <button onClick={() => { setStage("upload"); setFile(null); setDocumentId(""); setOcrResult(null); }} className="w-full flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3 text-sm"><UploadSimple size={16} className="text-slate-400" /><span className="font-semibold text-slate-700">Upload Another Invoice</span></div>
                    <ArrowRight size={14} className="text-slate-400" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
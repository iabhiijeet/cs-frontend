"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import { FileText, Download, PlusCircle, ArrowsClockwise, MagnifyingGlass } from "@phosphor-icons/react";
import { toast } from "sonner";
import Section from "@/components/dashboard/Section";
import { EASE } from "@/lib/animations";
import {
  getReports,
  generateReport,
  generateReportPdf,
  getReportDownloadUrl,
  ContextError,
} from "@/lib/api";

const STATUS_STYLES: Record<string, string> = {
  GENERATING: "bg-yellow-100 text-yellow-700",
  GENERATED: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-600",
};

export default function ReportsView() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const loadReports = useCallback(async () => {
    try {
      setError(null);
      const res = await getReports();
      if (res.success && Array.isArray(res.data)) {
        setReports(res.data);
      } else {
        setError(res.message || "Failed to load reports");
      }
    } catch (err: any) {
      if (err instanceof ContextError) {
        setError(err.message);
      } else {
        setError(err?.message || "Failed to load reports");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      await generateReport();
      toast.success("Report generation started");
      await loadReports();
    } catch (err: any) {
      if (err instanceof ContextError) {
        toast.error(err.message);
      } else {
        toast.error(err?.message || "Failed to generate report");
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleGeneratePdf = async (id: string) => {
    try {
      setBusyId(id);
      await generateReportPdf(id);
      toast.success("PDF generated");
      await loadReports();
    } catch (err: any) {
      toast.error(err?.message || "PDF generation failed");
    } finally {
      setBusyId(null);
    }
  };

  const handleDownload = async (id: string) => {
    try {
      setBusyId(id);
      // V2 returns the download URL at the TOP LEVEL of the response.
      const url = await getReportDownloadUrl(id);
      window.open(url, "_blank");
    } catch (err: any) {
      if (err instanceof ContextError) {
        toast.error(err.message);
      } else {
        toast.error(err?.message || "Download is not available yet");
      }
    } finally {
      setBusyId(null);
    }
  };

  const filteredReports = reports.filter(r => 
    String(r.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(r.status).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-[16px]">
      <Section
        title="Reports"
        subtitle="Sustainability reports generated from your verified data"
        delay={0.05}
        action={
          <div className="flex items-center gap-[8px]">
            <button
              onClick={loadReports}
              className="flex items-center gap-[4px] rounded-[6px] border border-black/[0.08] bg-white px-[10px] py-[6px] text-[12px] font-medium text-[#52525b] hover:bg-black/[0.03]"
            >
              <ArrowsClockwise size={13} /> Refresh
            </button>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center gap-[6px] rounded-[6px] bg-[#16a34a] px-[12px] py-[6px] text-[12px] font-semibold text-white hover:bg-[#15803d] disabled:opacity-50"
            >
              <PlusCircle size={14} weight="bold" />
              {generating ? "Generating…" : "Generate report"}
            </button>
          </div>
        }
      >
        <div className="mb-[16px] relative w-full sm:max-w-[320px]">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-[10px] text-slate-400">
            <MagnifyingGlass size={14} weight="bold" />
          </div>
          <input 
            type="text" 
            placeholder="Search reports by ID or status..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-[8px] border border-slate-200 py-[8px] pl-[32px] pr-[12px] text-[13px] outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-[40px] text-[13px] text-[#71717a]">
            Loading reports…
          </div>
        ) : error ? (
          <div className="rounded-[10px] border border-orange-200 bg-orange-50 px-[16px] py-[20px] text-[13px] text-orange-800">
            {error}
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-[8px] py-[48px] text-center">
            <span className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-black/[0.04] text-[#a1a1aa]">
              <FileText size={22} />
            </span>
            <h3 className="text-[14px] font-semibold text-black">No reports found</h3>
            <p className="text-[13px] text-[#71717a]">
              {reports.length === 0 ? "Generate a report to produce a sustainability summary." : "Try adjusting your search."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-[8px]">
            {filteredReports.map((report, i) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: EASE, delay: 0.05 * i }}
                className="flex flex-wrap items-center justify-between gap-[12px] rounded-[10px] border border-black/[0.06] bg-white px-[16px] py-[12px]"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-[8px]">
                    <span className="truncate text-[13px] font-semibold text-black">
                      Report {String(report.id).slice(0, 8)}
                    </span>
                    <span
                      className={`rounded-full px-[8px] py-[2px] text-[10.5px] font-semibold ${
                        STATUS_STYLES[report.status] || "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {report.status}
                    </span>
                  </div>
                  <p className="mt-[2px] text-[11.5px] text-[#71717a]">
                    {report.createdAt ? new Date(report.createdAt).toLocaleString() : ""}
                  </p>
                </div>
                <div className="flex items-center gap-[8px]">
                  {report.status === "GENERATING" && (
                    <button
                      onClick={() => handleGeneratePdf(report.id)}
                      disabled={busyId === report.id}
                      className="rounded-[6px] border border-black/[0.08] bg-white px-[10px] py-[6px] text-[12px] font-medium text-[#52525b] hover:bg-black/[0.03] disabled:opacity-50"
                    >
                      {busyId === report.id ? "Working…" : "Finalize PDF"}
                    </button>
                  )}
                  {report.status === "GENERATED" && (
                    <button
                      onClick={() => handleDownload(report.id)}
                      disabled={busyId === report.id}
                      className="flex items-center gap-[4px] rounded-[6px] bg-[#16a34a] px-[10px] py-[6px] text-[12px] font-semibold text-white hover:bg-[#15803d] disabled:opacity-50"
                    >
                      <Download size={13} weight="bold" /> Download
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

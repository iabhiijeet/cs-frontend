"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { EASE } from "@/lib/animations";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import { getDocuments, uploadDocument, ocrDocument } from "@/lib/api";
import { UploadSimple, FileText, CheckCircle, WarningCircle, MagicWand, Plus, FilePdf, Funnel, MagnifyingGlass } from "@phosphor-icons/react";
import { toast } from "sonner";
import DocumentUploadModal from "./DocumentUploadModal";
import OCRReviewModal from "./OCRReviewModal";

export default function DocumentsPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [ocrModalData, setOcrModalData] = useState<any>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getDocuments();
      if (response.success && response.data) {
        setData(response.data);
      } else {
        toast.error("Failed to fetch documents");
      }
    } catch (err: any) {
      toast.error(err.message || "Error loading documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleProcessOCR = async (id: string) => {
    try {
      toast.info("Extracting data via OCR...");
      const res = await ocrDocument(id);
      if (res.success) {
        toast.success("OCR extraction complete");
        fetchData();
      } else {
        toast.error(res.message || "OCR failed");
      }
    } catch (err: any) {
      toast.error(err.message || "OCR failed");
    }
  };

  const openOCRReview = (doc: any) => {
    setOcrModalData(doc);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "UPLOADED":
        return <span className="rounded bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600">Uploaded</span>;
      case "PROCESSED":
        return <span className="rounded bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-600">Parsed via OCR</span>;
      case "ACTIVITY_CREATED":
        return <span className="rounded bg-green-100 px-2 py-1 text-xs font-semibold text-green-600">Activity Created</span>;
      case "FAILED":
        return <span className="rounded bg-red-100 px-2 py-1 text-xs font-semibold text-red-600">Failed</span>;
      default:
        return <span className="rounded bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600">{status}</span>;
    }
  };

  const filteredData = data.filter((item) => {
    const matchesSearch = (item.fileName || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "ALL" || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const processedCount = data.filter((d) => d.status === "PROCESSED" || d.status === "ACTIVITY_CREATED").length;
  const failedCount = data.filter((d) => d.status === "FAILED").length;
  const uploadedCount = data.length;

  return (
    <ProtectedRoute>
      <div className="flex min-h-dvh bg-[#fafafa]">
        <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} active={"documents"} onChange={() => {}} />

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar 
            onMenu={() => setMenuOpen(true)} 
            title="Document Hub" 
            subtitle="Upload invoices and automatically extract data via AI-powered OCR" 
          />

          <main className="flex-1 px-[20px] py-[24px] md:px-[32px]">
            <div className="mx-auto flex max-w-[1240px] flex-col gap-[16px]">
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-[16px] mb-[4px]">
                <div>
                  <h1 className="text-[22px] font-bold tracking-tight text-slate-900 mt-[2px]">Document Hub</h1>
                  <p className="text-[13px] text-slate-500 mt-[2px]">
                    Upload invoices and automatically extract data via AI-powered OCR.
                  </p>
                </div>
                <button 
                  onClick={() => setIsUploadModalOpen(true)}
                  className="flex items-center gap-[6px] rounded-[10px] bg-[#16a34a] px-[14px] py-[9px] text-[13px] font-bold text-white shadow-sm transition-all hover:bg-[#15803d]"
                >
                  <UploadSimple size={14} weight="bold" />
                  Upload Document
                </button>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="rounded-[12px] border border-black/[0.08] bg-white overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
              >
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-[12px] p-[16px] border-b border-slate-200/70 bg-slate-50/40">
                  <div className="relative w-full sm:max-w-[280px]">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-[10px] text-slate-400">
                      <MagnifyingGlass size={14} weight="bold" />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Search document name..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full rounded-[8px] border border-slate-200 py-[8.5px] pl-[32px] pr-[12px] text-[13px] outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="relative w-full sm:max-w-[180px]">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-[10px] text-slate-400">
                      <Funnel size={14} weight="bold" />
                    </div>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full appearance-none rounded-[8px] border border-slate-200 bg-white py-[8.5px] pl-[32px] pr-[12px] text-[13px] outline-none focus:border-indigo-500"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="UPLOADED">Uploaded</option>
                      <option value="PROCESSED">Processed</option>
                      <option value="ACTIVITY_CREATED">Activity Created</option>
                      <option value="FAILED">Failed</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px] border-collapse">
                    <thead>
                      <tr className="border-b border-black/[0.06] bg-[#fafafa] text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-[#71717a]">
                        <th className="px-[16px] py-[12px]">Document</th>
                        <th className="px-[16px] py-[12px]">Type</th>
                        <th className="px-[16px] py-[12px]">Date Uploaded</th>
                        <th className="px-[16px] py-[12px]">Status</th>
                        <th className="px-[16px] py-[12px] text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={5} className="px-[16px] py-[32px] text-center text-[13px] text-[#71717a]">
                            Loading documents...
                          </td>
                        </tr>
                      ) : filteredData.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-[16px] py-[32px] text-center text-[13px] text-[#71717a]">
                            No documents found matching the criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredData.map((doc) => (
                          <tr key={doc.id} className="border-b border-black/[0.04] last:border-none hover:bg-black/[0.01] transition-colors">
                            <td className="px-[16px] py-[14px]">
                              <div className="flex items-center gap-[12px]">
                                <div className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-[6px] bg-[#f4f4f5] text-[#71717a]">
                                  {doc.fileUrl?.endsWith(".pdf") ? <FilePdf size={20} /> : <FileText size={20} />}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-[13px] font-medium text-black truncate max-w-[250px]">{doc.fileName}</p>
                                  <p className="text-[11px] text-[#a1a1aa]">{(doc.fileSize / 1024).toFixed(0)} KB</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-[16px] py-[14px] text-[13px] text-[#52525b]">
                              {doc.documentType?.replace(/_/g, " ") ?? doc.category?.replace(/_/g, " ") ?? "—"}
                            </td>
                            <td className="px-[16px] py-[14px] text-[13px] text-[#71717a]">
                              {new Date(doc.createdAt).toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' })}
                            </td>
                            <td className="px-[16px] py-[14px]">
                              {getStatusBadge(doc.status)}
                            </td>
                            <td className="px-[16px] py-[14px] text-right">
                              <div className="flex items-center justify-end gap-[8px]">
                                {doc.status === "UPLOADED" || doc.status === "FAILED" ? (
                                  <button 
                                    onClick={() => handleProcessOCR(doc.id)}
                                    className="flex items-center gap-[4px] rounded-[6px] bg-[#f4f4f5] px-[8px] py-[4px] text-[12px] font-medium text-[#52525b] hover:bg-black/5"
                                  >
                                    <MagicWand size={14} /> Run OCR
                                  </button>
                                ) : doc.status === "PROCESSED" ? (
                                  <button 
                                    onClick={() => openOCRReview(doc)}
                                    className="flex items-center gap-[4px] rounded-[6px] bg-blue-50 px-[8px] py-[4px] text-[12px] font-medium text-blue-600 hover:bg-blue-100"
                                  >
                                    <Plus size={14} /> Review & Create
                                  </button>
                                ) : (
                                  <button className="text-[12px] font-medium text-[#a1a1aa]" disabled>
                                    Completed
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>

            </div>
          </main>
        </div>

        {/* Upload Modal */}
        <AnimatePresence>
          {isUploadModalOpen && (
            <DocumentUploadModal 
              onClose={() => setIsUploadModalOpen(false)} 
              onSuccess={() => {
                setIsUploadModalOpen(false);
                fetchData();
              }}
            />
          )}
        </AnimatePresence>

        {/* OCR Review & Create Activity Modal */}
        <AnimatePresence>
          {ocrModalData && (
            <OCRReviewModal 
              document={ocrModalData}
              onClose={() => setOcrModalData(null)}
              onSuccess={() => {
                setOcrModalData(null);
                fetchData();
              }}
            />
          )}
        </AnimatePresence>

      </div>
    </ProtectedRoute>
  );
}

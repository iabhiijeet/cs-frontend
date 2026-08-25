"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { X, FileArrowUp, DownloadSimple, CheckCircle, WarningCircle, Table } from "@phosphor-icons/react";
import { EASE } from "@/lib/animations";
import { createActivityData } from "@/lib/api";
import { usePhysicalStructure } from "@/hooks/usePhysicalStructure";
import { toast } from "sonner";

interface ImportActivityModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function ImportActivityModal({ onClose, onSuccess }: ImportActivityModalProps) {
  const { hierarchy } = usePhysicalStructure();
  const [file, setFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Generate and download a dynamic sample template pre-filled with the user's campus and buildings
  const downloadTemplate = () => {
    const campus = hierarchy?.campuses?.[0]?.name || "Main Campus";
    const building = hierarchy?.campuses?.[0]?.buildings?.[0]?.name || "Academic Block";
    const floor = hierarchy?.campuses?.[0]?.buildings?.[0]?.floors?.[0]?.name || "Ground Floor";

    const csvContent = [
      "Campus,Building,Floor,Category,Quantity,Unit,ActivityDate,Description",
      `"${campus}","${building}","${floor}","PURCHASED_ELECTRICITY",25000,"kWh","2025-04-30","April 2025 electricity consumption"`,
      `"${campus}","${building}","Building Total","DIESEL",200,"L","2025-04-28","Backup generator fuel consumption"`,
      `"${campus}","Campus Total","","LPG",50,"kg","2025-04-25","Cafeteria LPG refill"`,
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `CarbonSynq_Activity_Template_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV Template downloaded!");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;

    setFile(uploaded);

    // Parse simple CSV for preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split("\n").filter((l) => l.trim().length > 0);
      if (lines.length <= 1) {
        toast.error("CSV file is empty or missing data rows");
        return;
      }

      const headers = lines[0].split(",").map((h) => h.replace(/"/g, "").trim());
      const parsed: any[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.replace(/"/g, "").trim());
        if (values.length >= 5) {
          parsed.push({
            campus: values[0] || "Main Campus",
            building: values[1] || "",
            floor: values[2] || "",
            category: values[3] || "PURCHASED_ELECTRICITY",
            quantity: parseFloat(values[4]) || 0,
            unit: values[5] || "kWh",
            activityDate: values[6] || new Date().toISOString().slice(0, 10),
            description: values[7] || "",
          });
        }
      }

      setPreviewRows(parsed);
    };
    reader.readAsText(uploaded);
  };

  const handleImport = async () => {
    if (previewRows.length === 0) {
      toast.error("No valid activity records to import");
      return;
    }

    setLoading(true);
    let successCount = 0;

    try {
      for (const row of previewRows) {
        const isPurchased = row.category.includes("PURCHASED_");
        const payload = {
          ...row,
          scope: isPurchased ? "SCOPE_2" : "SCOPE_1",
          activityDate: new Date(row.activityDate).toISOString(),
          locationPath: [row.campus || "Main Campus", row.building || "Campus Total", row.floor || "Building Total"].join(" / "),
        };

        const res = await createActivityData(payload);
        if (res.success) successCount++;
      }

      toast.success(`Successfully imported ${successCount} activity records!`);
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Failed to import some rows");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-[16px]">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.96 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[20px] border border-white/80 bg-white/95 backdrop-blur-2xl p-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.15)]"
      >
        {/* Header */}
        <div className="mb-[20px] flex items-center justify-between border-b border-slate-100 pb-[16px]">
          <div className="flex items-center gap-[10px]">
            <div className="flex h-[36px] w-[36px] items-center justify-center rounded-[10px] bg-teal-50 text-teal-600">
              <FileArrowUp size={20} weight="fill" />
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-slate-900">Import Activity Data (CSV/Excel)</h2>
              <p className="text-[12px] text-slate-500">Bulk upload energy and fuel records for your structure</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full p-[6px] text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
            <X size={18} weight="bold" />
          </button>
        </div>

        <div className="flex flex-col gap-[18px]">
          {/* Download sample template banner */}
          <div className="flex items-center justify-between rounded-[14px] border border-indigo-100 bg-indigo-50/60 p-[14px]">
            <div>
              <p className="text-[13px] font-bold text-indigo-950">Download pre-structured CSV template</p>
              <p className="text-[11.5px] text-indigo-700">Pre-populated with your campus and building structure.</p>
            </div>
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-[6px] rounded-[8px] bg-indigo-600 px-[12px] py-[6px] text-[12px] font-bold text-white shadow-sm hover:bg-indigo-700 transition-colors"
            >
              <DownloadSimple size={14} weight="bold" />
              <span>Download CSV</span>
            </button>
          </div>

          {/* Upload Dropzone */}
          <label className="flex flex-col items-center justify-center rounded-[16px] border-2 border-dashed border-slate-200 bg-slate-50/50 p-[28px] text-center hover:bg-slate-50 transition-colors cursor-pointer">
            <FileArrowUp size={36} className="text-slate-400 mb-[8px]" />
            <span className="text-[13.5px] font-bold text-slate-800">
              {file ? file.name : "Click to select or drop your CSV file"}
            </span>
            <span className="text-[11.5px] text-slate-400 mt-[2px]">Supports .csv and UTF-8 encoded text files</span>
            <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
          </label>

          {/* Preview rows */}
          {previewRows.length > 0 && (
            <div className="rounded-[14px] border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between bg-slate-50 px-[14px] py-[8px] border-b border-slate-200">
                <span className="text-[12px] font-bold text-slate-700 flex items-center gap-[4px]">
                  <Table size={14} />
                  <span>Preview ({previewRows.length} records detected)</span>
                </span>
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-[3px]">
                  <CheckCircle size={13} weight="fill" />
                  <span>Ready to import</span>
                </span>
              </div>
              <div className="max-h-[180px] overflow-y-auto">
                <table className="w-full text-left text-[11.5px]">
                  <thead className="bg-slate-100/70 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-[8px]">Location</th>
                      <th className="p-[8px]">Category</th>
                      <th className="p-[8px]">Quantity</th>
                      <th className="p-[8px]">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewRows.map((r, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-[8px] font-medium text-slate-800">
                          {[r.campus, r.building, r.floor].filter(Boolean).join(" / ")}
                        </td>
                        <td className="p-[8px] text-slate-600">{r.category}</td>
                        <td className="p-[8px] font-semibold text-slate-900">
                          {r.quantity} {r.unit}
                        </td>
                        <td className="p-[8px] text-slate-500">{r.activityDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-[10px] border-t border-slate-100 pt-[14px]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-[10px] border border-slate-200 px-[16px] py-[8px] text-[12.5px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={loading || previewRows.length === 0}
              onClick={handleImport}
              className="rounded-[10px] bg-indigo-600 px-[18px] py-[8px] text-[12.5px] font-bold text-white shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Importing..." : `Import ${previewRows.length} Activities`}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

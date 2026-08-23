"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import AdminNav from "@/components/admin/AdminNav";
import { Plus, Buildings, X } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { getCampuses, getBuildings, createCampus, createBuilding } from "@/lib/api";

export default function AdminCampusesPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [campuses, setCampuses] = useState<any[]>([]);
  const [buildings, setBuildings] = useState<any[]>([]);

  const [addTarget, setAddTarget] = useState<"campus" | any | null>(null);
  const [form, setForm] = useState({ name: "", code: "" });
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [campRes, buildRes] = await Promise.all([getCampuses(), getBuildings()]);
      if (campRes.success) setCampuses(campRes.data || []);
      if (buildRes.success) setBuildings(buildRes.data || []);
      if (!campRes.success) setError(campRes.message || "Failed to load campuses");
    } catch (err: any) {
      setError(err?.message || "Failed to load campus hierarchy");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openModal = (target: "campus" | any) => {
    setForm({ name: "", code: "" });
    setAddTarget(target);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSubmitting(true);
    try {
      if (addTarget === "campus") {
        const res = await createCampus({ name: form.name.trim(), ...(form.code ? { code: form.code.trim() } : {}) });
        if (res.success) {
          toast.success("Campus created");
          setAddTarget(null);
          await loadData();
        } else {
          toast.error(res.message || "Failed to create campus");
        }
      } else {
        const res = await createBuilding({
          campusId: addTarget.id,
          name: form.name.trim(),
          ...(form.code ? { code: form.code.trim() } : {}),
        });
        if (res.success) {
          toast.success("Building created");
          setAddTarget(null);
          await loadData();
        } else {
          toast.error(res.message || "Failed to create building");
        }
      }
    } catch (err: any) {
      toast.error(err?.message || "Action failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-dvh bg-[#fafafa]">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} active={"settings" as any} onChange={() => {}} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenu={() => setMenuOpen(true)} title="Admin Settings" subtitle="Manage your university's configuration" />

        <main className="flex-1 px-[20px] py-[24px] md:px-[32px]">
          <div className="mx-auto flex max-w-[1240px] flex-col md:flex-row gap-[32px]">

            <aside className="w-full md:w-[240px] shrink-0">
              <AdminNav active="campuses" />
            </aside>

            <div className="flex-1 flex flex-col gap-[24px]">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[18px] font-semibold text-black">Campuses & Buildings</h2>
                  <p className="text-[13px] text-[#71717a] mt-[4px]">Manage physical infrastructure boundaries</p>
                </div>
                <button
                  onClick={() => openModal("campus")}
                  className="flex h-[34px] items-center gap-[6px] rounded-[8px] bg-black px-[16px] text-[13px] font-semibold text-white hover:bg-black/80 transition-colors"
                >
                  <Plus size={14} weight="bold" /> Add Campus
                </button>
              </div>

              {loading ? (
                <div className="rounded-[12px] border border-black/[0.08] bg-white py-[48px] text-center text-[13px] text-[#71717a]">
                  Loading campus hierarchy…
                </div>
              ) : error ? (
                <div className="rounded-[12px] border border-orange-200 bg-orange-50 px-[16px] py-[20px] text-[13px] text-orange-800">
                  {error}
                </div>
              ) : campuses.length === 0 ? (
                <div className="rounded-[12px] border border-dashed border-black/[0.1] bg-white py-[48px] text-center">
                  <h3 className="text-[14px] font-semibold text-black">No campuses found</h3>
                  <p className="mt-[4px] text-[13px] text-[#71717a]">Add a campus to start your infrastructure hierarchy.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-[16px]">
                  {campuses.map((campus) => {
                    const campusBuildings = buildings.filter((b) => b.campusId === campus.id || b.parentEntityId === campus.id);
                    return (
                      <div key={campus.id} className="rounded-[12px] border border-black/[0.08] bg-white overflow-hidden shadow-sm">
                        <div className="flex items-center justify-between bg-[#fafafa] p-[16px] border-b border-black/[0.06]">
                          <div className="flex items-center gap-[12px]">
                            <div className="flex h-[32px] w-[32px] items-center justify-center rounded-[8px] bg-indigo-100 text-indigo-700">
                              <Buildings size={18} weight="fill" />
                            </div>
                            <div>
                              <h3 className="text-[14px] font-semibold text-black">{campus.name}</h3>
                              <p className="text-[12px] text-[#71717a]">
                                {[campus.city, campus.country].filter(Boolean).join(", ") || campus.code || ""}
                                {` • ${campusBuildings.length} Building${campusBuildings.length === 1 ? "" : "s"}`}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => openModal(campus)}
                            className="h-[28px] px-[10px] rounded-[6px] border border-black/[0.1] text-[12px] font-medium text-[#52525b] hover:bg-black/[0.04]"
                          >
                            Add Building
                          </button>
                        </div>

                        <div className="p-[16px]">
                          {campusBuildings.length === 0 ? (
                            <p className="py-[8px] text-[12px] text-[#71717a]">No buildings in this campus yet.</p>
                          ) : (
                            <div className="flex flex-col gap-[8px]">
                              {campusBuildings.map((b) => (
                                <div
                                  key={b.id}
                                  className="flex items-center justify-between p-[12px] rounded-[8px] border border-black/[0.04] bg-[#fafafa] hover:border-black/[0.1]"
                                >
                                  <div>
                                    <p className="text-[13px] font-medium text-black">{b.name}</p>
                                    {b.code && <p className="text-[11px] text-[#71717a]">{b.code}</p>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          </div>
        </main>
      </div>

      {/* Add Campus / Building modal */}
      <AnimatePresence>
        {addTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-[16px]"
            onClick={() => setAddTarget(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[420px] rounded-[12px] border border-black/[0.08] bg-white p-[24px]"
            >
              <div className="mb-[16px] flex items-center justify-between">
                <h3 className="text-[15px] font-semibold text-black">
                  {addTarget === "campus" ? "Add Campus" : `Add Building — ${addTarget.name}`}
                </h3>
                <button onClick={() => setAddTarget(null)} className="text-[#a1a1aa] hover:text-black">
                  <X size={16} />
                </button>
              </div>
              <form onSubmit={handleCreate} className="flex flex-col gap-[14px]">
                <div className="flex flex-col gap-[6px]">
                  <label className="text-[12px] font-medium text-[#52525b]">Name *</label>
                  <input
                    required
                    autoFocus
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="h-[36px] w-full rounded-[8px] border border-black/[0.1] px-[12px] text-[13px] outline-none focus:border-black"
                  />
                </div>
                <div className="flex flex-col gap-[6px]">
                  <label className="text-[12px] font-medium text-[#52525b]">Code (optional)</label>
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    className="h-[36px] w-full rounded-[8px] border border-black/[0.1] px-[12px] text-[13px] outline-none focus:border-black"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-[4px] h-[36px] rounded-[8px] bg-[#16a34a] text-[13px] font-semibold text-white hover:bg-[#15803d] disabled:opacity-50"
                >
                  {submitting ? "Creating…" : "Create"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

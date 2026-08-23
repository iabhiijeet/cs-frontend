"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import AdminNav from "@/components/admin/AdminNav";
import { useAuth } from "@/context/AuthContext";
import { getUniversity, updateUniversity } from "@/lib/api";
import { toast } from "sonner";

export default function AdminUniversityPage() {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", code: "", country: "" });

  const loadUniversity = async () => {
    const uId = user?.universityId;
    if (!uId) return;
    setLoading(true);
    try {
      const res = await getUniversity(uId);
      if (res.success && res.data) {
        setForm({
          name: res.data.name || "",
          code: res.data.code || "",
          country: res.data.country || "",
        });
      } else {
        toast.error(res.message || "Failed to load university profile");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to load university profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUniversity();
     
  }, [user?.universityId]);

  const handleSave = async () => {
    const uId = user?.universityId;
    if (!uId) return;
    setSaving(true);
    try {
      const payload: Record<string, string> = {};
      if (form.name) payload.name = form.name;
      if (form.country) payload.country = form.country;
      const res = await updateUniversity(uId, payload);
      if (res.success) {
        toast.success(res.message || "University updated successfully");
        await loadUniversity();
      } else {
        toast.error(res.message || "Failed to update university");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to update university");
    } finally {
      setSaving(false);
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
              <AdminNav active="university" />
            </aside>

            <div className="flex-1 flex flex-col gap-[24px]">
              <div>
                <h2 className="text-[18px] font-semibold text-black">University Profile</h2>
                <p className="text-[13px] text-[#71717a] mt-[4px]">Basic details about your organization</p>
              </div>

              <div className="rounded-[12px] border border-black/[0.08] bg-white p-[24px] shadow-sm">
                {loading ? (
                  <div className="py-[32px] text-center text-[13px] text-[#71717a]">Loading university profile…</div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSave();
                    }}
                    className="flex flex-col gap-[20px]"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
                      <div className="flex flex-col gap-[6px]">
                        <label className="text-[12px] font-medium text-black">University Name</label>
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className="h-[38px] w-full rounded-[8px] border border-black/[0.1] px-[12px] text-[13px] outline-none focus:border-black"
                        />
                      </div>
                      <div className="flex flex-col gap-[6px]">
                        <label className="text-[12px] font-medium text-black">University Code</label>
                        <input
                          type="text"
                          value={form.code}
                          disabled
                          className="h-[38px] w-full rounded-[8px] border border-black/[0.1] bg-black/[0.03] px-[12px] text-[13px]"
                        />
                      </div>
                      <div className="flex flex-col gap-[6px]">
                        <label className="text-[12px] font-medium text-black">Country</label>
                        <input
                          type="text"
                          value={form.country}
                          onChange={(e) => setForm({ ...form, country: e.target.value })}
                          className="h-[38px] w-full rounded-[8px] border border-black/[0.1] px-[12px] text-[13px] outline-none focus:border-black"
                        />
                      </div>
                    </div>

                    <div className="pt-[16px] border-t border-black/[0.06] flex justify-end">
                      <button
                        type="submit"
                        disabled={saving}
                        className="h-[36px] rounded-[8px] bg-[#16a34a] px-[20px] text-[13px] font-semibold text-white hover:bg-[#15803d] disabled:opacity-50"
                      >
                        {saving ? "Saving…" : "Save Changes"}
                      </button>
                    </div>
                  </form>
                )}
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

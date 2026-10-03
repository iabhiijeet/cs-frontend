"use client";
import { motion, AnimatePresence } from "motion/react";
import { EASE } from "@/lib/animations";
import { useAuth } from "@/context/AuthContext";
import { EnvelopeSimple, Plus, Trash, CheckCircle, X, MagnifyingGlass, Eye, EyeSlash, Shield, UserCircle } from "@phosphor-icons/react";
import Topbar from "@/components/dashboard/Topbar";
import { useEffect, useState } from "react";
import { getUsers, createUser, deactivateUser } from "@/lib/api";

const ROLES = [
  { value: "ADMIN", label: "Admin" },
  { value: "REVIEWER", label: "Reviewer" },
  { value: "ENTRY", label: "Data Entry" },
  { value: "LEADERSHIP", label: "Leadership" },
];

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-purple-50 text-purple-700 border-purple-100",
  REVIEWER: "bg-blue-50 text-blue-700 border-blue-100",
  ENTRY: "bg-slate-50 text-slate-700 border-slate-200",
  LEADERSHIP: "bg-amber-50 text-amber-700 border-amber-100",
};

export default function TeamPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "ENTRY" });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await getUsers();
      const rows = res?.data?.items ?? res?.data ?? [];
      setUsers(Array.isArray(rows) ? rows : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true); setError("");
    try {
      const res = await createUser({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role,
      });
      if (res.ok !== false) {
        setSuccessMsg(`User "${formData.name}" created successfully!`);
        setIsModalOpen(false);
        setFormData({ name: "", email: "", password: "", role: "ENTRY" });
        loadUsers();
        setTimeout(() => setSuccessMsg(""), 5000);
      } else {
        setError(res.data?.error?.message ?? "Failed to create user.");
      }
    } catch (e: any) {
      setError(e.message || "An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (id: string, name: string) => {
    if (!confirm(`Deactivate "${name}"? They will no longer be able to sign in.`)) return;
    try {
      await deactivateUser(id);
      loadUsers();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const filteredUsers = users.filter(u => {
    const q = search.toLowerCase();
    const matchesSearch = (u.name ?? "").toLowerCase().includes(q) || (u.email ?? "").toLowerCase().includes(q);
    const matchesRole = filterRole === "ALL" || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const isAdmin = user?.role === "ADMIN";

  return (
    <div className="flex flex-col h-full bg-[#f8fafc]">
      <Topbar title="Team" subtitle="Manage university staff access and roles" />

      <main className="flex-1 overflow-y-auto p-6">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: EASE }}>

          {successMsg && (
            <div className="mb-4 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
              <CheckCircle size={18} className="text-green-600 shrink-0" />
              <p className="text-sm font-semibold text-green-800">{successMsg}</p>
            </div>
          )}

          {/* Header actions */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative flex-1 max-w-xs">
              <MagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or email..." className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="ALL">All Roles</option>
              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
            {isAdmin && (
              <button onClick={() => { setError(""); setIsModalOpen(true); }} className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 transition-colors ml-auto">
                <Plus size={16} /> Add User
              </button>
            )}
          </div>

          {/* Users table */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" /></div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-20 text-center">
                <UserCircle size={40} className="mx-auto mb-3 text-slate-300" />
                <p className="text-sm font-semibold text-slate-600">{search ? "No users match your search" : "No team members yet"}</p>
                {!search && isAdmin && <p className="text-xs text-slate-400 mt-1">Click "Add User" to create the first team member</p>}
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b border-slate-100 bg-slate-50">
                  <tr>
                    {["Name & Email", "Role", "Status", "Joined", isAdmin ? "Action" : ""].map(h => (
                      <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u: any) => (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xs shrink-0">
                            {(u.name ?? u.email ?? "?")[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{u.name ?? "-"}</p>
                            <p className="text-xs text-slate-400 flex items-center gap-1"><EnvelopeSimple size={10} />{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${ROLE_COLORS[u.role] ?? "bg-slate-50 text-slate-600 border-slate-200"}`}>
                          <Shield size={10} />{u.role?.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {u.active !== false ? (
                          <span className="flex w-fit items-center gap-1 rounded-full bg-green-50 border border-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                            <CheckCircle size={10} weight="fill" /> Active
                          </span>
                        ) : (
                          <span className="flex w-fit items-center gap-1 rounded-full bg-slate-50 border border-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-slate-400 text-xs">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : "-"}
                      </td>
                      {isAdmin && (
                        <td className="px-5 py-4">
                          {u.id !== user?.id && u.active !== false && (
                            <button onClick={() => handleDeactivate(u.id, u.name)} className="text-slate-400 hover:text-red-600 transition-colors" title="Deactivate user">
                              <Trash size={15} weight="bold" />
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <p className="mt-4 text-xs text-slate-400 text-center">{filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""} shown</p>
        </motion.div>
      </main>

      {/* Add User Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={() => setIsModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} transition={{ duration: 0.2, ease: EASE }} className="relative w-full max-w-[440px] rounded-2xl bg-white shadow-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-slate-900">Add Team Member</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-800"><X size={20} /></button>
              </div>

              {error && <div className="mb-4 rounded-xl bg-red-50 border border-red-100 p-3 text-sm text-red-600">{error}</div>}

              <form onSubmit={handleCreate} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Full Name *</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Jane Smith" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email Address *</label>
                  <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="jane@university.edu" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Temporary Password *</label>
                  <div className="relative">
                    <input required type={showPassword ? "text" : "password"} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="Min. 8 characters" className="w-full rounded-xl border border-slate-200 bg-white px-3 pr-10 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPassword ? <EyeSlash size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">User should change this after first login.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Role *</label>
                  <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500">
                    {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                  <div className="mt-2 text-xs text-slate-400 space-y-0.5">
                    <p><span className="font-semibold">Admin</span> — full system access</p>
                    <p><span className="font-semibold">Reviewer</span> — can approve/reject submissions</p>
                    <p><span className="font-semibold">Data Entry</span> — can submit data</p>
                    <p><span className="font-semibold">Leadership</span> — read-only reports</p>
                  </div>
                </div>

                <div className="flex gap-3 justify-end mt-2">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                  <button type="submit" disabled={submitting || !formData.name || !formData.email || !formData.password} className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50 transition-colors">
                    <Plus size={14} />{submitting ? "Creating..." : "Create User"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
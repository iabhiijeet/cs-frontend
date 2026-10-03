"use client";
import { useEffect, useState } from "react";
import { CheckSquare, Warning } from "@phosphor-icons/react";
import PageShell, { EmptyState, StatusBadge } from "@/components/dashboard/PageShell";
import { getTasks, waiveTask } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function TasksPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try { const res = await getTasks(); setItems(res?.data?.items ?? res?.data ?? []); }
    catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleWaive = async (id: string) => {
    const reason = prompt("Reason for waiving this task?");
    if (!reason) return;
    try { await waiveTask(id, { reason }); load(); } catch (e: any) { alert(e.message); }
  };

  return (
    <PageShell title="KPI Collection Tasks" subtitle="Assigned data collection tasks for KPI reporting" icon={<CheckSquare size={28} />}>
      {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
      {loading ? <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" /></div>
      : items.length === 0 ? <EmptyState title="No tasks assigned" desc="KPI collection tasks will appear here when assigned." icon={<CheckSquare size={40} />} />
      : (
        <div className="space-y-3">
          {items.map((task: any) => (
            <div key={task.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1"><StatusBadge status={task.status} /><span className="text-xs text-slate-400">{task.period_name ?? ""}</span></div>
                  <h3 className="font-semibold text-slate-800 text-sm">{task.kpi_name ?? task.kpi_id}</h3>
                  {task.assignee_name && <p className="text-xs text-slate-400 mt-1">Assigned to: {task.assignee_name}</p>}
                </div>
                {task.status === "PENDING" && user?.role === "ADMIN" && (
                  <button onClick={() => handleWaive(task.id)} className="shrink-0 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1">
                    <Warning size={12} /> Waive
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
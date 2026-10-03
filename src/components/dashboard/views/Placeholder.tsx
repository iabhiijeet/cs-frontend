"use client";

import { motion } from "motion/react";
import {
  CheckCircle, Warning, XCircle, Info,
  TrendDown, Lightning, Leaf, Factory, Car, Airplane, Lightbulb,
  DownloadSimple, MagnifyingGlass, Funnel, Plus, ArrowUp, ArrowDown,
} from "@phosphor-icons/react";
import { EASE } from "@/lib/animations";
import type { TabId } from "@/components/dashboard/Sidebar";
import React from "react";

function MiniBarChart({ data, color = "#0f766e" }: { data: number[]; color?: string }) {
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-[3px] h-[48px]">
      {data.map((v, i) => (
        <motion.div key={i}
          initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
          transition={{ duration: 0.5, delay: i * 0.05, ease: EASE }}
          style={{ height: `${(v / max) * 100}%`, backgroundColor: color }}
          className="flex-1 rounded-t-[2px] origin-bottom"
        />
      ))}
    </div>
  );
}

function RingChart({ pct, color, size = 80 }: { pct: number; color: string; size?: number }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={10} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={10}
        strokeLinecap="round" strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - (pct / 100) * circ }}
        transition={{ duration: 1.2, ease: EASE }}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x={size / 2} y={size / 2 + 5} textAnchor="middle" fontSize="13" fontWeight="700" fill="#0f172a" fontFamily="inherit">{pct}%</text>
    </svg>
  );
}

function StatCard({ label, value, sub, trend }: { label: string; value: string; sub?: string; trend?: number }) {
  return (
    <div className="rounded-[14px] border border-slate-200/70 bg-white p-[16px] shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-[6px] text-[22px] font-bold tabular-nums text-slate-900">{value}</p>
      {sub && <p className="text-[12px] text-slate-400 mt-[2px]">{sub}</p>}
      {trend !== undefined && (
        <div className={`mt-[6px] flex items-center gap-[4px] text-[11px] font-semibold ${trend >= 0 ? "text-emerald-600" : "text-red-500"}`}>
          {trend >= 0 ? <ArrowDown size={12} weight="bold" /> : <ArrowUp size={12} weight="bold" />}
          {Math.abs(trend)}% vs last period
        </div>
      )}
    </div>
  );
}

function Badge({ label, color }: { label: string; color: "green" | "yellow" | "red" | "blue" | "purple" }) {
  const cls: Record<string, string> = {
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    yellow: "bg-amber-50 text-amber-700 border-amber-200",
    red: "bg-red-50 text-red-600 border-red-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
  };
  return <span className={`inline-flex items-center rounded-full border px-[8px] py-[2px] text-[10.5px] font-semibold ${cls[color]}`}>{label}</span>;
}

function Table({ headers, rows }: { headers: string[]; rows: (string | React.ReactNode)[][] }) {
  return (
    <div className="overflow-x-auto rounded-[12px] border border-slate-200 bg-white">
      <table className="w-full text-[12.5px]">
        <thead><tr className="border-b border-slate-100 bg-slate-50">{headers.map(h => <th key={h} className="px-[14px] py-[10px] text-left font-semibold text-slate-600">{h}</th>)}</tr></thead>
        <tbody>{rows.map((row, i) => <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors">{row.map((cell, j) => <td key={j} className="px-[14px] py-[10px] text-slate-700">{cell}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

function ProgressBar({ value, color = "#0f766e", delay = 0 }: { value: number; color?: string; delay?: number }) {
  return (
    <div className="h-[7px] w-full rounded-full bg-slate-100 overflow-hidden">
      <motion.div
        initial={{ width: 0 }} animate={{ width: `${value}%` }}
        transition={{ duration: 0.9, delay, ease: EASE }}
        className="h-full rounded-full" style={{ backgroundColor: color }}
      />
    </div>
  );
}
function DocumentsView() {
  const docs = [
    { name: "Q2 Electricity Bill – HQ Mumbai", type: "PDF", size: "2.3 MB", date: "12 Jun 2026", status: "Verified", scope: "Scope 2" },
    { name: "Diesel Purchase – Generators Jun", type: "PDF", size: "1.1 MB", date: "14 Jun 2026", status: "Verified", scope: "Scope 1" },
    { name: "Flight Receipts – Leadership Offsite", type: "PDF", size: "870 KB", date: "18 Jun 2026", status: "Pending", scope: "Scope 3" },
    { name: "Natural Gas Invoice – Pune Plant", type: "PDF", size: "1.4 MB", date: "22 Jun 2026", status: "Verified", scope: "Scope 1" },
    { name: "Refrigerant Recharge Log – HVAC", type: "XLSX", size: "320 KB", date: "28 Jun 2026", status: "Pending", scope: "Scope 1" },
    { name: "Supply Chain Invoice – Steel", type: "PDF", size: "3.1 MB", date: "2 Jul 2026", status: "Verified", scope: "Scope 3" },
  ];
  return (
    <div className="flex flex-col gap-[20px]">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-[14px]">
        <StatCard label="Total Documents" value="47" sub="This reporting period" />
        <StatCard label="Verified" value="34" sub="72% of total" trend={-8} />
        <StatCard label="Pending Review" value="9" sub="Needs action" />
        <StatCard label="Storage Used" value="182 MB" sub="of 2 GB limit" />
      </div>
      <div className="rounded-[14px] border border-slate-200/70 bg-white p-[18px]">
        <div className="flex items-center justify-between mb-[14px]">
          <h3 className="text-[14px] font-semibold text-slate-900">Recent Documents</h3>
          <button className="flex items-center gap-[6px] rounded-[8px] bg-teal-600 px-[12px] py-[7px] text-[12px] font-semibold text-white hover:bg-teal-700 transition-colors">
            <Plus size={13} /> Upload
          </button>
        </div>
        <Table
          headers={["Document Name", "Type", "Size", "Upload Date", "Scope", "Status"]}
          rows={docs.map((d) => [d.name, d.type, d.size, d.date, d.scope,
            <Badge key={d.name} label={d.status} color={d.status === "Verified" ? "green" : "yellow"} />])}
        />
      </div>
      <div className="grid grid-cols-3 gap-[14px]">
        {["Scope 1", "Scope 2", "Scope 3"].map((s, i) => (
          <div key={s} className="rounded-[12px] border border-slate-200 bg-white p-[16px]">
            <p className="text-[12px] font-semibold text-slate-500">{s} Documents</p>
            <p className="text-[22px] font-bold mt-[4px] text-slate-900">{[18, 14, 15][i]}</p>
            <MiniBarChart data={[[12,15,14,16,18],[10,12,13,11,14],[9,11,14,13,15]][i]!} color={["#0f766e","#06b6d4","#6366f1"][i]!} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ReviewView() {
  const items = [
    { activity: "Electricity – HQ Office", period: "Jun 2026", value: "48,320 kWh", tco2e: "19.84", status: "Approved", reviewer: "Riya Shah", risk: "Low" },
    { activity: "Diesel – DG Sets", period: "Jun 2026", value: "2,100 L", tco2e: "5.59", status: "Approved", reviewer: "Vikram P.", risk: "Low" },
    { activity: "Natural Gas – Boiler", period: "Jun 2026", value: "3,400 m3", tco2e: "7.14", status: "Under Review", reviewer: "Anita K.", risk: "Medium" },
    { activity: "Business Air Travel", period: "Jun 2026", value: "12,400 pkm", tco2e: "3.22", status: "Flagged", reviewer: "Anita K.", risk: "High" },
    { activity: "Company Cars – Petrol", period: "Jun 2026", value: "8,900 km", tco2e: "1.87", status: "Approved", reviewer: "Riya Shah", risk: "Low" },
    { activity: "Employee Commute", period: "Jun 2026", value: "22,000 pkm", tco2e: "2.10", status: "Under Review", reviewer: "Vikram P.", risk: "Medium" },
  ];
  return (
    <div className="flex flex-col gap-[20px]">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-[14px]">
        <StatCard label="Total Records" value="84" sub="This period" />
        <StatCard label="Approved" value="61" sub="72.6%" trend={5} />
        <StatCard label="Under Review" value="16" sub="Needs decision" />
        <StatCard label="Flagged" value="7" sub="Requires correction" />
      </div>
      <div className="rounded-[14px] border border-slate-200 bg-white p-[18px]">
        <div className="flex items-center justify-between mb-[14px]">
          <h3 className="text-[14px] font-semibold text-slate-900">Review Queue</h3>
          <div className="flex gap-[8px]">
            <button className="flex items-center gap-[5px] rounded-[8px] border border-slate-200 bg-white px-[10px] py-[6px] text-[11.5px] text-slate-600 hover:bg-slate-50"><Funnel size={12} /> Filter</button>
            <button className="flex items-center gap-[5px] rounded-[8px] border border-slate-200 bg-white px-[10px] py-[6px] text-[11.5px] text-slate-600 hover:bg-slate-50"><MagnifyingGlass size={12} /> Search</button>
          </div>
        </div>
        <Table
          headers={["Activity", "Period", "Qty", "tCO2e", "Risk", "Reviewer", "Status"]}
          rows={items.map((it) => [it.activity, it.period, it.value, it.tco2e,
            <Badge key={it.activity + "r"} label={it.risk} color={it.risk === "Low" ? "green" : it.risk === "Medium" ? "yellow" : "red"} />,
            it.reviewer,
            <Badge key={it.activity + "s"} label={it.status} color={it.status === "Approved" ? "green" : it.status === "Under Review" ? "yellow" : "red"} />])}
        />
      </div>
      <div className="grid grid-cols-3 gap-[14px]">
        {[{ l: "Approved", v: 72, c: "#10b981" }, { l: "Under Review", v: 19, c: "#f59e0b" }, { l: "Flagged", v: 9, c: "#ef4444" }].map((s) => (
          <div key={s.l} className="rounded-[12px] border border-slate-200 bg-white p-[16px] flex flex-col items-center gap-[8px]">
            <RingChart pct={s.v} color={s.c} />
            <p className="text-[12px] font-semibold text-slate-700">{s.l}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CalculationsView() {
  const calcs = [
    { item: "Electricity – Grid (CEA 2024)", qty: "48,320 kWh", ef: "0.000411", unit: "tCO2e/kWh", scope: "S2", result: "19.84 tCO2e", dataset: "CEA India", ok: true },
    { item: "Diesel – Stationary Combustion", qty: "2,100 L", ef: "0.002663", unit: "tCO2e/L", scope: "S1", result: "5.59 tCO2e", dataset: "IPCC AR6", ok: true },
    { item: "Natural Gas – Boiler", qty: "3,400 m3", ef: "0.002100", unit: "tCO2e/m3", scope: "S1", result: "7.14 tCO2e", dataset: "IPCC AR6", ok: true },
    { item: "Air Travel – Economy", qty: "12,400 pkm", ef: "0.000260", unit: "tCO2e/pkm", scope: "S3", result: "3.22 tCO2e", dataset: "DEFRA 2024", ok: true },
    { item: "Company Cars – Petrol", qty: "8,900 km", ef: "0.000210", unit: "tCO2e/km", scope: "S1", result: "1.87 tCO2e", dataset: "DEFRA 2024", ok: true },
    { item: "Refrigerants – R410A", qty: "12 kg", ef: "2.088000", unit: "tCO2e/kg", scope: "S1", result: "25.06 tCO2e", dataset: "IPCC AR5", ok: false },
  ];
  return (
    <div className="flex flex-col gap-[20px]">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-[14px]">
        <StatCard label="Total Calculations" value="312" sub="This period" />
        <StatCard label="Successful" value="304" sub="97.4% match rate" trend={2} />
        <StatCard label="Total tCO2e" value="296.8" sub="Computed footprint" />
        <StatCard label="EF Datasets Used" value="6" sub="CEA, IPCC, DEFRA" />
      </div>
      <div className="rounded-[14px] border border-slate-200 bg-white p-[18px]">
        <h3 className="text-[14px] font-semibold text-slate-900 mb-[14px]">Emission Calculation Log</h3>
        <Table
          headers={["Activity", "Quantity", "EF Value", "Unit", "Scope", "Result", "Dataset", "Status"]}
          rows={calcs.map((c) => [c.item, c.qty, c.ef, c.unit,
            <Badge key={c.item + "sc"} label={c.scope} color={c.scope === "S1" ? "green" : c.scope === "S2" ? "blue" : "purple"} />,
            <span key={c.item + "r"} className="font-semibold text-teal-700">{c.result}</span>,
            c.dataset,
            <span key={c.item + "s"} className={c.ok ? "text-emerald-600 font-medium" : "text-amber-600 font-medium"}>{c.ok ? "Matched" : "Review"}</span>])}
        />
      </div>
      <div className="rounded-[14px] border border-slate-200 bg-white p-[18px]">
        <h3 className="text-[13px] font-semibold text-slate-800 mb-[14px]">Emissions Share by Scope</h3>
        <div className="flex flex-col gap-[10px]">
          {[{ l: "Scope 1 — Direct", v: 40, c: "#0f766e" }, { l: "Scope 2 — Energy", v: 31, c: "#06b6d4" }, { l: "Scope 3 — Value Chain", v: 29, c: "#6366f1" }].map((s, i) => (
            <div key={s.l}>
              <div className="flex justify-between text-[12px] mb-[4px]">
                <span className="text-slate-600">{s.l}</span>
                <span className="font-bold text-slate-800">{s.v}%</span>
              </div>
              <ProgressBar value={s.v} color={s.c} delay={i * 0.1} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BaselineView() {
  const years = ["2020", "2021", "2022", "2023", "2024", "2025", "2026"];
  const vals = [420, 385, 360, 340, 318, 305, 297];
  const max = Math.max(...vals);
  return (
    <div className="flex flex-col gap-[20px]">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-[14px]">
        <StatCard label="Baseline Year" value="2020" sub="Reference point" />
        <StatCard label="Baseline Emissions" value="420 tCO2e" sub="Total footprint" />
        <StatCard label="Current Emissions" value="297 tCO2e" sub="2026 YTD" trend={-8} />
        <StatCard label="Total Reduction" value="29.3%" sub="vs 2020 baseline" trend={3} />
      </div>
      <div className="rounded-[14px] border border-slate-200 bg-white p-[20px]">
        <div className="flex items-center justify-between mb-[16px]">
          <div>
            <h3 className="text-[14px] font-semibold text-slate-900">Emissions vs Baseline Trajectory</h3>
            <p className="text-[12px] text-slate-400 mt-[2px]">Annual tCO2e — 2020 baseline</p>
          </div>
          <span className="flex items-center gap-[5px] rounded-full bg-emerald-50 px-[10px] py-[4px] text-[11px] font-semibold text-emerald-700 border border-emerald-200">
            <TrendDown size={12} weight="bold" /> -29.3% since baseline
          </span>
        </div>
        <div className="flex items-end gap-[10px] h-[140px]">
          {years.map((y, i) => (
            <div key={y} className="flex flex-1 flex-col items-center gap-[4px]">
              <p className="text-[10px] font-semibold text-slate-600">{vals[i]}</p>
              <motion.div
                initial={{ height: 0 }} animate={{ height: `${(vals[i]! / max) * 120}px` }}
                transition={{ duration: 0.8, delay: i * 0.08, ease: EASE }}
                className="w-full rounded-t-[6px]"
                style={{ background: i === 0 ? "#94a3b8" : i === 6 ? "#0f766e" : `rgba(15,118,110,${0.3 + i * 0.1})` }}
              />
              <p className="text-[10px] text-slate-400">{y}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-[14px]">
        <div className="rounded-[12px] border border-slate-200 bg-white p-[16px]">
          <h4 className="text-[12px] font-semibold text-slate-700 mb-[10px]">Scope-wise Comparison</h4>
          <Table headers={["Scope", "2020", "2026", "Change"]} rows={[
            ["Scope 1 — Direct", "218 tCO2e", "140 tCO2e", <Badge key="s1" label="-35.8%" color="green" />],
            ["Scope 2 — Energy", "142 tCO2e", "110 tCO2e", <Badge key="s2" label="-22.5%" color="green" />],
            ["Scope 3 — Chain", "60 tCO2e", "47 tCO2e", <Badge key="s3" label="-21.7%" color="green" />],
          ]} />
        </div>
        <div className="rounded-[12px] border border-slate-200 bg-white p-[16px]">
          <h4 className="text-[12px] font-semibold text-slate-700 mb-[10px]">Key Reduction Drivers</h4>
          {[{ label: "Renewable Energy Switch", val: 72 }, { label: "Fleet Electrification", val: 45 }, { label: "Energy Efficiency Upgrades", val: 38 }, { label: "Supply Chain Optimization", val: 21 }].map((item, i) => (
            <div key={item.label} className="mb-[10px]">
              <div className="flex justify-between text-[11.5px] mb-[3px]">
                <span className="text-slate-600">{item.label}</span>
                <span className="font-semibold text-teal-700">{item.val}%</span>
              </div>
              <ProgressBar value={item.val} color="#0f766e" delay={i * 0.1} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TargetsView() {
  const targets = [
    { name: "Net Zero by 2040", scope: "All Scopes", baseline: "420 tCO2e", target: "0 tCO2e", current: "297 tCO2e", pct: 29, deadline: "2040", status: "On Track" },
    { name: "50% Scope 1 Reduction", scope: "Scope 1", baseline: "218 tCO2e", target: "109 tCO2e", current: "140 tCO2e", pct: 58, deadline: "2030", status: "On Track" },
    { name: "100% Renewable Energy", scope: "Scope 2", baseline: "142 tCO2e", target: "0 tCO2e", current: "110 tCO2e", pct: 22, deadline: "2030", status: "At Risk" },
    { name: "Scope 3 Supplier Audit", scope: "Scope 3", baseline: "60 tCO2e", target: "30 tCO2e", current: "47 tCO2e", pct: 43, deadline: "2028", status: "On Track" },
  ];
  return (
    <div className="flex flex-col gap-[20px]">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-[14px]">
        <StatCard label="Active Targets" value="4" sub="Science-based" />
        <StatCard label="On Track" value="3" sub="75% success rate" trend={2} />
        <StatCard label="At Risk" value="1" sub="Needs intervention" />
        <StatCard label="Net Zero Year" value="2040" sub="Current trajectory" />
      </div>
      <div className="flex flex-col gap-[12px]">
        {targets.map((t, i) => (
          <motion.div key={t.name} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: i * 0.08, ease: EASE }}
            className="rounded-[14px] border border-slate-200 bg-white p-[18px]">
            <div className="flex items-start justify-between mb-[12px]">
              <div>
                <div className="flex items-center gap-[8px]">
                  <h4 className="text-[14px] font-semibold text-slate-900">{t.name}</h4>
                  <Badge label={t.status} color={t.status === "On Track" ? "green" : "yellow"} />
                </div>
                <p className="text-[12px] text-slate-400 mt-[2px]">{t.scope} · Deadline: {t.deadline}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-slate-500">Current</p>
                <p className="text-[16px] font-bold text-teal-700">{t.current}</p>
              </div>
            </div>
            <ProgressBar value={t.pct} color={t.status === "On Track" ? "#10b981" : "#f59e0b"} delay={i * 0.1} />
            <div className="flex justify-between mt-[6px]">
              <p className="text-[11px] text-slate-400">Baseline: {t.baseline}</p>
              <p className="text-[11px] font-semibold text-slate-700">{t.pct}% reduced</p>
              <p className="text-[11px] text-slate-400">Target: {t.target}</p>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="rounded-[14px] border border-slate-200 bg-white p-[18px]">
        <h3 className="text-[13px] font-semibold text-slate-800 mb-[14px]">Projected Reduction Trajectory (2024-2042)</h3>
        <div className="flex items-end gap-[8px] h-[80px]">
          {[100, 92, 83, 73, 62, 50, 38, 25, 12, 0].map((v, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-[2px]">
              <motion.div initial={{ height: 0 }} animate={{ height: `${v * 0.72}px` }}
                transition={{ duration: 0.7, delay: i * 0.06, ease: EASE }}
                className="w-full rounded-t-[4px]" style={{ background: `rgba(15,118,110,${0.9 - i * 0.08})` }} />
              <p className="text-[9px] text-slate-400">{2024 + i * 2}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DataQualityView() {
  const checks = [
    { metric: "Completeness", score: 87, status: "Good", note: "13% of activity data gaps remain" },
    { metric: "Accuracy", score: 94, status: "Excellent", note: "EF match rate 94.2%" },
    { metric: "Timeliness", score: 78, status: "Fair", note: "avg 4.2 days lag in data entry" },
    { metric: "Consistency", score: 91, status: "Good", note: "Cross-period variance within 3%" },
    { metric: "Auditability", score: 96, status: "Excellent", note: "Full source-to-calc traceability" },
  ];
  return (
    <div className="flex flex-col gap-[20px]">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-[14px]">
        <StatCard label="Overall DQ Score" value="89/100" sub="GHG Protocol aligned" trend={4} />
        <StatCard label="Data Gaps" value="13%" sub="Needs backfill" />
        <StatCard label="Verified Records" value="304" sub="of 312 total" />
        <StatCard label="Audit Readiness" value="96%" sub="Ready for 3rd party" trend={6} />
      </div>
      <div className="rounded-[14px] border border-slate-200 bg-white p-[18px]">
        <h3 className="text-[14px] font-semibold text-slate-900 mb-[14px]">Quality Dimension Scores</h3>
        <div className="flex flex-col gap-[14px]">
          {checks.map((c, i) => (
            <motion.div key={c.metric} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.08 }}>
              <div className="flex items-center justify-between mb-[4px]">
                <span className="text-[13px] font-medium text-slate-700">{c.metric}</span>
                <div className="flex items-center gap-[8px]">
                  <span className="text-[12px] text-slate-400">{c.note}</span>
                  <span className="text-[13px] font-bold text-slate-900">{c.score}/100</span>
                  <Badge label={c.status} color={c.status === "Excellent" ? "green" : c.status === "Good" ? "blue" : "yellow"} />
                </div>
              </div>
              <ProgressBar value={c.score} color={c.score >= 90 ? "#10b981" : c.score >= 80 ? "#3b82f6" : "#f59e0b"} delay={i * 0.1} />
            </motion.div>
          ))}
        </div>
      </div>
      <div className="rounded-[14px] border border-slate-200 bg-white p-[18px]">
        <h3 className="text-[13px] font-semibold text-slate-800 mb-[12px]">Monthly Data Coverage — Last 6 Months</h3>
        <div className="grid grid-cols-6 gap-[6px]">
          {["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((m, mi) => (
            <div key={m} className="text-center">
              <p className="text-[10px] text-slate-400 mb-[4px]">{m}</p>
              {["Electricity", "Diesel", "Travel", "Gas", "Waste"].map((cat, ci) => {
                const present = !((mi === 2 && ci === 2) || (mi === 3 && ci === 4) || (mi === 1 && ci === 3));
                return <div key={cat} className={`mb-[3px] h-[14px] rounded-[3px] ${present ? "bg-emerald-100" : "bg-red-100"}`} />;
              })}
            </div>
          ))}
        </div>
        <div className="flex gap-[12px] mt-[8px]">
          <div className="flex items-center gap-[4px] text-[10px] text-slate-500"><span className="h-[10px] w-[10px] rounded-[2px] bg-emerald-100" /> Data present</div>
          <div className="flex items-center gap-[4px] text-[10px] text-slate-500"><span className="h-[10px] w-[10px] rounded-[2px] bg-red-100" /> Missing</div>
        </div>
      </div>
    </div>
  );
}

function RecommendationsView() {
  const recs = [
    { title: "Switch to 100% Renewable Electricity", impact: "High", saving: "19.8 tCO2e/yr", effort: "Medium", category: "Energy", Icon: Lightning, priority: 1 },
    { title: "Electrify Company Fleet (Phase 1)", impact: "High", saving: "12.4 tCO2e/yr", effort: "High", category: "Transport", Icon: Car, priority: 2 },
    { title: "Supplier Decarbonization Audit", impact: "Medium", saving: "8.2 tCO2e/yr", effort: "High", category: "Supply Chain", Icon: Factory, priority: 3 },
    { title: "LED Lighting Retrofit — All Sites", impact: "Medium", saving: "5.1 tCO2e/yr", effort: "Low", category: "Energy", Icon: Lightbulb, priority: 4 },
    { title: "Video-first Business Travel Policy", impact: "Medium", saving: "3.2 tCO2e/yr", effort: "Low", category: "Travel", Icon: Airplane, priority: 5 },
    { title: "Install Rooftop Solar — Pune Plant", impact: "High", saving: "22.6 tCO2e/yr", effort: "High", category: "Energy", Icon: Leaf, priority: 6 },
  ];
  return (
    <div className="flex flex-col gap-[20px]">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-[14px]">
        <StatCard label="Total Actions" value="18" sub="AI-generated" />
        <StatCard label="Potential Savings" value="128 tCO2e" sub="If all adopted" trend={12} />
        <StatCard label="Implemented" value="4" sub="This quarter" />
        <StatCard label="Avg Payback" value="2.3 yrs" sub="Financial ROI" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px]">
        {recs.map((r, i) => (
          <motion.div key={r.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.07, ease: EASE }}
            className="rounded-[14px] border border-slate-200 bg-white p-[16px] hover:border-teal-300 hover:shadow-sm transition-all cursor-pointer group">
            <div className="flex items-start gap-[12px]">
              <div className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-[10px] bg-teal-50 text-teal-600 group-hover:bg-teal-100 transition-colors">
                <r.Icon size={18} weight="duotone" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-[8px]">
                  <h4 className="text-[13px] font-semibold text-slate-900 leading-tight">{r.title}</h4>
                  <span className="shrink-0 text-[10px] font-bold text-slate-400">#{r.priority}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-[2px]">{r.category}</p>
                <div className="flex items-center gap-[8px] mt-[8px]">
                  <Badge label={`Impact: ${r.impact}`} color={r.impact === "High" ? "green" : "yellow"} />
                  <Badge label={`Effort: ${r.effort}`} color={r.effort === "Low" ? "blue" : r.effort === "Medium" ? "yellow" : "red"} />
                  <span className="ml-auto text-[12px] font-bold text-emerald-700">- {r.saving}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function NotificationsView() {
  const notifs = [
    { title: "Scope 2 emissions spiked 18% in June", type: "Anomaly", time: "2 hours ago", read: false, level: "warning" },
    { title: "Data quality score improved to 89/100", type: "Achievement", time: "5 hours ago", read: false, level: "success" },
    { title: "Q2 reporting deadline in 14 days", type: "Deadline", time: "1 day ago", read: true, level: "info" },
    { title: "New emission factor update: CEA 2024", type: "Update", time: "2 days ago", read: true, level: "info" },
    { title: "Refrigerant calculation flagged for review", type: "Review", time: "3 days ago", read: true, level: "warning" },
    { title: "Fleet electrification target: 58% achieved", type: "Progress", time: "4 days ago", read: true, level: "success" },
    { title: "Missing data: Mar-Apr Pune Plant", type: "Alert", time: "5 days ago", read: true, level: "error" },
  ];
  const levelIcon = (l: string) => {
    if (l === "success") return <CheckCircle size={16} weight="fill" className="text-emerald-600" />;
    if (l === "warning") return <Warning size={16} weight="fill" className="text-amber-500" />;
    if (l === "error") return <XCircle size={16} weight="fill" className="text-red-500" />;
    return <Info size={16} weight="fill" className="text-blue-500" />;
  };
  return (
    <div className="flex flex-col gap-[20px]">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-[14px]">
        <StatCard label="Total" value="24" sub="All notifications" />
        <StatCard label="Unread" value="2" sub="Needs attention" />
        <StatCard label="Alerts" value="3" sub="Anomalies / flags" />
        <StatCard label="Deadlines" value="1" sub="14 days remaining" />
      </div>
      <div className="rounded-[14px] border border-slate-200 bg-white overflow-hidden">
        <div className="flex items-center justify-between px-[18px] py-[14px] border-b border-slate-100">
          <h3 className="text-[14px] font-semibold text-slate-900">Notification Feed</h3>
          <button className="text-[12px] font-medium text-teal-600 hover:text-teal-800">Mark all read</button>
        </div>
        <div className="divide-y divide-slate-50">
          {notifs.map((n, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
              className={`flex items-start gap-[12px] px-[18px] py-[14px] ${!n.read ? "bg-teal-50/40" : ""} hover:bg-slate-50/60 transition-colors`}>
              <div className="mt-[1px]">{levelIcon(n.level)}</div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-[8px]">
                  <p className={`text-[13px] ${!n.read ? "font-semibold text-slate-900" : "text-slate-700"}`}>{n.title}</p>
                  {!n.read && <span className="shrink-0 h-[7px] w-[7px] rounded-full bg-teal-500 mt-[4px]" />}
                </div>
                <p className="text-[11px] text-slate-400 mt-[2px]">{n.type} · {n.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AuditLogsView() {
  const logs = [
    { user: "Riya Shah", action: "Approved activity record", target: "Electricity Jun 2026", timestamp: "2026-07-10 14:32", ip: "192.168.1.42" },
    { user: "Vikram P.", action: "Uploaded document", target: "Diesel Invoice Jun", timestamp: "2026-07-10 11:15", ip: "192.168.1.55" },
    { user: "Anita K.", action: "Flagged record for review", target: "Air Travel Jun 2026", timestamp: "2026-07-09 16:44", ip: "10.0.0.12" },
    { user: "System", action: "Auto-calculated emissions", target: "312 records — Jun 2026", timestamp: "2026-07-09 08:00", ip: "internal" },
    { user: "Riya Shah", action: "Exported PDF report", target: "Q2 2026 BRSR Draft", timestamp: "2026-07-08 17:20", ip: "192.168.1.42" },
    { user: "Admin", action: "Updated emission factor", target: "CEA Grid 2024 — 0.000411", timestamp: "2026-07-07 10:05", ip: "10.0.0.1" },
  ];
  return (
    <div className="flex flex-col gap-[20px]">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-[14px]">
        <StatCard label="Total Events" value="1,284" sub="All time" />
        <StatCard label="Today" value="23" sub="System + user" />
        <StatCard label="Users Active" value="4" sub="This week" />
        <StatCard label="Critical Events" value="2" sub="Require review" />
      </div>
      <div className="rounded-[14px] border border-slate-200 bg-white p-[18px]">
        <div className="flex items-center justify-between mb-[14px]">
          <h3 className="text-[14px] font-semibold text-slate-900">System Activity Log</h3>
          <button className="flex items-center gap-[5px] rounded-[8px] border border-slate-200 bg-white px-[10px] py-[6px] text-[11.5px] text-slate-600 hover:bg-slate-50">
            <DownloadSimple size={12} /> Export CSV
          </button>
        </div>
        <Table
          headers={["Timestamp", "User", "Action", "Target", "IP"]}
          rows={logs.map((l) => [
            <span key={l.timestamp} className="font-mono text-[11px] text-slate-500">{l.timestamp}</span>,
            <span key={l.user + l.timestamp} className="font-semibold text-slate-800">{l.user}</span>,
            l.action, l.target,
            <span key={l.ip} className="font-mono text-[11px] text-slate-400">{l.ip}</span>])}
        />
      </div>
      <div className="rounded-[12px] border border-slate-200 bg-white p-[16px]">
        <h4 className="text-[12px] font-semibold text-slate-700 mb-[10px]">Activity by Day — Last 7 Days</h4>
        <MiniBarChart data={[14, 22, 18, 31, 27, 19, 23]} color="#0f766e" />
        <div className="flex justify-between mt-[4px]">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <span key={d} className="text-[10px] text-slate-400 flex-1 text-center">{d}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function TeamView() {
  const members = [
    { name: "Riya Shah", role: "Admin", email: "riya@carbonsynq.com", access: "Full Access", lastActive: "Today", status: "Active" },
    { name: "Vikram Patel", role: "Manager", email: "vikram@carbonsynq.com", access: "Data Entry + Review", lastActive: "Today", status: "Active" },
    { name: "Anita Krishnan", role: "Auditor", email: "anita@carbonsynq.com", access: "Read + Approve", lastActive: "Yesterday", status: "Active" },
    { name: "Rohan Mehta", role: "Viewer", email: "rohan@carbonsynq.com", access: "Read Only", lastActive: "3 days ago", status: "Inactive" },
  ];
  return (
    <div className="flex flex-col gap-[20px]">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-[14px]">
        <StatCard label="Total Members" value="4" sub="Active seats" />
        <StatCard label="Admins" value="1" sub="Full access" />
        <StatCard label="Managers" value="2" sub="Data + review" />
        <StatCard label="Pending Invites" value="2" sub="Awaiting accept" />
      </div>
      <div className="rounded-[14px] border border-slate-200 bg-white p-[18px]">
        <div className="flex items-center justify-between mb-[14px]">
          <h3 className="text-[14px] font-semibold text-slate-900">Team Members</h3>
          <button className="flex items-center gap-[6px] rounded-[8px] bg-teal-600 px-[12px] py-[7px] text-[12px] font-semibold text-white hover:bg-teal-700 transition-colors">
            <Plus size={13} /> Invite Member
          </button>
        </div>
        <Table
          headers={["Name", "Role", "Email", "Access Level", "Last Active", "Status"]}
          rows={members.map((m) => [
            <span key={m.name} className="font-semibold text-slate-800">{m.name}</span>,
            m.role, m.email, m.access, m.lastActive,
            <Badge key={m.name + "s"} label={m.status} color={m.status === "Active" ? "green" : "yellow"} />])}
        />
      </div>
      <div className="grid grid-cols-2 gap-[14px]">
        <div className="rounded-[12px] border border-slate-200 bg-white p-[16px]">
          <h4 className="text-[12px] font-semibold text-slate-700 mb-[10px]">Actions by Member — This Month</h4>
          {[{ name: "Riya", v: 87 }, { name: "Vikram", v: 64 }, { name: "Anita", v: 42 }, { name: "Rohan", v: 8 }].map((m, i) => (
            <div key={m.name} className="mb-[8px]">
              <div className="flex justify-between text-[11px] mb-[2px]">
                <span className="text-slate-600">{m.name}</span><span className="font-semibold text-slate-800">{m.v}</span>
              </div>
              <ProgressBar value={m.v} color="#0f766e" delay={i * 0.1} />
            </div>
          ))}
        </div>
        <div className="rounded-[12px] border border-slate-200 bg-white p-[16px]">
          <h4 className="text-[12px] font-semibold text-slate-700 mb-[10px]">Permissions Overview</h4>
          {[
            { perm: "Upload Documents", roles: "Admin, Manager" },
            { perm: "Approve Records", roles: "Admin, Auditor" },
            { perm: "Export Reports", roles: "Admin, Manager" },
            { perm: "Manage Team", roles: "Admin only" },
            { perm: "View Dashboard", roles: "All roles" },
          ].map((p) => (
            <div key={p.perm} className="flex justify-between py-[6px] border-b border-slate-50 last:border-0 text-[11.5px]">
              <span className="text-slate-700">{p.perm}</span>
              <span className="text-slate-400">{p.roles}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReportingPeriodsView() {
  const periods = [
    { name: "FY 2025-26 (Q2)", start: "Apr 1, 2026", end: "Jun 30, 2026", records: 84, status: "Active", tco2e: "73.2" },
    { name: "FY 2025-26 (Q1)", start: "Jan 1, 2026", end: "Mar 31, 2026", records: 91, status: "Closed", tco2e: "80.4" },
    { name: "FY 2024-25 (Full)", start: "Apr 1, 2025", end: "Mar 31, 2026", records: 342, status: "Audited", tco2e: "305.1" },
    { name: "FY 2023-24 (Full)", start: "Apr 1, 2024", end: "Mar 31, 2025", records: 318, status: "Audited", tco2e: "340.0" },
  ];
  return (
    <div className="flex flex-col gap-[20px]">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-[14px]">
        <StatCard label="Active Period" value="Q2 FY26" sub="Apr - Jun 2026" />
        <StatCard label="Total Records" value="84" sub="This period" trend={-8} />
        <StatCard label="Emissions" value="73.2 tCO2e" sub="Q2 2026" />
        <StatCard label="Next Deadline" value="31 Jul" sub="Q2 data lock" />
      </div>
      <div className="rounded-[14px] border border-slate-200 bg-white p-[18px]">
        <div className="flex items-center justify-between mb-[14px]">
          <h3 className="text-[14px] font-semibold text-slate-900">Reporting Periods</h3>
          <button className="flex items-center gap-[6px] rounded-[8px] bg-teal-600 px-[12px] py-[7px] text-[12px] font-semibold text-white hover:bg-teal-700 transition-colors">
            <Plus size={13} /> New Period
          </button>
        </div>
        <Table
          headers={["Period", "Start", "End", "Records", "tCO2e", "Status"]}
          rows={periods.map((p) => [
            <span key={p.name} className="font-semibold text-slate-800">{p.name}</span>,
            p.start, p.end, p.records.toString(), p.tco2e,
            <Badge key={p.name + "s"} label={p.status} color={p.status === "Active" ? "green" : p.status === "Closed" ? "yellow" : "blue"} />])}
        />
      </div>
      <div className="rounded-[14px] border border-slate-200 bg-white p-[18px]">
        <h3 className="text-[13px] font-semibold text-slate-800 mb-[14px]">Emissions by Quarter</h3>
        <div className="flex items-end gap-[12px] h-[100px]">
          {[{ l: "Q1'24", v: 88 }, { l: "Q2'24", v: 82 }, { l: "Q3'24", v: 85 }, { l: "Q4'24", v: 85 }, { l: "Q1'25", v: 81 }, { l: "Q2'25", v: 79 }, { l: "Q1'26", v: 80 }, { l: "Q2'26", v: 73 }].map((q, i) => (
            <div key={q.l} className="flex flex-1 flex-col items-center gap-[4px]">
              <p className="text-[10px] font-semibold text-slate-600">{q.v}</p>
              <motion.div initial={{ height: 0 }} animate={{ height: `${(q.v / 100) * 80}px` }}
                transition={{ duration: 0.7, delay: i * 0.06, ease: EASE }}
                className="w-full rounded-t-[4px]"
                style={{ background: i === 7 ? "#0f766e" : `rgba(15,118,110,${0.3 + i * 0.08})` }} />
              <p className="text-[9px] text-slate-400">{q.l}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmissionFactorsView() {
  const factors = [
    { name: "Grid Electricity (CEA India 2024)", value: "0.000411", unit: "tCO2e/kWh", source: "CEA", year: "2024", category: "Scope 2", status: "Active" },
    { name: "Diesel — Stationary Combustion", value: "0.002663", unit: "tCO2e/L", source: "IPCC AR6", year: "2021", category: "Scope 1", status: "Active" },
    { name: "Natural Gas", value: "0.002100", unit: "tCO2e/m3", source: "IPCC AR6", year: "2021", category: "Scope 1", status: "Active" },
    { name: "Petrol — Road Transport", value: "0.002310", unit: "tCO2e/L", source: "DEFRA 2024", year: "2024", category: "Scope 1", status: "Active" },
    { name: "Air Travel — Economy Short-haul", value: "0.000255", unit: "tCO2e/pkm", source: "DEFRA 2024", year: "2024", category: "Scope 3", status: "Active" },
    { name: "Refrigerant R410A", value: "2.088000", unit: "tCO2e/kg", source: "IPCC AR5", year: "2014", category: "Scope 1", status: "Outdated" },
    { name: "Cement — General", value: "0.000900", unit: "tCO2e/kg", source: "IPCC AR6", year: "2021", category: "Scope 3", status: "Active" },
  ];
  return (
    <div className="flex flex-col gap-[20px]">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-[14px]">
        <StatCard label="Total Factors" value="214" sub="In library" />
        <StatCard label="Active" value="198" sub="Currently in use" trend={3} />
        <StatCard label="Outdated" value="16" sub="Need update" />
        <StatCard label="Data Sources" value="6" sub="CEA, IPCC, DEFRA" />
      </div>
      <div className="rounded-[14px] border border-slate-200 bg-white p-[18px]">
        <div className="flex items-center justify-between mb-[14px]">
          <h3 className="text-[14px] font-semibold text-slate-900">Emission Factor Library</h3>
          <div className="flex gap-[8px]">
            <button className="flex items-center gap-[5px] rounded-[8px] border border-slate-200 bg-white px-[10px] py-[6px] text-[11.5px] text-slate-600 hover:bg-slate-50"><MagnifyingGlass size={12} /> Search</button>
            <button className="flex items-center gap-[5px] rounded-[8px] bg-teal-600 px-[10px] py-[6px] text-[11.5px] font-semibold text-white hover:bg-teal-700"><Plus size={12} /> Add Factor</button>
          </div>
        </div>
        <Table
          headers={["Factor Name", "EF Value", "Unit", "Source", "Year", "Category", "Status"]}
          rows={factors.map((f) => [
            f.name,
            <span key={f.name + "v"} className="font-mono font-semibold text-teal-700">{f.value}</span>,
            f.unit, f.source, f.year,
            <Badge key={f.name + "c"} label={f.category} color={f.category === "Scope 1" ? "green" : f.category === "Scope 2" ? "blue" : "purple"} />,
            <Badge key={f.name + "s"} label={f.status} color={f.status === "Active" ? "green" : "yellow"} />])}
        />
      </div>
    </div>
  );
}

function SettingsView() {
  return (
    <div className="flex flex-col gap-[20px]">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-[14px]">
        <StatCard label="Organisation" value="CarbonSynq" sub="Demo Client" />
        <StatCard label="Country" value="India" sub="Reporting region" />
        <StatCard label="Standard" value="BRSR Core" sub="+ GHG Protocol" />
        <StatCard label="Plan" value="Enterprise" sub="Active" />
      </div>
      <div className="grid grid-cols-2 gap-[14px]">
        <div className="rounded-[14px] border border-slate-200 bg-white p-[18px]">
          <h3 className="text-[14px] font-semibold text-slate-900 mb-[14px]">Organisation Details</h3>
          {[
            { label: "Company Name", val: "CarbonSynq Earth Pvt Ltd" },
            { label: "Industry", val: "Technology / SaaS" },
            { label: "HQ Location", val: "Mumbai, India" },
            { label: "Employees", val: "250-500" },
            { label: "Fiscal Year", val: "April - March" },
            { label: "Reporting Standard", val: "BRSR Core, GHG Protocol" },
          ].map((r) => (
            <div key={r.label} className="flex justify-between py-[8px] border-b border-slate-50 last:border-0 text-[12.5px]">
              <span className="text-slate-500">{r.label}</span>
              <span className="font-semibold text-slate-800">{r.val}</span>
            </div>
          ))}
        </div>
        <div className="rounded-[14px] border border-slate-200 bg-white p-[18px]">
          <h3 className="text-[14px] font-semibold text-slate-900 mb-[14px]">Integrations</h3>
          {[
            { name: "SAP ERP", status: "Connected", ok: true },
            { name: "Oracle Financials", status: "Disconnected", ok: false },
            { name: "Tally Prime", status: "Connected", ok: true },
            { name: "Utility API (MSEB)", status: "Connected", ok: true },
            { name: "ESG Disclosures Portal", status: "Pending", ok: null },
          ].map((int) => (
            <div key={int.name} className="flex items-center justify-between py-[8px] border-b border-slate-50 last:border-0">
              <div className="flex items-center gap-[8px]">
                {int.ok === true ? <CheckCircle size={14} weight="fill" className="text-emerald-500" /> : int.ok === false ? <XCircle size={14} weight="fill" className="text-red-500" /> : <Warning size={14} weight="fill" className="text-amber-500" />}
                <span className="text-[12.5px] text-slate-700">{int.name}</span>
              </div>
              <Badge label={int.status} color={int.status === "Connected" ? "green" : int.status === "Disconnected" ? "red" : "yellow"} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const VIEW_MAP: Partial<Record<TabId, () => React.JSX.Element>> = {
  documents: DocumentsView,
  review: ReviewView,
  calculations: CalculationsView,
  baseline: BaselineView,
  targets: TargetsView,
  "data-quality": DataQualityView,
  recommendations: RecommendationsView,
  notifications: NotificationsView,
  "audit-logs": AuditLogsView,
  team: TeamView,
  "reporting-periods": ReportingPeriodsView,
  "emission-factors": EmissionFactorsView,
  settings: SettingsView,
};

export default function Placeholder({ tab }: { tab: TabId }) {
  const View = VIEW_MAP[tab];
  if (View) {
    return (
      <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }}>
        <View />
      </motion.div>
    );
  }
  return (
    <motion.div key={tab} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="flex min-h-[45dvh] flex-col items-center justify-center rounded-[20px] border border-white/60 bg-white/70 backdrop-blur-2xl p-[36px] text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <h2 className="mt-[18px] text-[19px] font-bold tracking-tight text-slate-900">
        {tab.charAt(0).toUpperCase() + tab.slice(1).replace(/-/g, " ")}
      </h2>
      <p className="mt-[6px] max-w-[420px] text-[13.5px] leading-relaxed text-slate-500">Section under active configuration.</p>
    </motion.div>
  );
}

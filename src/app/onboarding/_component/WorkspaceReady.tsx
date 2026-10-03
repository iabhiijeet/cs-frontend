"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  CalendarRange,
  Check,
  FileText,
  FolderKanban,
  Plug,
  Rocket,
  Target,
  Users,
  Sparkle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface WorkspaceReadyProps {
  brandName: string;
  onEnterDashboard: () => void;
  onInvite: () => void;
}

interface Task {
  icon: React.ElementType;
  title: string;
  description: string;
  tag: "Recommended" | "Optional";
  done: boolean;
}

export function WorkspaceReady({
  brandName,
  onEnterDashboard,
  onInvite,
}: WorkspaceReadyProps) {
  const displayName = brandName || "your organization";

  const tasks: Task[] = [
    {
      icon: Plug,
      title: "Connect your ERP",
      description: "Link SAP, NetSuite or Dynamics to auto-import spend and activity data.",
      tag: "Recommended",
      done: false,
    },
    {
      icon: FileText,
      title: "Upload utility bills",
      description: "Share your electricity and gas invoices to complete Scope 2.",
      tag: "Recommended",
      done: false,
    },
    {
      icon: Users,
      title: "Invite teammates",
      description: "Bring your sustainability, finance and operations colleagues in.",
      tag: "Recommended",
      done: true,
    },
    {
      icon: Target,
      title: "Configure Scope 3",
      description: "Map suppliers, travel and cloud spend to the categories you selected.",
      tag: "Recommended",
      done: false,
    },
    {
      icon: Building2,
      title: "Add facility details",
      description: "Layer in floor area and meter numbers for each of your sites.",
      tag: "Optional",
      done: false,
    },
    {
      icon: CalendarRange,
      title: "Schedule your first report",
      description: "We'll draft it as soon as your data is flowing.",
      tag: "Optional",
      done: false,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-[720px] px-4 pb-24 pt-12 sm:px-6 sm:pt-16 font-sans antialiased text-slate-900">
      <div className="text-center">
        <motion.div
          initial={{ scale: 0, rotate: -12 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 14, delay: 0.1 }}
          className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-[0_10px_30px_rgba(13,148,136,0.35)] text-white"
        >
          <Check className="size-8 stroke-[3]" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-teal-900"
        >
          <Sparkle className="size-3 text-teal-600" />
          <span>Provisioning Complete</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl"
        >
          <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600 bg-clip-text text-transparent">
            {displayName}
          </span>{" "}
          is ready.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="mx-auto mt-2.5 max-w-md text-xs sm:text-sm leading-relaxed text-slate-600"
        >
          Your workspace is configured with your compliance frameworks, emission factors, and accounting calendar.
        </motion.p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        {tasks.map((task, i) => {
          const Icon = task.icon;
          return (
            <motion.div
              key={task.title}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + i * 0.07, duration: 0.35 }}
              className="group relative flex flex-col rounded-2xl border border-teal-100/90 bg-white/95 p-4.5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-[0_8px_30px_rgba(13,148,136,0.1)]"
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={
                    task.done
                      ? "flex size-9 items-center justify-center rounded-xl bg-teal-600 text-white shadow-2xs"
                      : "flex size-9 items-center justify-center rounded-xl bg-teal-50 border border-teal-200 text-teal-700"
                  }
                >
                  <Icon className="size-4.5" />
                </span>
                <span
                  className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full border ${
                    task.done
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-slate-100 border-slate-200 text-slate-600"
                  }`}
                >
                  {task.tag}
                </span>
              </div>
              <h3 className="mt-3 flex items-center gap-1.5 text-sm font-bold text-slate-900">
                {task.title}
                {task.done && <Check className="size-4 text-teal-600 stroke-[3]" />}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                {task.description}
              </p>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.85, duration: 0.35 }}
        className="mt-10 flex flex-col items-center gap-3"
      >
        <Button
          size="lg"
          onClick={onEnterDashboard}
          className="h-11 min-w-[15rem] rounded-xl bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600 text-white font-bold text-sm shadow-[0_8px_25px_rgba(13,148,136,0.3)] hover:from-teal-500 hover:via-cyan-500 hover:to-sky-500 active:scale-[0.99] cursor-pointer"
        >
          <Rocket className="size-4" />
          <span>Launch Dashboard</span>
          <ArrowRight className="size-4" />
        </Button>

        <Button
          variant="ghost"
          size="lg"
          onClick={onInvite}
          className="text-xs font-semibold text-slate-600 hover:text-teal-800"
        >
          <Users className="size-4" />
          <span>Invite colleagues</span>
        </Button>

        <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <FolderKanban className="size-3.5 text-teal-600" />
          Guided setup checklist is available inside the dashboard.
        </p>
      </motion.div>
    </div>
  );
}
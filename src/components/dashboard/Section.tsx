"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { EASE } from "@/lib/animations";

interface SectionProps {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  delay?: number;
  pad?: boolean;
}

export default function Section({ title, subtitle, action, children, className = "", delay = 0, pad = true }: SectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE, delay }}
      className={`flex flex-col h-full rounded-[20px] border border-white/60 bg-white/70 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] ${pad ? "p-[24px]" : ""} ${className}`}
    >
      {(title || action) && (
        <div className="mb-[18px] flex items-start justify-between gap-[12px]">
          <div className="min-w-0">
            {title && (
              <h2 className="text-[16px] font-semibold tracking-tight text-slate-900">{title}</h2>
            )}
            {subtitle && (
              <p className="mt-[4px] text-[13px] text-slate-500">{subtitle}</p>
            )}
          </div>
          {action}
        </div>
      )}
      <div className="flex-1 min-h-0">
        {children}
      </div>
    </motion.section>
  );
}

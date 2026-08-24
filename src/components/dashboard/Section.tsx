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
      className={`rounded-[16px] border border-slate-100 bg-white shadow-[0_1px_4px_rgba(15,23,42,0.06)] ${pad ? "p-[20px] md:p-[24px]" : ""} ${className}`}
    >
      {(title || action) && (
        <div className="mb-[18px] flex items-start justify-between gap-[12px]">
          <div className="min-w-0">
            {title && (
              <h2 className="text-[14px] font-semibold tracking-[-0.2px] text-slate-900">{title}</h2>
            )}
            {subtitle && (
              <p className="mt-[3px] text-[12px] text-slate-400">{subtitle}</p>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </motion.section>
  );
}

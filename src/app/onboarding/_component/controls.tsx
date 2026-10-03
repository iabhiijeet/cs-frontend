"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Check, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { FieldError } from "./fields";

interface BaseOption {
  value: string;
  label: string;
  description?: string;
  icon?: LucideIcon;
}

interface SegmentedControlProps {
  value: string;
  onChange: (value: string) => void;
  options: readonly BaseOption[];
  error?: string;
  id?: string;
}

export function SegmentedControl({
  value,
  onChange,
  options,
  error,
  id,
}: SegmentedControlProps) {
  return (
    <div className="flex flex-col gap-2">
      <div
        id={id}
        role="radiogroup"
        aria-label="Select an option"
        className="inline-grid w-full grid-cols-2 gap-1.5 rounded-xl border border-slate-200 bg-slate-100 p-1 sm:grid-cols-4"
        style={{
          gridTemplateColumns: `repeat(${Math.min(options.length, 4)}, minmax(0, 1fr))`,
        }}
      >
        {options.map((opt) => {
          const isSelected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(opt.value)}
              className={cn(
                "relative flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-all outline-none cursor-pointer",
                isSelected ? "text-teal-950 font-extrabold" : "text-slate-600 hover:text-slate-900"
              )}
            >
              {isSelected && (
                <motion.span
                  layoutId={`${id ?? "seg"}-active`}
                  transition={{ type: "spring", stiffness: 420, damping: 32 }}
                  className="absolute inset-0 rounded-lg border border-teal-200 bg-white shadow-xs"
                />
              )}
              <span className="relative z-10 inline-flex items-center gap-1.5">
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
      {error && <FieldError message={error} />}
    </div>
  );
}

interface SelectableCardProps {
  value: string;
  onChange: (value: string) => void;
  options: readonly (BaseOption & { hint?: string })[];
  error?: string;
  columns?: 1 | 2 | 3;
  id?: string;
}

export function SelectableCards({
  value,
  onChange,
  options,
  error,
  columns = 2,
  id,
}: SelectableCardProps) {
  const colClass = columns === 1 ? "sm:grid-cols-1" : columns === 3 ? "md:grid-cols-3" : "sm:grid-cols-2";
  return (
    <div className="flex flex-col gap-2">
      <div
        id={id}
        role="radiogroup"
        aria-label="Select an option"
        className={cn("grid grid-cols-1 gap-3", colClass)}
      >
        {options.map((opt) => {
          const isSelected = value === opt.value;
          const Icon = opt.icon;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(opt.value)}
              className={cn(
                "group relative flex items-start gap-3 rounded-xl border p-3.5 sm:p-4 text-left transition-all duration-200 outline-none cursor-pointer",
                isSelected
                  ? "border-teal-500 bg-teal-50/80 shadow-xs ring-2 ring-teal-500/20"
                  : "border-slate-200/90 bg-slate-50/70 hover:border-slate-300 hover:bg-slate-100/60"
              )}
            >
              {Icon && (
                <span
                  className={cn(
                    "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border transition-colors",
                    isSelected
                      ? "border-teal-600 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold"
                      : "border-slate-200 bg-slate-200/80 text-slate-600 group-hover:text-slate-900"
                  )}
                >
                  <Icon className="size-4" />
                </span>
              )}
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="text-sm font-bold text-slate-900">
                  {opt.label}
                </span>
                {opt.description && (
                  <span className="text-xs leading-relaxed text-slate-500 font-normal">
                    {opt.description}
                  </span>
                )}
                {opt.hint && (
                  <span className="mt-1 text-xs font-semibold text-teal-700">
                    {opt.hint}
                  </span>
                )}
              </span>
              <span
                className={cn(
                  "ml-auto flex size-4.5 shrink-0 items-center justify-center rounded-full border transition-all",
                  isSelected
                    ? "border-teal-600 bg-teal-600 text-white"
                    : "border-slate-300 bg-white"
                )}
                aria-hidden="true"
              >
                {isSelected && <Check className="size-3 stroke-[3]" />}
              </span>
            </button>
          );
        })}
      </div>
      {error && <FieldError message={error} />}
    </div>
  );
}
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
        className="inline-grid w-full grid-cols-2 gap-1 rounded-2xl border border-black/5 bg-black/5 p-1.5 dark:border-white/10 dark:bg-white/5 sm:grid-cols-4 backdrop-blur-sm"
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
                "relative flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
                isSelected && "text-foreground"
              )}
            >
              {isSelected && (
                <motion.span
                  layoutId={`${id ?? "seg"}-active`}
                  transition={{ type: "spring", stiffness: 420, damping: 32 }}
                  className="absolute inset-0 rounded-[0.85rem] border border-black/5 bg-white shadow-md dark:border-white/10 dark:bg-slate-800"
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
        className={cn("grid grid-cols-1 gap-2.5", colClass)}
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
                "group relative flex items-start gap-3 rounded-2xl border p-4 text-left transition-all duration-300 outline-none focus-visible:ring-4 focus-visible:ring-primary/20 hover:shadow-lg",
                isSelected
                  ? "border-primary/50 bg-primary/5 shadow-[0_0_0_2px_rgba(22,163,74,0.2)] dark:bg-primary/10"
                  : "border-black/5 dark:border-white/10 bg-white/40 dark:bg-black/20 hover:bg-white/80 dark:hover:bg-black/40 backdrop-blur-md"
              )}
            >
              {Icon && (
                <span
                  className={cn(
                    "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border transition-colors",
                    isSelected
                      ? "border-primary/25 bg-primary/10 text-primary"
                      : "border-border bg-muted text-muted-foreground group-hover:text-foreground"
                  )}
                >
                  <Icon className="size-4" />
                </span>
              )}
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="text-sm font-semibold text-foreground">
                  {opt.label}
                </span>
                {opt.description && (
                  <span className="text-[0.8125rem] leading-5 text-muted-foreground">
                    {opt.description}
                  </span>
                )}
                {opt.hint && (
                  <span className="mt-1 text-xs font-medium text-primary">
                    {opt.hint}
                  </span>
                )}
              </span>
              <span
                className={cn(
                  "ml-auto flex size-4.5 shrink-0 items-center justify-center rounded-full border transition-all",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-foreground/20 bg-background"
                )}
                aria-hidden="true"
              >
                {isSelected && <Check className="size-3" strokeWidth={3} />}
              </span>
            </button>
          );
        })}
      </div>
      {error && <FieldError message={error} />}
    </div>
  );
}
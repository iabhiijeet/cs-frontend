"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, SkipForward, Sparkle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface StepShellProps {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
  onBack: () => void;
  onContinue: () => void;
  continueLabel?: string;
  continueDisabled?: boolean;
  showBack?: boolean;
  skipLabel?: string;
  onSkip?: () => void;
  pips?: {
    total: number;
    current: number;
    onSelect?: (index: number) => void;
  };
}

export function StepShell({
  eyebrow,
  title,
  description,
  children,
  onBack,
  onContinue,
  continueLabel = "Continue",
  continueDisabled,
  showBack = true,
  skipLabel,
  onSkip,
  pips,
}: StepShellProps) {
  const [fromSetup, setFromSetup] = React.useState(false);
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setFromSetup(!!localStorage.getItem("setup_return"));
    }
  }, []);

  return (
    <div className="flex min-h-screen flex-col font-sans antialiased bg-gradient-to-b from-[#f0fbf9] via-[#f8fafc] to-[#edf9f7] text-slate-900">
      {/* ── Top Bar ── */}
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-teal-100/90 bg-white/85 px-6 sm:px-10 backdrop-blur-md">
        <Link href="/" className="inline-flex items-center gap-3 group">
          <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200 p-1.5 shadow-2xs group-hover:border-teal-400 transition-colors">
            <Image
              src="/cr.webp"
              alt="CarbonSynq"
              width={26}
              height={26}
              className="size-5.5 object-contain"
              unoptimized
            />
          </div>
          <div>
            <span className="text-base font-extrabold tracking-tight text-slate-900 block leading-none">
              CarbonSynq
            </span>
            <span className="text-[9.5px] font-bold tracking-wider uppercase bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mt-0.5 block">
              Workspace Setup
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/setup"
            className="text-xs font-semibold text-slate-600 hover:text-teal-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-teal-50/60"
          >
            Exit to Setup
          </Link>
        </div>
      </header>

      {/* ── Main Step Content ── */}
      <div className="mx-auto w-full max-w-[760px] flex-1 px-4 pb-20 pt-8 sm:px-6 sm:pt-10">
        <header className="mb-6">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-teal-200/90 bg-gradient-to-r from-teal-50 via-cyan-50 to-teal-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-teal-900 shadow-2xs mb-2.5">
            <Sparkle className="size-3 text-teal-600" />
            <span>{eyebrow}</span>
          </div>

          <h1 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            {title}
          </h1>
          <p className="mt-2 max-w-xl text-xs sm:text-sm leading-relaxed text-slate-600">
            {description}
          </p>

          {/* Progress Pips */}
          {pips && pips.total > 1 && (
            <div className="mt-5 flex items-center gap-3">
              <div className="flex flex-1 gap-1.5">
                {Array.from({ length: pips.total }).map((_, i) => {
                  const isDone = i < pips.current;
                  const isCurrent = i === pips.current;
                  return (
                    <button
                      key={i}
                      type="button"
                      aria-label={`Part ${i + 1} of ${pips.total}`}
                      aria-current={isCurrent ? "step" : undefined}
                      disabled={!pips.onSelect}
                      onClick={() => pips.onSelect?.(i)}
                      className={cn(
                        "h-2 flex-1 rounded-full transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-teal-500/30",
                        isCurrent
                          ? "bg-gradient-to-r from-teal-600 via-cyan-500 to-sky-500 shadow-[0_0_8px_rgba(13,148,136,0.35)]"
                          : isDone
                            ? "bg-teal-400/60 hover:bg-teal-400"
                            : "bg-slate-200 hover:bg-slate-300",
                        pips.onSelect && "cursor-pointer"
                      )}
                    />
                  );
                })}
              </div>
              <span className="shrink-0 text-xs font-bold tabular-nums text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">
                Part {pips.current + 1} of {pips.total}
              </span>
            </div>
          )}
        </header>

        {/* Form Card Container */}
        <div className="rounded-2xl border border-teal-100/90 bg-white/95 backdrop-blur-xl p-5 sm:p-7 shadow-[0_8px_30px_rgba(13,148,136,0.06)] space-y-6">
          {children}
        </div>
      </div>

      {/* ── Sticky Bottom Action Bar ── */}
      <div className="sticky bottom-0 z-30 border-t border-teal-100/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-[760px] items-center justify-between gap-3 px-4 sm:px-6">
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={onBack}
            className={!showBack ? "invisible" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-bold text-xs"}
            aria-label="Go back"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>

          <div className="flex items-center gap-2.5">
            {skipLabel && onSkip && (
              <Button
                type="button"
                variant="ghost"
                size="lg"
                onClick={onSkip}
                className="text-slate-500 hover:text-slate-800 text-xs font-semibold"
              >
                <SkipForward className="size-4" />
                {skipLabel}
              </Button>
            )}
            <motion.div whileTap={{ scale: 0.98 }}>
              <Button
                type="button"
                size="lg"
                onClick={onContinue}
                disabled={continueDisabled}
                className="h-10.5 px-6 rounded-xl bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600 text-white font-bold text-xs shadow-[0_4px_16px_rgba(13,148,136,0.25)] hover:from-teal-500 hover:via-cyan-500 hover:to-sky-500 active:scale-[0.99] cursor-pointer"
              >
                <span>{continueLabel}</span>
                <ArrowRight className="size-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
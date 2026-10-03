"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  ChevronRight,
  FileCheck2,
  Plug,
  Sparkle,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { OrgType } from "../_types/onboarding";

interface WelcomeScreenProps {
  onStart: () => void;
  orgType?: OrgType;
}

interface StepCard {
  icon: React.ElementType;
  step: string;
  category: string;
  title: string;
  description: string;
  gradient: string;
}

const COMPANY_STEPS: StepCard[] = [
  {
    icon: Building2,
    step: "01",
    category: "Entity Identity",
    title: "Tell us about your company",
    description: "Legal entity, employee headcount, and primary industry to anchor reporting.",
    gradient: "from-teal-600 to-cyan-600",
  },
  {
    icon: Plug,
    step: "02",
    category: "Operations & Facilities",
    title: "Map your operations & data",
    description: "Locations, fleet operations, and data sources where your meter records live.",
    gradient: "from-cyan-600 to-sky-600",
  },
  {
    icon: FileCheck2,
    step: "03",
    category: "Compliance Baseline",
    title: "Configure reporting & targets",
    description: "GHG Protocol, BRSR frameworks, fiscal calendars, and emissions targets.",
    gradient: "from-teal-600 to-emerald-600",
  },
];

const UNIVERSITY_STEPS: StepCard[] = [
  {
    icon: Building2,
    step: "01",
    category: "Institution Profile",
    title: "Tell us about your institution",
    description: "University type, student enrollment, and campus count to anchor your baseline.",
    gradient: "from-teal-600 to-cyan-600",
  },
  {
    icon: Plug,
    step: "02",
    category: "Campus Infrastructure",
    title: "Map your campus operations",
    description: "Buildings, student transit, laboratory facilities, and utility meter integrations.",
    gradient: "from-cyan-600 to-sky-600",
  },
  {
    icon: FileCheck2,
    step: "03",
    category: "Compliance Baseline",
    title: "Configure reporting & targets",
    description: "GHG Protocol, STARS/BRSR rankings, fiscal year, and net-zero targets.",
    gradient: "from-teal-600 to-emerald-600",
  },
];

const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function WelcomeScreen({ onStart, orgType = "company" }: WelcomeScreenProps) {
  const isUniversity = orgType === "university";
  const STEPS = isUniversity ? UNIVERSITY_STEPS : COMPANY_STEPS;
  const subtitle = isUniversity
    ? "Answer a few quick questions to configure your institution's carbon accounting workspace in under five minutes."
    : "Answer a few quick questions to configure your organization's carbon accounting workspace in under five minutes.";

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-b from-[#f0fbf9] via-[#f8fafc] to-[#edf9f7] px-4 py-12 text-slate-900 overflow-hidden font-sans">
      {/* Background Ambient Glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -left-[10%] top-[-10%] h-[550px] w-[550px] rounded-full bg-gradient-to-br from-teal-400/18 via-cyan-400/12 to-transparent blur-[140px]" />
        <div className="absolute right-[-5%] top-[15%] h-[520px] w-[520px] rounded-full bg-gradient-to-bl from-sky-400/18 via-teal-300/12 to-transparent blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[30%] h-[480px] w-[480px] rounded-full bg-emerald-300/12 blur-[130px]" />
        <div
          className="absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1.5px 1.5px, rgba(13,148,136,0.12) 1.5px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-[640px]"
      >
        {/* Brand Logo & Eyebrow */}
        <motion.div variants={item} className="flex flex-col items-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200 p-2.5 shadow-xs mb-4">
            <Image
              src="/cr.webp"
              alt="CarbonSynq logo"
              width={40}
              height={40}
              unoptimized
              className="size-9 object-contain"
            />
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-teal-200/90 bg-gradient-to-r from-teal-50 via-cyan-50 to-teal-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-teal-900 shadow-2xs">
            <Sparkle className="size-3 text-teal-600" />
            <span>Workspace Setup Guide</span>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={item}
          className="mt-4 text-center text-3xl sm:text-4xl font-black tracking-tight text-slate-900"
        >
          Welcome to{" "}
          <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600 bg-clip-text text-transparent">
            CarbonSynq
          </span>
        </motion.h1>

        <motion.p
          variants={item}
          className="mx-auto mt-2.5 max-w-md text-center text-xs sm:text-sm leading-relaxed text-slate-600"
        >
          {subtitle}
        </motion.p>

        {/* Step Cards List */}
        <motion.div variants={item} className="mt-8 space-y-3">
          {STEPS.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.step}
                className="group flex items-center gap-4 rounded-2xl border border-teal-100/90 bg-white/95 p-4 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-[0_8px_30px_rgba(13,148,136,0.12)]"
              >
                {/* Gradient Step Badge */}
                <span
                  className={`flex size-10.5 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${card.gradient} text-white shadow-2xs`}
                >
                  <Icon className="size-5" />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700 bg-teal-50 border border-teal-200/80 px-1.5 py-0.5 rounded">
                      Step {card.step} · {card.category}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    {card.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-slate-600">
                    {card.description}
                  </p>
                </div>

                <ChevronRight className="size-4 shrink-0 text-slate-400 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-teal-600" />
              </div>
            );
          })}
        </motion.div>

        {/* CTA Actions */}
        <motion.div variants={item} className="mt-8 flex flex-col items-center gap-3">
          <Button
            size="lg"
            onClick={onStart}
            className="group h-11 w-full max-w-[19rem] rounded-xl bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600 text-white font-bold text-sm shadow-[0_8px_25px_rgba(13,148,136,0.3)] hover:from-teal-500 hover:via-cyan-500 hover:to-sky-500 hover:shadow-[0_12px_32px_rgba(13,148,136,0.35)] active:scale-[0.99] cursor-pointer"
          >
            <span>Start Workspace Setup</span>
            <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Button>

          <Link
            href="/"
            className="text-xs font-semibold text-slate-500 transition-colors hover:text-teal-700"
          >
            Back to homepage
          </Link>
        </motion.div>

        <motion.div
          variants={item}
          className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-slate-400 font-medium"
        >
          <ShieldCheck className="size-3.5 text-teal-600" />
          <span>Progress is saved automatically as you complete each section.</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
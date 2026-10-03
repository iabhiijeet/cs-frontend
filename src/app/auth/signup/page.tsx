"use client";
import { useState } from "react";
import Link from "next/link";
import { ShieldCheck, EnvelopeSimple, ArrowLeft } from "@phosphor-icons/react";

export default function SignUpPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-teal-50/30 to-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-center">
          <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 border border-teal-100">
            <ShieldCheck size={28} className="text-teal-600" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Account Access</h1>
          <p className="mt-3 text-sm text-slate-500 leading-relaxed">
            CarbonSynq is an invite-only platform. New accounts are created by your university administrator.
          </p>

          <div className="mt-6 rounded-xl bg-teal-50 border border-teal-100 p-4 text-left">
            <p className="text-sm font-semibold text-teal-800 mb-2">To get access:</p>
            <ol className="text-sm text-teal-700 space-y-1.5 list-decimal list-inside">
              <li>Contact your university sustainability admin</li>
              <li>Request an account with your official email</li>
              <li>Admin will send your login credentials</li>
            </ol>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Forgot your password?</p>
            <Link href="/auth/recover" className="inline-flex items-center gap-2 text-sm font-semibold text-teal-600 hover:text-teal-700">
              Reset Password
            </Link>
          </div>

          <Link href="/auth/signin" className="mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors">
            <ArrowLeft size={14} /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, EnvelopeSimple, CheckCircle, Key } from "@phosphor-icons/react";
import { requestPasswordRecovery } from "@/lib/api";

export default function RecoverPage() {
  const [step, setStep] = useState<"request" | "sent">("request");
  const [email, setEmail] = useState("");
  const [tenantId, setTenantId] = useState(process.env.NEXT_PUBLIC_TENANT_ID ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !tenantId.trim()) return;
    setLoading(true); setError("");
    try {
      const res = await requestPasswordRecovery({ tenantId: tenantId.trim(), email: email.trim() });
      if (!res.ok) {
        setError(res.data?.error?.message ?? "Failed to send recovery email. Check your email and try again.");
        return;
      }
      setStep("sent");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-teal-50/30 to-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          {step === "request" ? (
            <>
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 border border-teal-100">
                <Key size={28} className="text-teal-600" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">Reset Password</h1>
              <p className="mt-2 text-sm text-slate-500">Enter your work email and we will send a password reset link.</p>

              {error && (
                <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Work Email *</label>
                  <div className="relative">
                    <EnvelopeSimple size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      required type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@university.edu"
                      className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                {!process.env.NEXT_PUBLIC_TENANT_ID && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">University ID (Tenant ID) *</label>
                    <input
                      required
                      value={tenantId}
                      onChange={e => setTenantId(e.target.value)}
                      placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <p className="mt-1 text-xs text-slate-400">Contact your admin if you don't have this.</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full h-11 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold disabled:opacity-60 transition-colors"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 border border-green-100">
                <CheckCircle size={28} className="text-green-600" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">Check your email</h1>
              <p className="mt-2 text-sm text-slate-500">
                If an account exists for <span className="font-semibold text-slate-700">{email}</span>, a password reset link has been sent.
              </p>
              <div className="mt-6 rounded-xl bg-slate-50 border border-slate-100 p-4 text-sm text-slate-600">
                <p className="font-semibold text-slate-700 mb-1">Next steps:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Check your inbox and spam folder</li>
                  <li>Click the reset link in the email</li>
                  <li>Set a new password</li>
                </ol>
              </div>
              <button onClick={() => setStep("request")} className="mt-6 text-sm font-semibold text-teal-600 hover:text-teal-700">
                Try a different email
              </button>
            </>
          )}

          <div className="mt-6 border-t border-slate-100 pt-4">
            <Link href="/auth/signin" className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors">
              <ArrowLeft size={14} /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
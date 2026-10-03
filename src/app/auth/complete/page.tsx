"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { LockSimple, CheckCircle, Eye, EyeSlash, ArrowRight } from "@phosphor-icons/react";
import { completePasswordRecovery } from "@/lib/api";

function CompletePasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const strength = newPassword.length === 0 ? 0 : newPassword.length < 6 ? 1 : newPassword.length < 10 ? 2 : /[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword) ? 4 : 3;
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColor = ["", "bg-red-400", "bg-yellow-400", "bg-blue-400", "bg-green-500"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { setError("Passwords do not match."); return; }
    if (newPassword.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (!token) { setError("Invalid or expired reset link."); return; }
    setLoading(true); setError("");
    try {
      const res = await completePasswordRecovery({ token, newPassword });
      if (!res.ok) { setError(res.data?.error?.message ?? "Failed to reset password. The link may have expired."); return; }
      setDone(true);
      setTimeout(() => router.push("/auth/signin"), 3000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center">
        <p className="text-sm text-red-600 font-semibold">Invalid reset link.</p>
        <Link href="/auth/recover" className="mt-4 block text-sm text-teal-600 font-semibold hover:text-teal-700">Request a new link</Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 border border-green-100">
          <CheckCircle size={28} className="text-green-600" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Password Reset!</h2>
        <p className="mt-2 text-sm text-slate-500">Redirecting to sign in...</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 border border-teal-100">
        <LockSimple size={28} className="text-teal-600" />
      </div>
      <h1 className="text-xl font-bold text-slate-900">Set New Password</h1>
      <p className="mt-2 text-sm text-slate-500">Choose a strong password for your account.</p>

      {error && <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">New Password *</label>
          <div className="relative">
            <LockSimple size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              required type={showPass ? "text" : "password"}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Min. 8 characters"
              className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              {showPass ? <EyeSlash size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {newPassword && (
            <div className="mt-2">
              <div className="flex gap-1">
                {[1,2,3,4].map(i => <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= strength ? strengthColor[strength] : "bg-slate-200"}`} />)}
              </div>
              <p className="text-xs text-slate-500 mt-1">{strengthLabel[strength]}</p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Confirm Password *</label>
          <div className="relative">
            <LockSimple size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              required type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Repeat password"
              className={`w-full rounded-xl border pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 ${confirmPassword && newPassword !== confirmPassword ? "border-red-300 focus:ring-red-400 bg-red-50" : "border-slate-200 bg-white focus:ring-teal-500"}`}
            />
          </div>
          {confirmPassword && newPassword !== confirmPassword && <p className="text-xs text-red-500 mt-1">Passwords do not match</p>}
        </div>

        <button
          type="submit"
          disabled={loading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
          className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold disabled:opacity-60 transition-colors"
        >
          {loading ? "Resetting..." : <><span>Set New Password</span><ArrowRight size={14} /></>}
        </button>
      </form>
    </>
  );
}

export default function CompletePage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-teal-50/30 to-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <Suspense fallback={<div className="flex justify-center py-10"><div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" /></div>}>
            <CompletePasswordForm />
          </Suspense>
          <div className="mt-6 border-t border-slate-100 pt-4">
            <Link href="/auth/signin" className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors">Back to Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
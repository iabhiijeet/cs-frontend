'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { register } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import type { OrgType } from '@/app/onboarding/_types/onboarding';

export default function SignUpForm() {
  const router = useRouter();
  const { setAuth } = useAuth();
  const [orgType, setOrgType] = useState<OrgType>('company');
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    // The existing "Full Name" input maps to the backend's username field.
    const username = String(formData.get('name') || '').trim();
    const email = String(formData.get('email') || '');
    const password = String(formData.get('password') || '');

    try {
      // No organisation details are collected at signup: the backend
      // provisions a placeholder organisation server-side and onboarding
      // names it later.
      const res = await register({ username, email, password });
      if (!res.success || !res.data?.token) {
        setError(res.message || 'Failed to create account');
        setIsPending(false);
        return;
      }
      setAuth(res.data.token, res.data.user);
      // Persist the chosen org type so the onboarding wizard shows the right form.
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('carbonsynq_org_type', orgType);
      }
      // New accounts go straight to their respective onboarding.
      if (orgType === 'university') {
        router.push('/university-intake');
      } else {
        router.push('/onboarding');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}
      className="flex flex-col gap-5 min-h-screen items-center justify-center bg-gray-900">

      <div className="w-sm">
       <h1 className="mt-10 text-center text-2xl/9 font-bold text-white">Create your account</h1>
      </div>

      {/* Organization Type Toggle */}
      <div className="flex flex-col gap-2 w-sm">
        <span className="block text-sm font-medium text-gray-100">I represent a…</span>
        <div className="grid grid-cols-2 gap-2">
          {(['company', 'university'] as OrgType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setOrgType(type)}
              className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-3 text-sm font-medium transition-all ${
                orgType === type
                  ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                  : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:text-gray-300'
              }`}
            >
              {type === 'company' ? (
                <>
                  <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Company
                </>
              ) : (
                <>
                  <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  </svg>
                  University
                </>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className='flex flex-col gap-1.5 w-sm'>
        <label htmlFor="name" className="block text-sm font-medium text-gray-100">Full Name</label>
        <input id="name" name="name" type="text" required placeholder="John Doe"
          className="block rounded-md w-full bg-white/5 px-2 py-1.5 placeholder:text-gray-500 text-white outline-1 outline-white/10  focus:outline-indigo-500"/>
      </div>

      <div className='flex flex-col gap-1.5 w-sm'>
        <label htmlFor="email" className="block text-sm font-medium text-gray-100">Email address</label>
        <input id="email" name="email" type="email" required placeholder="john@my-company.com"
          className="block rounded-md w-full bg-white/5 px-2 py-1.5 placeholder:text-gray-500 text-white outline-1 outline-white/10  focus:outline-indigo-500"/>
      </div>

      <div className='flex flex-col gap-1.5 w-sm'>
        <label htmlFor="password" className="block text-sm font-medium text-gray-100">Password</label>
        <input id="password" name="password" type="password" required placeholder="*****"
          className="block rounded-md w-full bg-white/5 px-2 py-1.5 placeholder:text-gray-500 text-white outline-1 outline-white/10  focus:outline-indigo-500"/>
      </div>

      {error && (
        <div className="rounded-md px-3 py-2 text-sm text-red-500">
          {error}
        </div>
      )}

      <button type="submit" disabled={isPending}
        className="flex w-sm justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-indigo-400">
        {isPending ? "Creating account..." : "Sign up"}
      </button>
    </form>
  );
}

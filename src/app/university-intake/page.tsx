"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * /university-intake is deprecated — the unified /onboarding wizard handles
 * both company and university flows (orgType is read from localStorage).
 * This page redirects immediately to preserve any old bookmarks or links.
 */
export default function UniversityIntakeRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/onboarding");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <p className="text-sm text-muted-foreground">Redirecting to onboarding…</p>
    </div>
  );
}

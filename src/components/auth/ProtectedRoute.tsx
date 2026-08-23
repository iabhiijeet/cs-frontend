"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { CircleNotch } from "@phosphor-icons/react";

// Authentication-only guard (JWT demo). No role-based authorization:
// RBAC will be reintroduced as a separate, backend-driven phase.
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/signin");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#fafafa]">
        <CircleNotch size={32} className="animate-spin text-[#16a34a]" />
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}

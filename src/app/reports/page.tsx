"use client";

import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import ReportsView from "@/components/dashboard/views/ReportsView";

export default function ReportsPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="flex min-h-dvh bg-[#fafafa]">
        <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} active={"reports"} onChange={() => {}} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar
            onMenu={() => setMenuOpen(true)}
            title="Reports"
            subtitle="Sustainability and audit exports"
          />
          <main className="flex-1 px-[20px] py-[24px] md:px-[32px]">
            <div className="mx-auto flex max-w-[1240px] flex-col">
              <ReportsView />
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

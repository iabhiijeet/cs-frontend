import type { Metadata } from "next";

import ProtectedRoute from "@/components/ProtectedRoute";
import { OnboardingWizard } from "./_component/OnboardingWizard";
import "./onboarding.css";

export const metadata: Metadata = {
  title: "Set up your workspace · CarbonSynq",
  description:
    "Configure your organization's carbon accounting workspace in a few minutes.",
};

export default function OnboardingPage() {
  return (
    <ProtectedRoute>
      <main className="onboarding-green bg-background">
        <OnboardingWizard />
      </main>
    </ProtectedRoute>
  );
}

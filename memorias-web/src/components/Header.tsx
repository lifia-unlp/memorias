import React from "react";
import { auth } from "@/auth";
import { systemSettingsService } from "@/lib/services/systemSettingsService";
import { HeaderClient } from "@/components/HeaderClient";

interface HeaderProps {
  activeTab?: "members" | "projects" | "theses" | "scholarships" | "publications";
}

export async function Header({ activeTab }: HeaderProps) {
  const session = await auth();

  const logoSetting = await systemSettingsService.getSetting("logo_url");
  const logoUrl = logoSetting?.value || null;

  const copilotUrl = process.env.COPILOT_URL || process.env.NEXT_PUBLIC_COPILOT_URL || null;

  return (
    <HeaderClient
      session={session}
      logoUrl={logoUrl}
      activeTab={activeTab}
      copilotUrl={copilotUrl}
    />
  );
}

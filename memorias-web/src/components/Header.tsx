import React from "react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { HeaderClient } from "@/components/HeaderClient";

interface HeaderProps {
  activeTab?: "members" | "projects" | "theses" | "scholarships" | "publications";
}

export async function Header({ activeTab }: HeaderProps) {
  const session = await auth();

  const logoSetting = await (prisma as any).systemSetting
    ?.findUnique({ where: { key: "logo_url" } })
    .catch(() => null);
  const logoUrl = logoSetting?.value || null;

  return (
    <HeaderClient
      session={session}
      logoUrl={logoUrl}
      activeTab={activeTab}
    />
  );
}

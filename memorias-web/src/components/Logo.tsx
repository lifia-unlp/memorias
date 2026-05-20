import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export async function Logo() {
  const logoSetting = await (prisma as any).systemSetting
    ?.findUnique({ where: { key: "logo_url" } })
    .catch(() => null);
  const logoUrl = logoSetting?.value || "";

  return (
    <Link href="/" className="hover:opacity-90 transition-all duration-200 flex items-center shrink-0">
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl}
          alt="Logo"
          className="h-10 w-auto object-contain"
        />
      ) : (
        <span className="text-sm font-semibold text-slate-400 italic">
          (your logo here)
        </span>
      )}
    </Link>
  );
}

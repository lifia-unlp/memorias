"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function saveSystemSettings(formData: FormData) {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN" || !session.user?.active) {
    throw new Error("Unauthorized: Only administrators can update system settings.");
  }

  const welcomeTitle = (formData.get("welcomeTitle") as string) || "";
  const welcomeSubtitle = (formData.get("welcomeSubtitle") as string) || "";
  const logoUrl = (formData.get("logoUrl") as string) || "";
  const labName = (formData.get("labName") as string) || "";
  const labUrl = (formData.get("labUrl") as string) || "";

  const systemSetting = (prisma as any).systemSetting;
  if (!systemSetting) {
    throw new Error("System settings persistence is temporarily out of sync because Next.js has cached the old database client globally. Please restart your Next.js dev server.");
  }

  // Perform safe upserts
  await prisma.$transaction([
    prisma.systemSetting.upsert({
      where: { key: "welcome_title" },
      update: { value: welcomeTitle },
      create: { key: "welcome_title", value: welcomeTitle },
    }),
    prisma.systemSetting.upsert({
      where: { key: "welcome_subtitle" },
      update: { value: welcomeSubtitle },
      create: { key: "welcome_subtitle", value: welcomeSubtitle },
    }),
    prisma.systemSetting.upsert({
      where: { key: "logo_url" },
      update: { value: logoUrl },
      create: { key: "logo_url", value: logoUrl },
    }),
    prisma.systemSetting.upsert({
      where: { key: "lab_name" },
      update: { value: labName },
      create: { key: "lab_name", value: labName },
    }),
    prisma.systemSetting.upsert({
      where: { key: "lab_url" },
      update: { value: labUrl },
      create: { key: "lab_url", value: labUrl },
    }),
  ]);

  // Log to Audit Log
  await prisma.auditLog.create({
    data: {
      action: "UPDATE",
      entityType: "SystemSetting",
      entityId: "system_configuration",
      entitySlug: "system-config",
      userId: session.user.id || null,
      userEmail: session.user.email || "Unknown Admin",
      details: `Updated home welcome title: "${welcomeTitle.slice(0, 40)}...", subtitle: "${welcomeSubtitle.slice(0, 40)}...", lab name: "${labName}", and lab URL: "${labUrl}".`,
    },
  });

  // Revalidate caching
  revalidatePath("/");
  revalidatePath("/admin/config");

}

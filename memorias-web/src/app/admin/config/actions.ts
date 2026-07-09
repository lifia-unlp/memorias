"use server";

import { auth } from "@/auth";
import { systemSettingsService } from "@/lib/services/systemSettingsService";
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
  const requireUserActivation = formData.get("requireUserActivation") === "on" || formData.get("requireUserActivation") === "true" ? "true" : "false";

  // Perform settings updates and log audit log via systemSettingsService
  await systemSettingsService.saveSettings(
    {
      welcome_title: welcomeTitle,
      welcome_subtitle: welcomeSubtitle,
      logo_url: logoUrl,
      lab_name: labName,
      lab_url: labUrl,
      require_user_activation: requireUserActivation,
    },
    {
      id: session.user.id || null,
      email: session.user.email || "Unknown Admin",
    }
  );

  // Revalidate caching
  revalidatePath("/");
  revalidatePath("/admin/config");
}

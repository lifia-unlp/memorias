"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateUserPreferences(formData: FormData) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return { success: false, error: "Unauthorized. Session required." };
    }

    const notificationEmail = formData.get("notificationEmail") as string || null;
    const avatarUrl = formData.get("avatarUrl") as string || null;
    const digestEmails = formData.get("digestEmails") === "true";
    const immediateNotifications = formData.get("immediateNotifications") === "true";

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        notificationEmail,
        avatarUrl,
        digestEmails,
        immediateNotifications,
      },
    });

    revalidatePath("/preferences");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to save user preferences." };
  }
}

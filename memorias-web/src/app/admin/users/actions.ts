"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/email";
import { getLabName } from "@/lib/config";

async function ensureAdmin() {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN" || !session.user?.active) {
    throw new Error("Unauthorized. Active Administrator session required.");
  }
}

export async function toggleUserActivationAction(formData: FormData) {
  await ensureAdmin();
  
  const userId = formData.get("userId") as string;
  if (!userId) throw new Error("User ID is required");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { active: true },
  });
  
  if (!user) throw new Error("User not found");
  
  await prisma.user.update({
    where: { id: userId },
    data: { active: !user.active },
  });
  
  revalidatePath("/admin/users");
}

export async function updateUserRoleAction(formData: FormData) {
  await ensureAdmin();
  
  const userId = formData.get("userId") as string;
  const role = formData.get("role") as "USER" | "EDITOR" | "POWER_EDITOR" | "ADMIN";
  
  if (!userId || !role) throw new Error("User ID and Role are required");
  
  await prisma.user.update({
    where: { id: userId },
    data: { role },
  });
  
  revalidatePath("/admin/users");
}

export async function deleteUserAction(formData: FormData) {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN" || !session.user?.active) {
    throw new Error("Unauthorized. Active Administrator session required.");
  }
  
  const userId = formData.get("userId") as string;
  if (!userId) throw new Error("User ID is required");

  if (session.user.id === userId) {
    throw new Error("Cannot delete your own admin account.");
  }

  await prisma.user.delete({
    where: { id: userId },
  });

  revalidatePath("/admin/users");
}

export async function updateUserMemberAction(formData: FormData) {
  await ensureAdmin();
  
  const userId = formData.get("userId") as string;
  const memberId = (formData.get("memberId") as string) || null;
  
  if (!userId) throw new Error("User ID is required");

  // Check if memberId is already assigned to another user
  if (memberId) {
    const existingUser = await prisma.user.findFirst({
      where: {
        memberId,
        id: { not: userId },
      },
    });
    if (existingUser) {
      throw new Error(`This member is already assigned to user: ${existingUser.email}`);
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      memberId: memberId || null,
    },
  });

  revalidatePath("/admin/users");
}

export async function sendUserEmailAction(formData: FormData) {
  await ensureAdmin();

  const recipientType = formData.get("recipientType") as "individual" | "all_active";
  const subject = formData.get("subject") as string;
  const message = formData.get("message") as string;

  if (!recipientType || !subject || !message) {
    throw new Error("Recipient type, subject, and message are required.");
  }

  const labName = await getLabName();

  const portalUrl = process.env.AUTH_URL || "http://localhost:3000";

  const htmlContent = `
    <div style="font-family: sans-serif; font-size: 14px; line-height: 1.5; color: #111111;">
      <div style="white-space: pre-wrap;">${message}</div>
      <p style="margin-top: 25px; border-top: 1px solid #dddddd; padding-top: 15px; font-size: 12px; color: #666666;">
        This email was sent by an administrator from the ${labName} Memorias Portal.<br />
        If you wish to stop receiving these updates, you can customize your alert settings at any time in your <a href="${portalUrl}/preferences" style="color: #1976d2; text-decoration: underline;">User Preferences</a>.
      </p>
    </div>
  `;

  if (recipientType === "individual") {
    const userId = formData.get("userId") as string;
    if (!userId) throw new Error("User ID is required for direct email.");

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user) throw new Error("User not found.");

    const res = await sendEmail({
      to: user.email,
      subject,
      html: htmlContent,
    });

    if (!res.success) {
      throw new Error(res.error?.message || "Failed to send email.");
    }

    return { success: true, count: 1 };
  } else if (recipientType === "all_active") {
    const activeUsers = await prisma.user.findMany({
      where: { active: true },
      select: { email: true },
    });

    if (activeUsers.length === 0) {
      return { success: true, count: 0 };
    }

    const sendPromises = activeUsers.map(async (u) => {
      try {
        const res = await sendEmail({
          to: u.email,
          subject,
          html: htmlContent,
        });
        return { email: u.email, success: res.success };
      } catch (err) {
        console.error(`Failed to send email to ${u.email}:`, err);
        return { email: u.email, success: false };
      }
    });

    const results = await Promise.all(sendPromises);
    const successCount = results.filter((r) => r.success).length;

    if (successCount === 0 && activeUsers.length > 0) {
      throw new Error("Failed to send broadcast emails to any active users.");
    }

    return { success: true, count: successCount };
  } else {
    throw new Error("Invalid recipient type specified.");
  }
}

"use server";

import { auth } from "@/auth";
import { adminUserService } from "@/lib/services/adminUserService";
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

  await adminUserService.toggleUserActivation(userId);
  
  revalidatePath("/admin/users");
}

export async function updateUserRoleAction(formData: FormData) {
  await ensureAdmin();
  
  const userId = formData.get("userId") as string;
  const role = formData.get("role") as "USER" | "EDITOR" | "POWER_EDITOR" | "ADMIN";
  
  if (!userId || !role) throw new Error("User ID and Role are required");
  
  await adminUserService.updateUserRole(userId, role);
  
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

  await adminUserService.deleteUser(userId);

  revalidatePath("/admin/users");
}

export async function updateUserMemberAction(formData: FormData) {
  await ensureAdmin();
  
  const userId = formData.get("userId") as string;
  const memberId = (formData.get("memberId") as string) || null;
  
  if (!userId) throw new Error("User ID is required");

  await adminUserService.updateUserMember(userId, memberId);

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

    const email = await adminUserService.getUserEmail(userId);

    if (!email) throw new Error("User not found or has no email.");

    const res = await sendEmail({
      to: email,
      subject,
      html: htmlContent,
    });

    if (!res.success) {
      throw new Error(res.error?.message || "Failed to send email.");
    }

    return { success: true, count: 1 };
  } else if (recipientType === "all_active") {
    const activeEmails = await adminUserService.getActiveUserEmails();

    if (activeEmails.length === 0) {
      return { success: true, count: 0 };
    }

    const sendPromises = activeEmails.map(async (email) => {
      try {
        const res = await sendEmail({
          to: email,
          subject,
          html: htmlContent,
        });
        return { email, success: res.success };
      } catch (err) {
        console.error(`Failed to send email to ${email}:`, err);
        return { email, success: false };
      }
    });

    const results = await Promise.all(sendPromises);
    const successCount = results.filter((r) => r.success).length;

    if (successCount === 0 && activeEmails.length > 0) {
      throw new Error("Failed to send broadcast emails to any active users.");
    }

    return { success: true, count: successCount };
  } else {
    throw new Error("Invalid recipient type specified.");
  }
}

"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
  const role = formData.get("role") as "USER" | "EDITOR" | "ADMIN";
  
  if (!userId || !role) throw new Error("User ID and Role are required");
  
  await prisma.user.update({
    where: { id: userId },
    data: { role },
  });
  
  revalidatePath("/admin/users");
}

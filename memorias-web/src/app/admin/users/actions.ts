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

export async function toggleUserActivation(userId: string) {
  await ensureAdmin();
  
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

export async function updateUserRole(userId: string, role: "USER" | "EDITOR" | "ADMIN") {
  await ensureAdmin();
  
  await prisma.user.update({
    where: { id: userId },
    data: { role },
  });
  
  revalidatePath("/admin/users");
}

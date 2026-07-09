"use server";

import { systemOptionsService } from "@/lib/services/systemOptionsService";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// Ensure current user is active ADMIN
async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.active || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized: ADMIN access required");
  }
}

// 1. Get options for a given listName (Read-only, anyone can read)
export async function getOptions(listName: string) {
  try {
    const options = await systemOptionsService.getOptions(listName);
    return { success: true, options };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 2. Create an option
export async function createOption(listName: string, value: string) {
  try {
    await requireAdmin();
    const cleanValue = value.trim();
    if (!cleanValue) throw new Error("Value cannot be empty");

    const option = await systemOptionsService.createOption(listName, cleanValue);

    revalidatePath("/admin/lists");
    return { success: true, option };
  } catch (error: any) {
    if (error.code === "P2002") {
      return { success: false, error: "This option already exists in this list" };
    }
    return { success: false, error: error.message };
  }
}

// 3. Count usages of an option in referenced models
export async function checkOptionUsage(listName: string, value: string) {
  try {
    await requireAdmin();
    const count = await systemOptionsService.checkOptionUsage(listName, value);
    return { success: true, count };
  } catch (error: any) {
    return { success: false, error: error.message, count: 0 };
  }
}

// 4. Safe Delete Option (with bulk reassignment / clearing)
export async function deleteOptionSafe(id: string, replacementValue?: string | null) {
  try {
    await requireAdmin();
    await systemOptionsService.deleteOptionSafe(id, replacementValue);

    revalidatePath("/admin/lists");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

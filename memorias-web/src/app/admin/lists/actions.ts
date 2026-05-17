"use server";

import { prisma } from "@/lib/prisma";
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
    const options = await prisma.systemOption.findMany({
      where: { listName },
      orderBy: { value: "asc" },
    });
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

    const option = await prisma.systemOption.create({
      data: { listName, value: cleanValue },
    });

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
    let count = 0;

    switch (listName) {
      case "positionAtLab":
        count = await prisma.member.count({ where: { positionAtLab: value } });
        break;
      case "positionAtUnlp":
        count = await prisma.member.count({ where: { positionAtUnlp: value } });
        break;
      case "positionAtCIC":
        count = await prisma.member.count({ where: { positionAtCIC: value } });
        break;
      case "positionAtCONICET":
        count = await prisma.member.count({ where: { positionAtCONICET: value } });
        break;
      case "thesisLevel":
        count = await prisma.thesis.count({ where: { level: value } });
        break;
      case "scholarshipType":
        count = await prisma.scholarship.count({ where: { type: value } });
        break;
      default:
        throw new Error("Invalid list name");
    }

    return { success: true, count };
  } catch (error: any) {
    return { success: false, error: error.message, count: 0 };
  }
}

// 4. Safe Delete Option (with bulk reassignment / clearing)
export async function deleteOptionSafe(id: string, replacementValue?: string | null) {
  try {
    await requireAdmin();

    const option = await prisma.systemOption.findUnique({
      where: { id },
    });

    if (!option) {
      throw new Error("System option not found");
    }

    const { listName, value } = option;

    // Run reassignments and delete option in an atomic transaction
    await prisma.$transaction(async (tx) => {
      const updateData = {
        [listName === "thesisLevel" ? "level" : listName === "scholarshipType" ? "type" : listName]: replacementValue || null,
      };

      switch (listName) {
        case "positionAtLab":
          await tx.member.updateMany({
            where: { positionAtLab: value },
            data: { positionAtLab: replacementValue || null },
          });
          break;
        case "positionAtUnlp":
          await tx.member.updateMany({
            where: { positionAtUnlp: value },
            data: { positionAtUnlp: replacementValue || null },
          });
          break;
        case "positionAtCIC":
          await tx.member.updateMany({
            where: { positionAtCIC: value },
            data: { positionAtCIC: replacementValue || null },
          });
          break;
        case "positionAtCONICET":
          await tx.member.updateMany({
            where: { positionAtCONICET: value },
            data: { positionAtCONICET: replacementValue || null },
          });
          break;
        case "thesisLevel":
          await tx.thesis.updateMany({
            where: { level: value },
            data: { level: replacementValue || null },
          });
          break;
        case "scholarshipType":
          await tx.scholarship.updateMany({
            where: { type: value },
            data: { type: replacementValue || null },
          });
          break;
        default:
          throw new Error("Invalid list name in transaction");
      }

      // Delete the option
      await tx.systemOption.delete({
        where: { id },
      });
    });

    revalidatePath("/admin/lists");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

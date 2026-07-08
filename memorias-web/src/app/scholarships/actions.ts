"use server";

import { revalidatePath } from "next/cache";
import { logAction } from "@/lib/audit";
import { ensureEditorOrAdmin } from "@/lib/auth-helpers";
import { scholarshipService } from "@/lib/services/scholarshipService";
import { parseScholarshipFormData } from "@/lib/mappers";

export async function createScholarship(formData: FormData) {
  try {
    await ensureEditorOrAdmin();

    const ignoreCheck = formData.get("ignoreDuplicateCheck") === "true";
    const input = parseScholarshipFormData(formData);

    const scholarship = await scholarshipService.create(input, ignoreCheck);

    await logAction("CREATE", "Scholarship", scholarship.id, scholarship.slug, `Created scholarship: ${scholarship.title}`);

    revalidatePath("/scholarships");
    return { success: true };
  } catch (err: any) {
    if (err.message === "DUPLICATE_TITLE") {
      const title = formData.get("title") as string;
      return {
        success: false,
        duplicate: true,
        error: `A scholarship titled "${title}" already exists.`,
      };
    }
    return { success: false, error: err?.message || "Failed to create scholarship." };
  }
}

export async function updateScholarship(scholarshipId: string, formData: FormData) {
  try {
    await ensureEditorOrAdmin();

    const input = parseScholarshipFormData(formData);
    if (!input.slug) {
      return { success: false, error: "Scholarship Title and Slug are required." };
    }

    const ignoreCheck = formData.get("ignoreDuplicateCheck") === "true";

    const scholarship = await scholarshipService.update(scholarshipId, input, ignoreCheck);

    await logAction("UPDATE", "Scholarship", scholarship.id, scholarship.slug, `Updated scholarship: ${scholarship.title}`);

    revalidatePath("/scholarships");
    revalidatePath(`/scholarships/${input.slug}`);
    return { success: true };
  } catch (err: any) {
    if (err.message === "DUPLICATE_TITLE") {
      const title = formData.get("title") as string;
      return {
        success: false,
        duplicate: true,
        error: `Another scholarship titled "${title}" already exists.`,
      };
    }
    return { success: false, error: err?.message || "Failed to update scholarship." };
  }
}

export async function deleteScholarship(scholarshipId: string) {
  await ensureEditorOrAdmin();

  const scholarship = await scholarshipService.delete(scholarshipId);

  await logAction("DELETE", "Scholarship", scholarship.id, scholarship.slug, `Deleted scholarship: ${scholarship.title}`);

  revalidatePath("/scholarships");
  return { success: true };
}

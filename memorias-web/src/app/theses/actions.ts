"use server";

import { revalidatePath } from "next/cache";
import { logAction } from "@/lib/audit";
import { ensureEditorOrAdmin } from "@/lib/auth-helpers";
import { thesisService } from "@/lib/services/thesisService";
import { parseThesisFormData } from "@/lib/mappers";

export async function createThesis(formData: FormData) {
  try {
    await ensureEditorOrAdmin();

    const ignoreCheck = formData.get("ignoreDuplicateCheck") === "true";
    const input = parseThesisFormData(formData);

    const thesis = await thesisService.create(input, ignoreCheck);

    await logAction("CREATE", "Thesis", thesis.id, thesis.slug, `Created thesis: ${thesis.title}`);

    revalidatePath("/theses");
    return { success: true };
  } catch (err: any) {
    if (err.message === "DUPLICATE_TITLE") {
      const title = formData.get("title") as string;
      return {
        success: false,
        duplicate: true,
        error: `A thesis titled "${title}" already exists.`,
      };
    }
    return { success: false, error: err?.message || "Failed to create thesis." };
  }
}

export async function updateThesis(thesisId: string, formData: FormData) {
  try {
    await ensureEditorOrAdmin();

    const input = parseThesisFormData(formData);
    if (!input.slug) {
      return { success: false, error: "Thesis Title and Slug are required." };
    }

    const ignoreCheck = formData.get("ignoreDuplicateCheck") === "true";

    const thesis = await thesisService.update(thesisId, input, ignoreCheck);

    await logAction("UPDATE", "Thesis", thesis.id, thesis.slug, `Updated thesis: ${thesis.title}`);

    revalidatePath("/theses");
    revalidatePath(`/theses/${input.slug}`);
    return { success: true };
  } catch (err: any) {
    if (err.message === "DUPLICATE_TITLE") {
      const title = formData.get("title") as string;
      return {
        success: false,
        duplicate: true,
        error: `Another thesis titled "${title}" already exists.`,
      };
    }
    return { success: false, error: err?.message || "Failed to update thesis." };
  }
}

export async function deleteThesis(thesisId: string) {
  await ensureEditorOrAdmin();

  const thesis = await thesisService.delete(thesisId);

  await logAction("DELETE", "Thesis", thesis.id, thesis.slug, `Deleted thesis: ${thesis.title}`);

  revalidatePath("/theses");
  return { success: true };
}

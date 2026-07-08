"use server";

import { revalidatePath } from "next/cache";
import { logAction } from "@/lib/audit";
import { sanitizeTag } from "@/lib/tags";
import { ensureEditorOrAdmin } from "@/lib/auth-helpers";
import { thesisService } from "@/lib/services/thesisService";

export async function createThesis(formData: FormData) {
  try {
    await ensureEditorOrAdmin();

    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;

    if (!title) {
      return { success: false, error: "Thesis Title is required." };
    }

    const ignoreCheck = formData.get("ignoreDuplicateCheck") === "true";
    const startDateStr = formData.get("startDate") as string;
    const endDateStr = formData.get("endDate") as string;
    const progressStr = formData.get("progress") as string;

    const selectedMemberIds = formData.getAll("members") as string[];
    const selectedProjectIds = formData.getAll("projects") as string[];
    const selectedPublicationIds = formData.getAll("publications") as string[];
    const selectedScholarshipIds = formData.getAll("scholarships") as string[];

    const featured = formData.get("featured") === "true";

    const thesis = await thesisService.create({
      title,
      slug: slug || undefined,
      career: (formData.get("career") as string) || null,
      level: (formData.get("level") as string) || null,
      student: (formData.get("student") as string) || null,
      director: (formData.get("director") as string) || null,
      coDirector: (formData.get("coDirector") as string) || null,
      otherAdvisors: (formData.get("otherAdvisors") as string) || null,
      startDate: startDateStr ? new Date(startDateStr) : null,
      endDate: endDateStr ? new Date(endDateStr) : null,
      summary: (formData.get("summary") as string) || null,
      reportUrl: (formData.get("reportUrl") as string) || null,
      progress: progressStr ? parseInt(progressStr, 10) : null,
      keywords: (formData.get("keywords") as string) || null,
      website: (formData.get("website") as string) || null,
      featured,
      tags: formData.get("tags")
        ? (formData.get("tags") as string)
            .split(",")
            .map((t) => sanitizeTag(t))
            .filter(Boolean)
        : [],
      members: selectedMemberIds,
      projects: selectedProjectIds,
      publications: selectedPublicationIds,
      scholarships: selectedScholarshipIds,
    }, ignoreCheck);

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

    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;

    if (!title || !slug) {
      return { success: false, error: "Thesis Title and Slug are required." };
    }

    const ignoreCheck = formData.get("ignoreDuplicateCheck") === "true";
    const startDateStr = formData.get("startDate") as string;
    const endDateStr = formData.get("endDate") as string;
    const progressStr = formData.get("progress") as string;

    const selectedMemberIds = formData.getAll("members") as string[];
    const selectedProjectIds = formData.getAll("projects") as string[];
    const selectedPublicationIds = formData.getAll("publications") as string[];
    const selectedScholarshipIds = formData.getAll("scholarships") as string[];

    const featured = formData.get("featured") === "true";

    const thesis = await thesisService.update(thesisId, {
      title,
      slug,
      career: (formData.get("career") as string) || null,
      level: (formData.get("level") as string) || null,
      student: (formData.get("student") as string) || null,
      director: (formData.get("director") as string) || null,
      coDirector: (formData.get("coDirector") as string) || null,
      otherAdvisors: (formData.get("otherAdvisors") as string) || null,
      startDate: startDateStr ? new Date(startDateStr) : null,
      endDate: endDateStr ? new Date(endDateStr) : null,
      summary: (formData.get("summary") as string) || null,
      reportUrl: (formData.get("reportUrl") as string) || null,
      progress: progressStr ? parseInt(progressStr, 10) : null,
      keywords: (formData.get("keywords") as string) || null,
      website: (formData.get("website") as string) || null,
      featured,
      tags: formData.get("tags")
        ? (formData.get("tags") as string)
            .split(",")
            .map((t) => sanitizeTag(t))
            .filter(Boolean)
        : [],
      members: selectedMemberIds,
      projects: selectedProjectIds,
      publications: selectedPublicationIds,
      scholarships: selectedScholarshipIds,
    }, ignoreCheck);

    await logAction("UPDATE", "Thesis", thesis.id, thesis.slug, `Updated thesis: ${thesis.title}`);

    revalidatePath("/theses");
    revalidatePath(`/theses/${slug}`);
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

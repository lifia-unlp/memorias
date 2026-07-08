"use server";

import { revalidatePath } from "next/cache";
import { logAction } from "@/lib/audit";
import { sanitizeTag } from "@/lib/tags";
import { ensureEditorOrAdmin } from "@/lib/auth-helpers";
import { scholarshipService } from "@/lib/services/scholarshipService";

export async function createScholarship(formData: FormData) {
  try {
    await ensureEditorOrAdmin();

    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;

    if (!title) {
      return { success: false, error: "Scholarship Title is required." };
    }

    const ignoreCheck = formData.get("ignoreDuplicateCheck") === "true";
    const startDateStr = formData.get("startDate") as string;
    const endDateStr = formData.get("endDate") as string;

    const selectedMemberIds = formData.getAll("members") as string[];
    const selectedProjectIds = formData.getAll("projects") as string[];
    const selectedThesisIds = formData.getAll("theses") as string[];

    const scholarship = await scholarshipService.create({
      title,
      slug: slug || undefined,
      type: (formData.get("type") as string) || null,
      student: (formData.get("student") as string) || null,
      director: (formData.get("director") as string) || null,
      coDirector: (formData.get("coDirector") as string) || null,
      fundingAgency: (formData.get("fundingAgency") as string) || null,
      startDate: startDateStr ? new Date(startDateStr) : null,
      endDate: endDateStr ? new Date(endDateStr) : null,
      summary: (formData.get("summary") as string) || null,
      tags: formData.get("tags")
        ? (formData.get("tags") as string)
            .split(",")
            .map((t) => sanitizeTag(t))
            .filter(Boolean)
        : [],
      members: selectedMemberIds,
      projects: selectedProjectIds,
      theses: selectedThesisIds,
    }, ignoreCheck);

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

    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;

    if (!title || !slug) {
      return { success: false, error: "Scholarship Title and Slug are required." };
    }

    const ignoreCheck = formData.get("ignoreDuplicateCheck") === "true";
    const startDateStr = formData.get("startDate") as string;
    const endDateStr = formData.get("endDate") as string;

    const selectedMemberIds = formData.getAll("members") as string[];
    const selectedProjectIds = formData.getAll("projects") as string[];
    const selectedThesisIds = formData.getAll("theses") as string[];

    const scholarship = await scholarshipService.update(scholarshipId, {
      title,
      slug,
      type: (formData.get("type") as string) || null,
      student: (formData.get("student") as string) || null,
      director: (formData.get("director") as string) || null,
      coDirector: (formData.get("coDirector") as string) || null,
      fundingAgency: (formData.get("fundingAgency") as string) || null,
      startDate: startDateStr ? new Date(startDateStr) : null,
      endDate: endDateStr ? new Date(endDateStr) : null,
      summary: (formData.get("summary") as string) || null,
      tags: formData.get("tags")
        ? (formData.get("tags") as string)
            .split(",")
            .map((t) => sanitizeTag(t))
            .filter(Boolean)
        : [],
      members: selectedMemberIds,
      projects: selectedProjectIds,
      theses: selectedThesisIds,
    }, ignoreCheck);

    await logAction("UPDATE", "Scholarship", scholarship.id, scholarship.slug, `Updated scholarship: ${scholarship.title}`);

    revalidatePath("/scholarships");
    revalidatePath(`/scholarships/${slug}`);
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

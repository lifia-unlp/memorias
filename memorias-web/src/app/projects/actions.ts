"use server";

import { revalidatePath } from "next/cache";
import { logAction } from "@/lib/audit";
import { sanitizeTag } from "@/lib/tags";
import { ensureEditorOrAdmin } from "@/lib/auth-helpers";
import { projectService } from "@/lib/services/projectService";

export async function createProject(formData: FormData) {
  try {
    await ensureEditorOrAdmin();

    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;

    if (!title) {
      return { success: false, error: "Project Title is required." };
    }

    const ignoreCheck = formData.get("ignoreDuplicateCheck") === "true";
    const startDateStr = formData.get("startDate") as string;
    const endDateStr = formData.get("endDate") as string;

    if (!startDateStr || !endDateStr) {
      return { success: false, error: "Start Date and End Date are required fields." };
    }

    const selectedMemberIds = formData.getAll("members") as string[];
    const featured = formData.get("featured") === "true";

    const project = await projectService.create({
      title,
      slug: slug || undefined,
      code: (formData.get("code") as string) || null,
      startDate: new Date(startDateStr),
      endDate: new Date(endDateStr),
      director: (formData.get("director") as string) || null,
      coDirector: (formData.get("coDirector") as string) || null,
      responsibleGroup: (formData.get("responsibleGroup") as string) || null,
      fundingAgency: (formData.get("fundingAgency") as string) || null,
      amount: (formData.get("amount") as string) || null,
      summary: (formData.get("summary") as string) || null,
      website: (formData.get("website") as string) || null,
      featured,
      tags: formData.get("tags")
        ? (formData.get("tags") as string)
            .split(",")
            .map((t) => sanitizeTag(t))
            .filter(Boolean)
        : [],
      members: selectedMemberIds,
    }, ignoreCheck);

    await logAction("CREATE", "Project", project.id, project.slug, `Created project: ${project.title}`);

    revalidatePath("/projects");
    return { success: true };
  } catch (err: any) {
    if (err.message === "DUPLICATE_TITLE") {
      const title = formData.get("title") as string;
      return {
        success: false,
        duplicate: true,
        error: `A project titled "${title}" already exists.`,
      };
    }
    return { success: false, error: err?.message || "Failed to create project." };
  }
}

export async function updateProject(projectId: string, formData: FormData) {
  try {
    await ensureEditorOrAdmin();

    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;

    if (!title || !slug) {
      return { success: false, error: "Project Title and Slug are required." };
    }

    const ignoreCheck = formData.get("ignoreDuplicateCheck") === "true";
    const startDateStr = formData.get("startDate") as string;
    const endDateStr = formData.get("endDate") as string;

    if (!startDateStr || !endDateStr) {
      return { success: false, error: "Start Date and End Date are required fields." };
    }

    const selectedMemberIds = formData.getAll("members") as string[];
    const featured = formData.get("featured") === "true";

    const project = await projectService.update(projectId, {
      title,
      slug,
      code: (formData.get("code") as string) || null,
      startDate: new Date(startDateStr),
      endDate: new Date(endDateStr),
      director: (formData.get("director") as string) || null,
      coDirector: (formData.get("coDirector") as string) || null,
      responsibleGroup: (formData.get("responsibleGroup") as string) || null,
      fundingAgency: (formData.get("fundingAgency") as string) || null,
      amount: (formData.get("amount") as string) || null,
      summary: (formData.get("summary") as string) || null,
      website: (formData.get("website") as string) || null,
      featured,
      tags: formData.get("tags")
        ? (formData.get("tags") as string)
            .split(",")
            .map((t) => sanitizeTag(t))
            .filter(Boolean)
        : [],
      members: selectedMemberIds,
    }, ignoreCheck);

    await logAction("UPDATE", "Project", project.id, project.slug, `Updated project: ${project.title}`);

    revalidatePath("/projects");
    revalidatePath(`/projects/${slug}`);
    return { success: true };
  } catch (err: any) {
    if (err.message === "DUPLICATE_TITLE") {
      const title = formData.get("title") as string;
      return {
        success: false,
        duplicate: true,
        error: `Another project titled "${title}" already exists.`,
      };
    }
    return { success: false, error: err?.message || "Failed to update project." };
  }
}

export async function deleteProject(projectId: string) {
  await ensureEditorOrAdmin();

  const blockCheck = await projectService.checkReferentialBlock(projectId);
  if (blockCheck.isBlocked) {
    return {
      success: false,
      error: "REFERENTIAL_BLOCK",
      references: blockCheck.references,
    };
  }

  const project = await projectService.delete(projectId);

  await logAction("DELETE", "Project", project.id, project.slug, `Deleted project: ${project.title}`);

  revalidatePath("/projects");
  return { success: true };
}

"use server";

import { revalidatePath } from "next/cache";
import { logAction } from "@/lib/audit";
import { ensureEditorOrAdmin } from "@/lib/auth-helpers";
import { projectService } from "@/lib/services/projectService";
import { parseProjectFormData } from "@/lib/mappers";

export async function createProject(formData: FormData) {
  try {
    await ensureEditorOrAdmin();

    const ignoreCheck = formData.get("ignoreDuplicateCheck") === "true";
    const input = parseProjectFormData(formData);

    const project = await projectService.create(input, ignoreCheck);

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

    const input = parseProjectFormData(formData);
    if (!input.slug) {
      return { success: false, error: "Project Title and Slug are required." };
    }

    const ignoreCheck = formData.get("ignoreDuplicateCheck") === "true";

    const project = await projectService.update(projectId, input, ignoreCheck);

    await logAction("UPDATE", "Project", project.id, project.slug, `Updated project: ${project.title}`);

    revalidatePath("/projects");
    revalidatePath(`/projects/${input.slug}`);
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

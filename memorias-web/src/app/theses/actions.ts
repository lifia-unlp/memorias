"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { logAction } from "@/lib/audit";
import { sanitizeTag } from "@/lib/tags";

export async function ensureEditorOrAdmin() {
  const session = await auth();
  if (!session || !session.user?.active) {
    throw new Error("Unauthorized. Active session required.");
  }
  const role = session.user.role;
  if (role !== "EDITOR" && role !== "ADMIN") {
    throw new Error("Unauthorized. Editor or Administrator role required.");
  }
}

export async function createThesis(formData: FormData) {
  try {
    await ensureEditorOrAdmin();

    const title = formData.get("title") as string;
    let slug = formData.get("slug") as string;

    if (!title) {
      return { success: false, error: "Thesis Title is required." };
    }

    // Duplicate Check
    const ignoreCheck = formData.get("ignoreDuplicateCheck") === "true";
    if (!ignoreCheck) {
      const duplicate = await prisma.thesis.findFirst({
        where: {
          title: { equals: title, mode: "insensitive" },
        },
      });
      if (duplicate) {
        return {
          success: false,
          duplicate: true,
          error: `A thesis titled "${title}" already exists.`,
        };
      }
    }

    if (!slug) {
      slug = title
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // remove accents
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    // Ensure unique slug
    const existing = await prisma.thesis.findUnique({ where: { slug } });
    if (existing) {
      return { success: false, error: `The slug '${slug}' is already taken. Please customize it.` };
    }

    const startDateStr = formData.get("startDate") as string;
    const endDateStr = formData.get("endDate") as string;
    const progressStr = formData.get("progress") as string;

    const selectedMemberIds = formData.getAll("members") as string[];
    const selectedProjectIds = formData.getAll("projects") as string[];
    const selectedPublicationIds = formData.getAll("publications") as string[];
    const selectedScholarshipIds = formData.getAll("scholarships") as string[];

    const featured = formData.get("featured") === "true";

    const thesis = await prisma.thesis.create({
      data: {
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
        members: {
          connect: selectedMemberIds.map((id) => ({ id })),
        },
        projects: {
          connect: selectedProjectIds.map((id) => ({ id })),
        },
        publications: {
          connect: selectedPublicationIds.map((id) => ({ id })),
        },
        scholarships: {
          connect: selectedScholarshipIds.map((id) => ({ id })),
        },
      },
    });

    await logAction("CREATE", "Thesis", thesis.id, thesis.slug, `Created thesis: ${thesis.title}`);

    revalidatePath("/theses");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to create thesis." };
  }
}

export async function updateThesis(thesisId: string, formData: FormData) {
  try {
    await ensureEditorOrAdmin();

    const title = formData.get("title") as string;
    let slug = formData.get("slug") as string;

    if (!title || !slug) {
      return { success: false, error: "Thesis Title and Slug are required." };
    }

    // Duplicate Check
    const ignoreCheck = formData.get("ignoreDuplicateCheck") === "true";
    if (!ignoreCheck) {
      const duplicate = await prisma.thesis.findFirst({
        where: {
          title: { equals: title, mode: "insensitive" },
          id: { not: thesisId },
        },
      });
      if (duplicate) {
        return {
          success: false,
          duplicate: true,
          error: `Another thesis titled "${title}" already exists.`,
        };
      }
    }

    // Ensure unique slug
    const existing = await prisma.thesis.findUnique({ where: { slug } });
    if (existing && existing.id !== thesisId) {
      return { success: false, error: `The slug '${slug}' is already taken by another thesis.` };
    }

    const startDateStr = formData.get("startDate") as string;
    const endDateStr = formData.get("endDate") as string;
    const progressStr = formData.get("progress") as string;

    const selectedMemberIds = formData.getAll("members") as string[];
    const selectedProjectIds = formData.getAll("projects") as string[];
    const selectedPublicationIds = formData.getAll("publications") as string[];
    const selectedScholarshipIds = formData.getAll("scholarships") as string[];

    const featured = formData.get("featured") === "true";

    const thesis = await prisma.thesis.update({
      where: { id: thesisId },
      data: {
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
        members: {
          set: selectedMemberIds.map((id) => ({ id })),
        },
        projects: {
          set: selectedProjectIds.map((id) => ({ id })),
        },
        publications: {
          set: selectedPublicationIds.map((id) => ({ id })),
        },
        scholarships: {
          set: selectedScholarshipIds.map((id) => ({ id })),
        },
      },
    });

    await logAction("UPDATE", "Thesis", thesis.id, thesis.slug, `Updated thesis: ${thesis.title}`);

    revalidatePath("/theses");
    revalidatePath(`/theses/${slug}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to update thesis." };
  }
}

export async function deleteThesis(thesisId: string) {
  await ensureEditorOrAdmin();

  const thesis = await prisma.thesis.delete({
    where: { id: thesisId },
  });

  await logAction("DELETE", "Thesis", thesis.id, thesis.slug, `Deleted thesis: ${thesis.title}`);

  revalidatePath("/theses");
  return { success: true };
}

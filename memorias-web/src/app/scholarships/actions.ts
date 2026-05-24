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

export async function createScholarship(formData: FormData) {
  try {
    await ensureEditorOrAdmin();

    const title = formData.get("title") as string;
    let slug = formData.get("slug") as string;

    if (!title) {
      return { success: false, error: "Scholarship Title is required." };
    }

    // Duplicate Check
    const ignoreCheck = formData.get("ignoreDuplicateCheck") === "true";
    if (!ignoreCheck) {
      const duplicate = await prisma.scholarship.findFirst({
        where: {
          title: { equals: title, mode: "insensitive" },
        },
      });
      if (duplicate) {
        return {
          success: false,
          duplicate: true,
          error: `A scholarship titled "${title}" already exists.`,
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
    const existing = await prisma.scholarship.findUnique({ where: { slug } });
    if (existing) {
      return { success: false, error: `The slug '${slug}' is already taken. Please customize it.` };
    }

    const startDateStr = formData.get("startDate") as string;
    const endDateStr = formData.get("endDate") as string;

    const selectedMemberIds = formData.getAll("members") as string[];
    const selectedProjectIds = formData.getAll("projects") as string[];
    const selectedThesisIds = formData.getAll("theses") as string[];

    const scholarship = await prisma.scholarship.create({
      data: {
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
        members: {
          connect: selectedMemberIds.map((id) => ({ id })),
        },
        projects: {
          connect: selectedProjectIds.map((id) => ({ id })),
        },
        theses: {
          connect: selectedThesisIds.map((id) => ({ id })),
        },
      },
    });

    await logAction("CREATE", "Scholarship", scholarship.id, scholarship.slug, `Created scholarship: ${scholarship.title}`);

    revalidatePath("/scholarships");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to create scholarship." };
  }
}

export async function updateScholarship(scholarshipId: string, formData: FormData) {
  try {
    await ensureEditorOrAdmin();

    const title = formData.get("title") as string;
    let slug = formData.get("slug") as string;

    if (!title || !slug) {
      return { success: false, error: "Scholarship Title and Slug are required." };
    }

    // Duplicate Check
    const ignoreCheck = formData.get("ignoreDuplicateCheck") === "true";
    if (!ignoreCheck) {
      const duplicate = await prisma.scholarship.findFirst({
        where: {
          title: { equals: title, mode: "insensitive" },
          id: { not: scholarshipId },
        },
      });
      if (duplicate) {
        return {
          success: false,
          duplicate: true,
          error: `Another scholarship titled "${title}" already exists.`,
        };
      }
    }

    // Ensure unique slug
    const existing = await prisma.scholarship.findUnique({ where: { slug } });
    if (existing && existing.id !== scholarshipId) {
      return { success: false, error: `The slug '${slug}' is already taken by another scholarship.` };
    }

    const startDateStr = formData.get("startDate") as string;
    const endDateStr = formData.get("endDate") as string;

    const selectedMemberIds = formData.getAll("members") as string[];
    const selectedProjectIds = formData.getAll("projects") as string[];
    const selectedThesisIds = formData.getAll("theses") as string[];

    const scholarship = await prisma.scholarship.update({
      where: { id: scholarshipId },
      data: {
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
        members: {
          set: selectedMemberIds.map((id) => ({ id })),
        },
        projects: {
          set: selectedProjectIds.map((id) => ({ id })),
        },
        theses: {
          set: selectedThesisIds.map((id) => ({ id })),
        },
      },
    });

    await logAction("UPDATE", "Scholarship", scholarship.id, scholarship.slug, `Updated scholarship: ${scholarship.title}`);

    revalidatePath("/scholarships");
    revalidatePath(`/scholarships/${slug}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to update scholarship." };
  }
}

export async function deleteScholarship(scholarshipId: string) {
  await ensureEditorOrAdmin();

  const scholarship = await prisma.scholarship.delete({
    where: { id: scholarshipId },
  });

  await logAction("DELETE", "Scholarship", scholarship.id, scholarship.slug, `Deleted scholarship: ${scholarship.title}`);

  revalidatePath("/scholarships");
  return { success: true };
}

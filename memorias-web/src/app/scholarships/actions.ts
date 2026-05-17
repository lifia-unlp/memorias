"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { logAction } from "@/lib/audit";

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
  await ensureEditorOrAdmin();

  const title = formData.get("title") as string;
  let slug = formData.get("slug") as string;

  if (!title) {
    throw new Error("Scholarship Title is required.");
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
    throw new Error(`The slug '${slug}' is already taken. Please customize it.`);
  }

  const startDateStr = formData.get("startDate") as string;
  const endDateStr = formData.get("endDate") as string;

  const selectedMemberIds = formData.getAll("members") as string[];
  const selectedProjectIds = formData.getAll("projects") as string[];

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
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
      members: {
        connect: selectedMemberIds.map((id) => ({ id })),
      },
      projects: {
        connect: selectedProjectIds.map((id) => ({ id })),
      },
    },
  });

  await logAction("CREATE", "Scholarship", scholarship.id, scholarship.slug, `Created scholarship: ${scholarship.title}`);

  revalidatePath("/scholarships");
  return { success: true };
}

export async function updateScholarship(scholarshipId: string, formData: FormData) {
  await ensureEditorOrAdmin();

  const title = formData.get("title") as string;
  let slug = formData.get("slug") as string;

  if (!title || !slug) {
    throw new Error("Scholarship Title and Slug are required.");
  }

  // Ensure unique slug
  const existing = await prisma.scholarship.findUnique({ where: { slug } });
  if (existing && existing.id !== scholarshipId) {
    throw new Error(`The slug '${slug}' is already taken by another scholarship.`);
  }

  const startDateStr = formData.get("startDate") as string;
  const endDateStr = formData.get("endDate") as string;

  const selectedMemberIds = formData.getAll("members") as string[];
  const selectedProjectIds = formData.getAll("projects") as string[];

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
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
      members: {
        set: selectedMemberIds.map((id) => ({ id })),
      },
      projects: {
        set: selectedProjectIds.map((id) => ({ id })),
      },
    },
  });

  await logAction("UPDATE", "Scholarship", scholarship.id, scholarship.slug, `Updated scholarship: ${scholarship.title}`);

  revalidatePath("/scholarships");
  revalidatePath(`/scholarships/${slug}`);
  return { success: true };
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

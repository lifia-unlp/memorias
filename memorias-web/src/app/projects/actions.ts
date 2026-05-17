"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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

export async function createProject(formData: FormData) {
  await ensureEditorOrAdmin();

  const title = formData.get("title") as string;
  let slug = formData.get("slug") as string;

  if (!title) {
    throw new Error("Project Title is required.");
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
  const existing = await prisma.project.findUnique({ where: { slug } });
  if (existing) {
    throw new Error(`The slug '${slug}' is already taken. Please customize it.`);
  }

  const startDateStr = formData.get("startDate") as string;
  const endDateStr = formData.get("endDate") as string;

  if (!startDateStr || !endDateStr) {
    throw new Error("Start Date and End Date are required fields.");
  }

  const selectedMemberIds = formData.getAll("members") as string[];

  await prisma.project.create({
    data: {
      title,
      slug,
      code: (formData.get("code") as string) || null,
      startDate: startDateStr ? new Date(startDateStr) : null,
      endDate: endDateStr ? new Date(endDateStr) : null,
      director: (formData.get("director") as string) || null,
      coDirector: (formData.get("coDirector") as string) || null,
      responsibleGroup: (formData.get("responsibleGroup") as string) || null,
      fundingAgency: (formData.get("fundingAgency") as string) || null,
      amount: (formData.get("amount") as string) || null,
      summary: (formData.get("summary") as string) || null,
      website: (formData.get("website") as string) || null,
      tags: formData.get("tags")
        ? (formData.get("tags") as string)
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
      members: {
        connect: selectedMemberIds.map((id) => ({ id })),
      },
    },
  });

  revalidatePath("/projects");
  return { success: true };
}

export async function updateProject(projectId: string, formData: FormData) {
  await ensureEditorOrAdmin();

  const title = formData.get("title") as string;
  let slug = formData.get("slug") as string;

  if (!title || !slug) {
    throw new Error("Project Title and Slug are required.");
  }

  // Ensure unique slug
  const existing = await prisma.project.findUnique({ where: { slug } });
  if (existing && existing.id !== projectId) {
    throw new Error(`The slug '${slug}' is already taken by another project.`);
  }

  const startDateStr = formData.get("startDate") as string;
  const endDateStr = formData.get("endDate") as string;

  if (!startDateStr || !endDateStr) {
    throw new Error("Start Date and End Date are required fields.");
  }

  const selectedMemberIds = formData.getAll("members") as string[];

  await prisma.project.update({
    where: { id: projectId },
    data: {
      title,
      slug,
      code: (formData.get("code") as string) || null,
      startDate: startDateStr ? new Date(startDateStr) : null,
      endDate: endDateStr ? new Date(endDateStr) : null,
      director: (formData.get("director") as string) || null,
      coDirector: (formData.get("coDirector") as string) || null,
      responsibleGroup: (formData.get("responsibleGroup") as string) || null,
      fundingAgency: (formData.get("fundingAgency") as string) || null,
      amount: (formData.get("amount") as string) || null,
      summary: (formData.get("summary") as string) || null,
      website: (formData.get("website") as string) || null,
      tags: formData.get("tags")
        ? (formData.get("tags") as string)
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
      members: {
        set: selectedMemberIds.map((id) => ({ id })),
      },
    },
  });

  revalidatePath("/projects");
  revalidatePath(`/projects/${slug}`);
  return { success: true };
}

export async function deleteProject(projectId: string) {
  await ensureEditorOrAdmin();

  // Gather referencing records to prevent orphans
  const theses = await prisma.thesis.findMany({
    where: {
      projects: { some: { id: projectId } },
    },
    select: { title: true, slug: true },
  });

  const scholarships = await prisma.scholarship.findMany({
    where: {
      projects: { some: { id: projectId } },
    },
    select: { title: true, slug: true },
  });

  const publications = await prisma.publication.findMany({
    where: {
      projects: { some: { id: projectId } },
    },
    select: { title: true, slug: true },
  });

  if (theses.length > 0 || scholarships.length > 0 || publications.length > 0) {
    return {
      success: false,
      error: "REFERENTIAL_BLOCK",
      references: {
        theses,
        scholarships,
        publications,
      },
    };
  }

  const project = await prisma.project.delete({
    where: { id: projectId },
    select: { slug: true },
  });

  revalidatePath("/projects");
  return { success: true };
}

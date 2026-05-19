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

export async function createMember(formData: FormData) {
  await ensureEditorOrAdmin();

  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  let slug = formData.get("slug") as string;
  
  if (!firstName || !lastName) {
    throw new Error("First Name and Last Name are required.");
  }

  // Generate safe slug if not provided
  if (!slug) {
    slug = `${firstName}-${lastName}`
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // remove accents
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  // Ensure unique slug
  const existing = await prisma.member.findUnique({ where: { slug } });
  if (existing) {
    throw new Error(`The slug '${slug}' is already taken. Please customize it.`);
  }

  const startDateStr = formData.get("startDate") as string;
  const endDateStr = formData.get("endDate") as string;

  const member = await prisma.member.create({
    data: {
      firstName,
      lastName,
      slug,
      startDate: startDateStr ? new Date(startDateStr) : null,
      endDate: endDateStr ? new Date(endDateStr) : null,
      highestDegree: (formData.get("highestDegree") as string) || null,
      coursesAtUNLP: (formData.get("coursesAtUNLP") as string) || null,
      positionAtLab: (formData.get("positionAtLab") as string) || null,
      positionAtUnlp: (formData.get("positionAtUnlp") as string) || null,
      category: (formData.get("category") as string) || null,
      sicadiCategory: (formData.get("sicadiCategory") as string) || null,
      positionAtCIC: (formData.get("positionAtCIC") as string) || null,
      positionAtCONICET: (formData.get("positionAtCONICET") as string) || null,
      personalEmail: (formData.get("personalEmail") as string) || null,
      institutionalEmail: (formData.get("institutionalEmail") as string) || null,
      phone: (formData.get("phone") as string) || null,
      webPage: (formData.get("webPage") as string) || null,
      orcid: (formData.get("orcid") as string) || null,
      dblpProfile: (formData.get("dblpProfile") as string) || null,
      googleResearchProfile: (formData.get("googleResearchProfile") as string) || null,
      researchGateProfile: (formData.get("researchGateProfile") as string) || null,
      shortCvInSpanish: (formData.get("shortCvInSpanish") as string) || null,
      shortCvInEnglish: (formData.get("shortCvInEnglish") as string) || null,
      interestsInEnglish: (formData.get("interestsInEnglish") as string) || null,
      interestsInSpanish: (formData.get("interestsInSpanish") as string) || null,
      affiliations: (formData.get("affiliations") as string) || null,
      notes: (formData.get("notes") as string) || null,
      avatarUrl: (formData.get("avatarUrl") as string) || null,
      tags: formData.get("tags")
        ? (formData.get("tags") as string)
            .split(",")
            .map((t) => sanitizeTag(t))
            .filter(Boolean)
        : [],
    },
  });

  await logAction("CREATE", "Member", member.id, member.slug, `Created member profile: ${member.firstName} ${member.lastName}`);

  revalidatePath("/members");
  return { success: true };
}

export async function updateMember(memberId: string, formData: FormData) {
  await ensureEditorOrAdmin();

  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  let slug = formData.get("slug") as string;

  if (!firstName || !lastName || !slug) {
    throw new Error("First Name, Last Name, and Slug are required.");
  }

  // Ensure unique slug
  const existing = await prisma.member.findUnique({ where: { slug } });
  if (existing && existing.id !== memberId) {
    throw new Error(`The slug '${slug}' is already taken by another member.`);
  }

  const startDateStr = formData.get("startDate") as string;
  const endDateStr = formData.get("endDate") as string;

  const member = await prisma.member.update({
    where: { id: memberId },
    data: {
      firstName,
      lastName,
      slug,
      startDate: startDateStr ? new Date(startDateStr) : null,
      endDate: endDateStr ? new Date(endDateStr) : null,
      highestDegree: (formData.get("highestDegree") as string) || null,
      coursesAtUNLP: (formData.get("coursesAtUNLP") as string) || null,
      positionAtLab: (formData.get("positionAtLab") as string) || null,
      positionAtUnlp: (formData.get("positionAtUnlp") as string) || null,
      category: (formData.get("category") as string) || null,
      sicadiCategory: (formData.get("sicadiCategory") as string) || null,
      positionAtCIC: (formData.get("positionAtCIC") as string) || null,
      positionAtCONICET: (formData.get("positionAtCONICET") as string) || null,
      personalEmail: (formData.get("personalEmail") as string) || null,
      institutionalEmail: (formData.get("institutionalEmail") as string) || null,
      phone: (formData.get("phone") as string) || null,
      webPage: (formData.get("webPage") as string) || null,
      orcid: (formData.get("orcid") as string) || null,
      dblpProfile: (formData.get("dblpProfile") as string) || null,
      googleResearchProfile: (formData.get("googleResearchProfile") as string) || null,
      researchGateProfile: (formData.get("researchGateProfile") as string) || null,
      shortCvInSpanish: (formData.get("shortCvInSpanish") as string) || null,
      shortCvInEnglish: (formData.get("shortCvInEnglish") as string) || null,
      interestsInEnglish: (formData.get("interestsInEnglish") as string) || null,
      interestsInSpanish: (formData.get("interestsInSpanish") as string) || null,
      affiliations: (formData.get("affiliations") as string) || null,
      notes: (formData.get("notes") as string) || null,
      avatarUrl: (formData.get("avatarUrl") as string) || null,
      tags: formData.get("tags")
        ? (formData.get("tags") as string)
            .split(",")
            .map((t) => sanitizeTag(t))
            .filter(Boolean)
        : [],
    },
  });

  await logAction("UPDATE", "Member", member.id, member.slug, `Updated member profile: ${member.firstName} ${member.lastName}`);

  revalidatePath("/members");
  revalidatePath(`/members/${slug}`);
  return { success: true };
}

export async function deleteMember(memberId: string) {
  await ensureEditorOrAdmin();

  // 1. Gather all active references in the database
  const projects = await prisma.project.findMany({
    where: {
      members: { some: { id: memberId } },
    },
    select: { title: true, slug: true },
  });

  const theses = await prisma.thesis.findMany({
    where: {
      members: { some: { id: memberId } },
    },
    select: { title: true, slug: true },
  });

  const scholarships = await prisma.scholarship.findMany({
    where: {
      members: { some: { id: memberId } },
    },
    select: { title: true, slug: true },
  });

  const publications = await prisma.publication.findMany({
    where: {
      members: { some: { id: memberId } },
    },
    select: { title: true, slug: true },
  });

  // 2. If any references exist, reject the delete and return structured block details
  if (
    projects.length > 0 ||
    theses.length > 0 ||
    scholarships.length > 0 ||
    publications.length > 0
  ) {
    return {
      success: false,
      error: "REFERENTIAL_BLOCK",
      references: {
        projects,
        theses,
        scholarships,
        publications,
      },
    };
  }

  // 3. Otherwise, perform the clean delete
  const member = await prisma.member.delete({
    where: { id: memberId },
    select: { id: true, firstName: true, lastName: true, slug: true },
  });

  await logAction("DELETE", "Member", member.id, member.slug, `Deleted member profile: ${member.firstName} ${member.lastName}`);

  revalidatePath("/members");
  return { success: true };
}

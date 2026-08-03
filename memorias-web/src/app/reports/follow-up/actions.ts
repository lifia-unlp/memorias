"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Ensure active user is logged in
export async function ensureActiveUser() {
  const session = await auth();
  if (!session || !session.user?.active) {
    throw new Error("Unauthorized. Active session required.");
  }
  return session;
}

// Get the physical member linked to the active user
export async function getCurrentUserMember() {
  const session = await ensureActiveUser();
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { member: true },
  });
  return user?.member || null;
}

// Create a new follow-up item
export async function createFollowUpItem(data: {
  title: string;
  description?: string;
  category: "PUBLICATION" | "PROJECT" | "THESIS" | "SCHOLARSHIP";
  status?: "PLANNING" | "UNDER_EVALUATION" | "ACCEPTED" | "REJECTED" | "IN_PROGRESS" | "COMPLETED";
  ownerIds: string[];
  publicationId?: string;
  projectId?: string;
  thesisId?: string;
  scholarshipId?: string;
}) {
  await ensureActiveUser();

  const item = await prisma.followUpItem.create({
    data: {
      title: data.title,
      description: data.description,
      category: data.category,
      status: data.status || "PLANNING",
      owners: {
        connect: data.ownerIds.map((id) => ({ id })),
      },
      publication: data.publicationId ? { connect: { id: data.publicationId } } : undefined,
      project: data.projectId ? { connect: { id: data.projectId } } : undefined,
      thesis: data.thesisId ? { connect: { id: data.thesisId } } : undefined,
      scholarship: data.scholarshipId ? { connect: { id: data.scholarshipId } } : undefined,
    },
  });

  revalidatePath("/reports/follow-up");
  revalidatePath("/reports/meet");
  return { success: true, itemId: item.id };
}

// Update follow-up item status and record it in the history log
export async function updateFollowUpItemStatus(
  itemId: string,
  status: "PLANNING" | "UNDER_EVALUATION" | "ACCEPTED" | "REJECTED" | "IN_PROGRESS" | "COMPLETED",
  notes?: string
) {
  const session = await ensureActiveUser();

  const item = await prisma.followUpItem.findUnique({
    where: { id: itemId },
  });

  if (!item) {
    throw new Error("Follow-up item not found");
  }

  const result = await prisma.$transaction(async (tx) => {
    // Add history log entry
    await tx.followUpHistory.create({
      data: {
        followUpItemId: itemId,
        fromStatus: item.status,
        toStatus: status,
        notes: notes || null,
        loggedById: session.user.id,
      },
    });

    // Update follow-up status
    return await tx.followUpItem.update({
      where: { id: itemId },
      data: { status },
    });
  });

  revalidatePath("/reports/follow-up");
  revalidatePath("/reports/meet");
  return { success: true, item: result };
}

// Archive or unarchive a follow-up item
export async function archiveFollowUpItem(itemId: string, archived: boolean) {
  await ensureActiveUser();

  const result = await prisma.followUpItem.update({
    where: { id: itemId },
    data: { archived },
  });

  revalidatePath("/reports/follow-up");
  revalidatePath("/reports/meet");
  return { success: true, item: result };
}

// Update follow-up item basic details (title, description, responsibles, realizations)
export async function updateFollowUpItem(
  itemId: string,
  data: {
    title: string;
    description?: string;
    ownerIds: string[];
    publicationId?: string | null;
    projectId?: string | null;
    thesisId?: string | null;
    scholarshipId?: string | null;
  }
) {
  await ensureActiveUser();

  const result = await prisma.followUpItem.update({
    where: { id: itemId },
    data: {
      title: data.title,
      description: data.description || null,
      owners: {
        set: data.ownerIds.map((id) => ({ id })),
      },
      publication: data.publicationId ? { connect: { id: data.publicationId } } : { disconnect: true },
      project: data.projectId ? { connect: { id: data.projectId } } : { disconnect: true },
      thesis: data.thesisId ? { connect: { id: data.thesisId } } : { disconnect: true },
      scholarship: data.scholarshipId ? { connect: { id: data.scholarshipId } } : { disconnect: true },
    },
  });

  revalidatePath("/reports/follow-up");
  revalidatePath("/reports/meet");
  return { success: true, item: result };
}


// Get all follow-up items for the current logged-in member
export async function getPersonalFollowUpItems() {
  const member = await getCurrentUserMember();
  if (!member) {
    return [];
  }

  return await prisma.followUpItem.findMany({
    where: {
      archived: false,
      owners: {
        some: { id: member.id },
      },
    },
    include: {
      owners: true,
      history: {
        include: { loggedBy: true },
        orderBy: { meetingDate: "desc" },
      },
      publication: { select: { id: true, title: true, slug: true } },
      project: { select: { id: true, title: true, slug: true } },
      thesis: { select: { id: true, title: true, slug: true } },
      scholarship: { select: { id: true, title: true, slug: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

// Get all active (non-archived) follow-up items
export async function getActiveFollowUpItems() {
  await ensureActiveUser();

  return await prisma.followUpItem.findMany({
    where: { archived: false },
    include: {
      owners: true,
      history: {
        include: { loggedBy: true },
        orderBy: { meetingDate: "desc" },
      },
      publication: { select: { id: true, title: true, slug: true } },
      project: { select: { id: true, title: true, slug: true } },
      thesis: { select: { id: true, title: true, slug: true } },
      scholarship: { select: { id: true, title: true, slug: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

// Get all follow-up items (for global list, optionally showing archived)
export async function getAllFollowUpItems(showArchived: boolean = false) {
  await ensureActiveUser();

  return await prisma.followUpItem.findMany({
    where: showArchived ? {} : { archived: false },
    include: {
      owners: true,
      history: {
        include: { loggedBy: true },
        orderBy: { meetingDate: "desc" },
      },
      publication: { select: { id: true, title: true, slug: true } },
      project: { select: { id: true, title: true, slug: true } },
      thesis: { select: { id: true, title: true, slug: true } },
      scholarship: { select: { id: true, title: true, slug: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

// Get history changes since N days ago
export async function getRecentFollowUpChanges(days: number = 7) {
  await ensureActiveUser();

  const cutOffDate = new Date();
  cutOffDate.setDate(cutOffDate.getDate() - days);

  return await prisma.followUpHistory.findMany({
    where: {
      meetingDate: {
        gte: cutOffDate,
      },
    },
    include: {
      followUpItem: {
        include: {
          owners: true,
          history: {
            include: { loggedBy: true },
            orderBy: { meetingDate: "desc" },
          },
        },
      },
      loggedBy: true,
    },
    orderBy: { meetingDate: "desc" },
  });
}

// Fetch all active members to assign responsibility
export async function getActiveMembers() {
  await ensureActiveUser();
  return await prisma.member.findMany({
    where: {
      endDate: null, // Only active/current members
    },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });
}

// Update the notes/news of a specific history log entry
export async function updateFollowUpHistory(historyId: string, notes: string) {
  await ensureActiveUser();

  const result = await prisma.followUpHistory.update({
    where: { id: historyId },
    data: { notes: notes || null },
  });

  revalidatePath("/reports/follow-up");
  revalidatePath("/reports/meet");
  return { success: true, history: result };
}

// Delete a specific history log entry
export async function deleteFollowUpHistory(historyId: string) {
  await ensureActiveUser();

  const result = await prisma.followUpHistory.delete({
    where: { id: historyId },
  });

  revalidatePath("/reports/follow-up");
  revalidatePath("/reports/meet");
  return { success: true, history: result };
}

// Permanently delete a follow-up item
export async function deleteFollowUpItem(itemId: string) {
  await ensureActiveUser();

  const result = await prisma.followUpItem.delete({
    where: { id: itemId },
  });

  revalidatePath("/reports/follow-up");
  revalidatePath("/reports/meet");
  return { success: true, item: result };
}

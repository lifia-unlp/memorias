import { prisma } from "@/lib/prisma";

export const adminUserService = {
  getAllUsers: async () => {
    return prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: { member: true },
    });
  },

  getMembersForUserAssignment: async () => {
    return prisma.member.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: [
        { lastName: "asc" },
        { firstName: "asc" },
      ],
    });
  },

  getUserById: async (id: string) => {
    return prisma.user.findUnique({
      where: { id },
    });
  },

  toggleUserActivation: async (id: string) => {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { active: true },
    });
    if (!user) throw new Error("User not found");

    return prisma.user.update({
      where: { id },
      data: { active: !user.active },
    });
  },

  updateUserRole: async (id: string, role: "USER" | "EDITOR" | "POWER_EDITOR" | "ADMIN") => {
    return prisma.user.update({
      where: { id },
      data: { role },
    });
  },

  deleteUser: async (id: string) => {
    return prisma.user.delete({
      where: { id },
    });
  },

  updateUserMember: async (id: string, memberId: string | null) => {
    if (memberId) {
      const existingUser = await prisma.user.findFirst({
        where: {
          memberId,
          id: { not: id },
        },
      });
      if (existingUser) {
        throw new Error(`This member is already assigned to user: ${existingUser.email}`);
      }
    }

    return prisma.user.update({
      where: { id },
      data: { memberId },
    });
  },

  updateUserProfile: async (id: string, data: { name: string; notificationEmail: string | null }) => {
    return prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        notificationEmail: data.notificationEmail,
      },
    });
  },

  getUserCandidateEmails: async (id: string) => {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { notificationEmail: true },
    });
    if (!user) return [];

    const candidates: Array<{ label: string; email: string }> = [];

    if (user.notificationEmail && user.notificationEmail.trim() && !user.notificationEmail.endsWith("@orcid.org")) {
      candidates.push({ label: "User Notification Email", email: user.notificationEmail.trim() });
    }

    return candidates;
  },

  getUserEmail: async (id: string) => {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { notificationEmail: true },
    });
    if (user?.notificationEmail && !user.notificationEmail.endsWith("@orcid.org")) {
      return user.notificationEmail.trim();
    }
    return null;
  },

  getActiveUserEmails: async () => {
    const activeUsers = await prisma.user.findMany({
      where: {
        active: true,
        notificationEmail: { not: null },
      },
      select: { notificationEmail: true },
    });
    
    const emails: string[] = [];
    for (const u of activeUsers) {
      if (u.notificationEmail && u.notificationEmail.trim() && !u.notificationEmail.endsWith("@orcid.org")) {
        emails.push(u.notificationEmail.trim());
      }
    }
    return Array.from(new Set(emails));
  },
};

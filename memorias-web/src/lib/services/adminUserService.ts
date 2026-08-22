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
      include: { member: true },
    });
    if (!user) return [];

    const candidates: Array<{ label: string; email: string }> = [];

    if (user.notificationEmail && user.notificationEmail.trim()) {
      candidates.push({ label: "User Notification Email", email: user.notificationEmail.trim() });
    }
    if (user.member?.institutionalEmail && user.member.institutionalEmail.trim()) {
      candidates.push({ label: "Member Institutional Email", email: user.member.institutionalEmail.trim() });
    }
    if (user.member?.personalEmail && user.member.personalEmail.trim()) {
      candidates.push({ label: "Member Personal Email", email: user.member.personalEmail.trim() });
    }

    if (candidates.length === 0 && user.email && !user.email.endsWith("@orcid.org")) {
      candidates.push({ label: "Primary Account Email", email: user.email.trim() });
    }

    return candidates;
  },

  getUserEmail: async (id: string) => {
    const candidates = await adminUserService.getUserCandidateEmails(id);
    if (candidates.length > 0) return candidates[0].email;
    const user = await prisma.user.findUnique({
      where: { id },
      select: { email: true },
    });
    return user?.email || null;
  },

  getActiveUserEmails: async () => {
    const activeUsers = await prisma.user.findMany({
      where: { active: true },
      include: { member: true },
    });
    
    const emails: string[] = [];
    for (const u of activeUsers) {
      if (u.notificationEmail && u.notificationEmail.trim()) {
        emails.push(u.notificationEmail.trim());
      } else if (u.member?.institutionalEmail && u.member.institutionalEmail.trim()) {
        emails.push(u.member.institutionalEmail.trim());
      } else if (u.member?.personalEmail && u.member.personalEmail.trim()) {
        emails.push(u.member.personalEmail.trim());
      } else if (u.email && !u.email.endsWith("@orcid.org")) {
        emails.push(u.email.trim());
      }
    }
    return Array.from(new Set(emails));
  },
};

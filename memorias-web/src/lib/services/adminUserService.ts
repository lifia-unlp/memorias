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

  getUserEmail: async (id: string) => {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { email: true },
    });
    return user?.email || null;
  },

  getActiveUserEmails: async () => {
    const activeUsers = await prisma.user.findMany({
      where: { active: true },
      select: { email: true },
    });
    return activeUsers.map((u) => u.email);
  },
};

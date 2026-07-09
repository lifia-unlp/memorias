import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export const userService = {
  getUserMappedMember: async (userId: string) => {
    const userWithMember = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
    return userWithMember?.member || null;
  },

  updateUserPreferences: async (
    userId: string,
    data: {
      notificationEmail: string | null;
      avatarUrl: string | null;
      digestEmails: boolean;
      immediateNotifications: boolean;
    }
  ) => {
    return prisma.user.update({
      where: { id: userId },
      data,
    });
  },

  getUserByEmail: async (email: string) => {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  createUserBackdoor: async (email: string, role: Role) => {
    return prisma.user.create({
      data: {
        email,
        name: "Dev Admin Backdoor",
        role,
        active: true,
        notificationEmail: email,
        avatarUrl: null,
      },
    });
  },

  updateUserBackdoor: async (id: string, role: Role) => {
    return prisma.user.update({
      where: { id },
      data: {
        role,
        active: true,
      },
    });
  },

  getUserJwtFields: async (id: string) => {
    return prisma.user.findUnique({
      where: { id },
      select: {
        role: true,
        active: true,
        notificationEmail: true,
        avatarUrl: true,
        digestEmails: true,
        immediateNotifications: true,
        memberId: true,
      },
    });
  },

  getTotalUserCount: async () => {
    return prisma.user.count();
  },

  handleUserRegistration: async (userId: string, email: string | null, image: string | null) => {
    const count = await prisma.user.count();
    const role = count === 1 ? "ADMIN" : "USER";
    
    let active = true;
    if (count > 1) {
      const requireActivationSetting = await prisma.systemSetting.findUnique({
        where: { key: "require_user_activation" },
      }).catch(() => null);
      if (requireActivationSetting?.value === "true") {
        active = false;
      }
    }

    return prisma.user.update({
      where: { id: userId },
      data: {
        role,
        active,
        notificationEmail: email,
        avatarUrl: image,
      },
    });
  },
};

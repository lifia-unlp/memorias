import { describe, it, expect, vi, beforeEach } from "vitest";
import { userService } from "../userService";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
      count: vi.fn(),
    },
    systemSetting: {
      findUnique: vi.fn(),
    },
  },
}));

describe("userService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getUserMappedMember", () => {
    it("returns mapped member or null", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "u1",
        member: { id: "m1", firstName: "Alice", lastName: "Smith" },
      } as any);

      const res = await userService.getUserMappedMember("u1");
      expect(res).toEqual({ id: "m1", firstName: "Alice", lastName: "Smith" });
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: "u1" },
        select: {
          member: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      });
    });
  });

  describe("updateUserPreferences", () => {
    it("updates notification settings", async () => {
      const data = {
        notificationEmail: "a@b.com",
        avatarUrl: "http://avatar",
        digestEmails: true,
        immediateNotifications: false,
      };
      await userService.updateUserPreferences("u1", data);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "u1" },
        data,
      });
    });
  });

  describe("getUserByEmail", () => {
    it("finds user by email", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "u1", email: "test@test.com" } as any);
      const res = await userService.getUserByEmail("test@test.com");
      expect(res).toEqual({ id: "u1", email: "test@test.com" });
    });
  });

  describe("createUserBackdoor", () => {
    it("creates user with ADMIN/EDITOR role for testing backdoor", async () => {
      await userService.createUserBackdoor("dev@test.com", "ADMIN");
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: "dev@test.com",
          name: "Dev Admin Backdoor",
          role: "ADMIN",
          active: true,
          notificationEmail: "dev@test.com",
          avatarUrl: null,
        },
      });
    });
  });

  describe("updateUserBackdoor", () => {
    it("updates role and active status", async () => {
      await userService.updateUserBackdoor("u1", "EDITOR");
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "u1" },
        data: { role: "EDITOR", active: true },
      });
    });
  });

  describe("getUserJwtFields", () => {
    it("fetches fields needed for NextAuth session jwt", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "u1", role: "ADMIN" } as any);
      await userService.getUserJwtFields("u1");
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: "u1" },
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
    });
  });

  describe("handleUserRegistration", () => {
    it("assigns ADMIN role to the very first user registered", async () => {
      vi.mocked(prisma.user.count).mockResolvedValue(1);
      vi.mocked(prisma.user.update).mockResolvedValue({ id: "u1", role: "ADMIN", active: true } as any);

      const res = await userService.handleUserRegistration("u1", "first@admin.com", "img");
      expect(res.role).toBe("ADMIN");
      expect(res.active).toBe(true);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "u1" },
        data: {
          role: "ADMIN",
          active: true,
          notificationEmail: "first@admin.com",
          avatarUrl: "img",
        },
      });
    });

    it("requires activation if setting require_user_activation is true", async () => {
      vi.mocked(prisma.user.count).mockResolvedValue(5);
      vi.mocked(prisma.systemSetting.findUnique).mockResolvedValue({ value: "true" } as any);
      vi.mocked(prisma.user.update).mockResolvedValue({ id: "u1", role: "USER", active: false } as any);

      const res = await userService.handleUserRegistration("u1", "user@test.com", null);
      expect(res.role).toBe("USER");
      expect(res.active).toBe(false);
    });
  });
});

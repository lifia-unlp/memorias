import { describe, it, expect, vi, beforeEach } from "vitest";
import { adminUserService } from "../adminUserService";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    member: {
      findMany: vi.fn(),
    },
  },
}));

describe("adminUserService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAllUsers", () => {
    it("fetches all users with member relation", async () => {
      vi.mocked(prisma.user.findMany).mockResolvedValue([{ id: "u1" }] as any);
      const res = await adminUserService.getAllUsers();
      expect(res).toEqual([{ id: "u1" }]);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: "desc" },
        include: { member: true },
      });
    });
  });

  describe("getMembersForUserAssignment", () => {
    it("fetches member options for dropdowns", async () => {
      vi.mocked(prisma.member.findMany).mockResolvedValue([{ id: "m1" }] as any);
      const res = await adminUserService.getMembersForUserAssignment();
      expect(res).toEqual([{ id: "m1" }]);
      expect(prisma.member.findMany).toHaveBeenCalledWith({
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
    });
  });

  describe("toggleUserActivation", () => {
    it("toggles active field", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "u1", active: true } as any);
      await adminUserService.toggleUserActivation("u1");
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "u1" },
        data: { active: false },
      });
    });
  });

  describe("updateUserRole", () => {
    it("updates user role", async () => {
      await adminUserService.updateUserRole("u1", "EDITOR");
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "u1" },
        data: { role: "EDITOR" },
      });
    });
  });

  describe("deleteUser", () => {
    it("deletes user", async () => {
      await adminUserService.deleteUser("u1");
      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: "u1" } });
    });
  });

  describe("updateUserMember", () => {
    it("throws error if member already assigned to someone else", async () => {
      vi.mocked(prisma.user.findFirst).mockResolvedValue({ id: "other", email: "other@test.com" } as any);
      await expect(
        adminUserService.updateUserMember("u1", "m1")
      ).rejects.toThrow("This member is already assigned to user: other@test.com");
    });

    it("updates member association", async () => {
      vi.mocked(prisma.user.findFirst).mockResolvedValue(null);
      await adminUserService.updateUserMember("u1", "m1");
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "u1" },
        data: { memberId: "m1" },
      });
    });
  });

  describe("getUserEmail", () => {
    it("gets user email", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ email: "test@test.com" } as any);
      const email = await adminUserService.getUserEmail("u1");
      expect(email).toBe("test@test.com");
    });
  });

  describe("getActiveUserEmails", () => {
    it("returns list of active emails", async () => {
      vi.mocked(prisma.user.findMany).mockResolvedValue([{ email: "a@test.com" }, { email: "b@test.com" }] as any);
      const emails = await adminUserService.getActiveUserEmails();
      expect(emails).toEqual(["a@test.com", "b@test.com"]);
    });
  });
});

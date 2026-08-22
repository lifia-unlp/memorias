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

  describe("getUserCandidateEmails", () => {
    it("gathers candidate emails from user preferences and member profile while ignoring synthetic emails", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "u1",
        email: "0000-0002-1825-0097@orcid.org",
        notificationEmail: "notif@test.com",
        member: {
          institutionalEmail: "inst@test.com",
          personalEmail: "pers@test.com",
        },
      } as any);

      const candidates = await adminUserService.getUserCandidateEmails("u1");
      expect(candidates).toEqual([
        { label: "User Notification Email", email: "notif@test.com" },
        { label: "Member Institutional Email", email: "inst@test.com" },
        { label: "Member Personal Email", email: "pers@test.com" },
      ]);
    });
  });

  describe("updateUserProfile", () => {
    it("updates user name and notification email", async () => {
      await adminUserService.updateUserProfile("u1", { name: "New Name", notificationEmail: "new@test.com" });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "u1" },
        data: {
          name: "New Name",
          notificationEmail: "new@test.com",
        },
      });
    });
  });

  describe("getUserEmail", () => {
    it("gets user candidate email first", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "u1",
        email: "0000-0002-1825-0097@orcid.org",
        notificationEmail: "real@test.com",
      } as any);
      const email = await adminUserService.getUserEmail("u1");
      expect(email).toBe("real@test.com");
    });
  });

  describe("getActiveUserEmails", () => {
    it("returns list of active emails filtering out synthetic emails", async () => {
      vi.mocked(prisma.user.findMany).mockResolvedValue([
        { id: "u1", email: "a@orcid.org", notificationEmail: "notif@test.com", member: null },
        { id: "u2", email: "b@test.com", notificationEmail: null, member: null },
        { id: "u3", email: "c@orcid.org", notificationEmail: null, member: null },
      ] as any);
      const emails = await adminUserService.getActiveUserEmails();
      expect(emails).toEqual(["notif@test.com", "b@test.com"]);
    });
  });
});

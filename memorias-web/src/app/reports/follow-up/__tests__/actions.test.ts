import { describe, it, expect, vi, beforeEach } from "vitest";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  createFollowUpItem,
  updateFollowUpItemStatus,
  archiveFollowUpItem,
  updateFollowUpItem,
  updateFollowUpHistory,
  deleteFollowUpHistory,
  getPersonalFollowUpItems,
  getActiveFollowUpItems,
  getAllFollowUpItems,
  getRecentFollowUpChanges,
  getActiveMembers,
} from "../actions";

// Mocks
vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    member: {
      findMany: vi.fn(),
    },
    followUpItem: {
      create: vi.fn(),
      update: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    followUpHistory: {
      create: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

const mockAuth = vi.mocked(auth) as any;
const mockRevalidatePath = vi.mocked(revalidatePath);

describe("Follow-Up Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createFollowUpItem", () => {
    it("throws error if user session is not active", async () => {
      mockAuth.mockResolvedValue(null);
      await expect(
        createFollowUpItem({
          title: "Test Plan",
          category: "PUBLICATION",
          ownerIds: ["m1"],
        })
      ).rejects.toThrow("Unauthorized. Active session required.");
    });

    it("creates follow-up item and revalidates paths on success", async () => {
      mockAuth.mockResolvedValue({ user: { id: "u1", active: true } } as any);
      vi.mocked(prisma.followUpItem.create).mockResolvedValue({ id: "item1" } as any);

      const result = await createFollowUpItem({
        title: "Test Plan",
        description: "Plan Description",
        category: "PUBLICATION",
        ownerIds: ["m1"],
      });

      expect(prisma.followUpItem.create).toHaveBeenCalledWith({
        data: {
          title: "Test Plan",
          description: "Plan Description",
          category: "PUBLICATION",
          status: "PLANNING",
          owners: {
            connect: [{ id: "m1" }],
          },
        },
      });
      expect(mockRevalidatePath).toHaveBeenCalledWith("/reports/follow-up");
      expect(mockRevalidatePath).toHaveBeenCalledWith("/reports/meet");
      expect(result).toEqual({ success: true, itemId: "item1" });
    });
  });

  describe("updateFollowUpItemStatus", () => {
    it("updates status and creates history record inside a transaction", async () => {
      mockAuth.mockResolvedValue({ user: { id: "u1", active: true } } as any);
      vi.mocked(prisma.followUpItem.findUnique).mockResolvedValue({
        id: "item1",
        status: "PLANNING",
      } as any);

      const mockTx = {
        followUpHistory: {
          create: vi.fn(),
        },
        followUpItem: {
          update: vi.fn().mockResolvedValue({ id: "item1", status: "UNDER_EVALUATION" }),
        },
      };

      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
        return await callback(mockTx);
      });

      const result = await updateFollowUpItemStatus("item1", "UNDER_EVALUATION", "Submitted today");

      expect(prisma.followUpItem.findUnique).toHaveBeenCalledWith({ where: { id: "item1" } });
      expect(mockTx.followUpHistory.create).toHaveBeenCalledWith({
        data: {
          followUpItemId: "item1",
          fromStatus: "PLANNING",
          toStatus: "UNDER_EVALUATION",
          notes: "Submitted today",
          loggedById: "u1",
        },
      });
      expect(mockTx.followUpItem.update).toHaveBeenCalledWith({
        where: { id: "item1" },
        data: { status: "UNDER_EVALUATION" },
      });
      expect(result).toEqual({ success: true, item: { id: "item1", status: "UNDER_EVALUATION" } });
      expect(mockRevalidatePath).toHaveBeenCalledWith("/reports/follow-up");
    });
  });

  describe("archiveFollowUpItem", () => {
    it("archives follow-up item", async () => {
      mockAuth.mockResolvedValue({ user: { id: "u1", active: true } } as any);
      vi.mocked(prisma.followUpItem.update).mockResolvedValue({ id: "item1", archived: true } as any);

      const result = await archiveFollowUpItem("item1", true);

      expect(prisma.followUpItem.update).toHaveBeenCalledWith({
        where: { id: "item1" },
        data: { archived: true },
      });
      expect(result).toEqual({ success: true, item: { id: "item1", archived: true } });
    });
  });

  describe("updateFollowUpItem", () => {
    it("updates title, description, and responsibles list of an item", async () => {
      mockAuth.mockResolvedValue({ user: { id: "u1", active: true } } as any);
      vi.mocked(prisma.followUpItem.update).mockResolvedValue({ id: "item1", title: "Updated Title" } as any);

      const result = await updateFollowUpItem("item1", {
        title: "Updated Title",
        description: "Updated Desc",
        ownerIds: ["m1"],
      });

      expect(prisma.followUpItem.update).toHaveBeenCalledWith({
        where: { id: "item1" },
        data: {
          title: "Updated Title",
          description: "Updated Desc",
          owners: {
            set: [{ id: "m1" }],
          },
          publication: { disconnect: true },
          project: { disconnect: true },
          thesis: { disconnect: true },
          scholarship: { disconnect: true },
        },
      });
      expect(result).toEqual({ success: true, item: { id: "item1", title: "Updated Title" } });
    });
  });


  describe("getPersonalFollowUpItems", () => {
    it("returns items assigned to user member", async () => {
      mockAuth.mockResolvedValue({ user: { id: "u1", active: true } } as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "u1",
        member: { id: "m1" },
      } as any);
      vi.mocked(prisma.followUpItem.findMany).mockResolvedValue([
        { id: "item1", title: "My Assigned Plan" },
      ] as any);

      const result = await getPersonalFollowUpItems();

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: "u1" },
        include: { member: true },
      });
      expect(prisma.followUpItem.findMany).toHaveBeenCalledWith({
        where: {
          archived: false,
          owners: {
            some: { id: "m1" },
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
      expect(result).toEqual([{ id: "item1", title: "My Assigned Plan" }]);
    });
  });

  describe("getActiveFollowUpItems", () => {
    it("returns all non-archived items", async () => {
      mockAuth.mockResolvedValue({ user: { id: "u1", active: true } } as any);
      vi.mocked(prisma.followUpItem.findMany).mockResolvedValue([
        { id: "item1", title: "Active Plan" },
      ] as any);

      const result = await getActiveFollowUpItems();

      expect(prisma.followUpItem.findMany).toHaveBeenCalledWith({
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
      expect(result).toEqual([{ id: "item1", title: "Active Plan" }]);
    });
  });

  describe("updateFollowUpHistory", () => {
    it("updates history note log details", async () => {
      mockAuth.mockResolvedValue({ user: { id: "u1", active: true } } as any);
      vi.mocked(prisma.followUpHistory.update).mockResolvedValue({ id: "h1", notes: "Updated Note" } as any);

      const result = await updateFollowUpHistory("h1", "Updated Note");

      expect(prisma.followUpHistory.update).toHaveBeenCalledWith({
        where: { id: "h1" },
        data: { notes: "Updated Note" },
      });
      expect(result).toEqual({ success: true, history: { id: "h1", notes: "Updated Note" } });
    });
  });

  describe("deleteFollowUpHistory", () => {
    it("deletes a history entry", async () => {
      mockAuth.mockResolvedValue({ user: { id: "u1", active: true } } as any);
      vi.mocked(prisma.followUpHistory.delete).mockResolvedValue({ id: "h1" } as any);

      const result = await deleteFollowUpHistory("h1");

      expect(prisma.followUpHistory.delete).toHaveBeenCalledWith({
        where: { id: "h1" },
      });
      expect(result).toEqual({ success: true, history: { id: "h1" } });
    });
  });
});

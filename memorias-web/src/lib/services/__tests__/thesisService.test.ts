import { describe, it, expect, vi, beforeEach } from "vitest";
import { thesisService } from "../thesisService";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    thesis: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

describe("thesisService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("throws error if duplicate title is found and bypass check is inactive", async () => {
      vi.mocked(prisma.thesis.findFirst).mockResolvedValue({ id: "1", title: "Thesis A" } as any);
      await expect(
        thesisService.create({ title: "Thesis A" })
      ).rejects.toThrow("DUPLICATE_TITLE");
    });

    it("creates thesis successfully bypassing duplicate check", async () => {
      vi.mocked(prisma.thesis.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.thesis.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.thesis.create).mockResolvedValue({ id: "2", title: "Thesis B" } as any);

      const res = await thesisService.create({ title: "Thesis B" });
      expect(res.title).toBe("Thesis B");
      expect(prisma.thesis.create).toHaveBeenCalled();
    });
  });

  describe("delete", () => {
    it("deletes thesis by id", async () => {
      vi.mocked(prisma.thesis.delete).mockResolvedValue({ id: "t1" } as any);
      const res = await thesisService.delete("t1");
      expect(res.id).toBe("t1");
      expect(prisma.thesis.delete).toHaveBeenCalledWith({ where: { id: "t1" } });
    });
  });

  describe("getAllTheses", () => {
    it("fetches theses with member summaries sorted by endDate desc", async () => {
      vi.mocked(prisma.thesis.findMany).mockResolvedValue([{ id: "t1" }] as any);
      const res = await thesisService.getAllTheses();
      expect(res).toEqual([{ id: "t1" }]);
      expect(prisma.thesis.findMany).toHaveBeenCalledWith({
        where: undefined,
        include: {
          members: {
            select: {
              firstName: true,
              lastName: true,
              slug: true,
            },
          },
        },
        orderBy: { endDate: "desc" },
      });
    });
  });

  describe("getBySlug", () => {
    it("fetches thesis by slug including deep relation selected ids", async () => {
      vi.mocked(prisma.thesis.findUnique).mockResolvedValue({ id: "t1", slug: "t-a" } as any);
      const res = await thesisService.getBySlug("t-a");
      expect(res?.slug).toBe("t-a");
      expect(prisma.thesis.findUnique).toHaveBeenCalledWith({
        where: { slug: "t-a" },
        include: {
          members: { select: { id: true } },
          projects: { select: { id: true } },
          publications: { select: { id: true } },
          scholarships: { select: { id: true } },
        },
      });
    });
  });

  describe("getThesisDetail", () => {
    it("fetches thesis detail with related collections", async () => {
      vi.mocked(prisma.thesis.findUnique).mockResolvedValue({ id: "t1" } as any);
      const res = await thesisService.getThesisDetail("t-a");
      expect(res).toEqual({ id: "t1" });
      expect(prisma.thesis.findUnique).toHaveBeenCalledWith({
        where: { slug: "t-a" },
        include: {
          members: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              slug: true,
              avatarUrl: true,
              positionAtLab: true,
            },
          },
          projects: {
            select: {
              id: true,
              title: true,
              slug: true,
              code: true,
              fundingAgency: true,
              startDate: true,
              endDate: true,
            },
          },
          scholarships: {
            select: {
              id: true,
              title: true,
              slug: true,
              student: true,
              type: true,
            },
          },
          publications: {
            orderBy: { year: "desc" },
          },
        },
      });
    });
  });

  describe("getFormSelectionList", () => {
    it("fetches all theses sorted by endDate desc", async () => {
      vi.mocked(prisma.thesis.findMany).mockResolvedValue([{ id: "t1" }] as any);
      const res = await thesisService.getFormSelectionList();
      expect(res).toEqual([{ id: "t1" }]);
      expect(prisma.thesis.findMany).toHaveBeenCalledWith({
        orderBy: { endDate: "desc" },
      });
    });
  });
});

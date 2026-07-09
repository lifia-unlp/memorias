import { describe, it, expect, vi, beforeEach } from "vitest";
import { scholarshipService } from "../scholarshipService";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    scholarship: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

describe("scholarshipService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("throws error if duplicate title is found and bypass check is inactive", async () => {
      vi.mocked(prisma.scholarship.findFirst).mockResolvedValue({ id: "1", title: "Scholarship A" } as any);
      await expect(
        scholarshipService.create({ title: "Scholarship A" })
      ).rejects.toThrow("DUPLICATE_TITLE");
    });

    it("creates scholarship successfully bypassing duplicate check", async () => {
      vi.mocked(prisma.scholarship.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.scholarship.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.scholarship.create).mockResolvedValue({ id: "2", title: "Scholarship B" } as any);

      const res = await scholarshipService.create({ title: "Scholarship B" });
      expect(res.title).toBe("Scholarship B");
      expect(prisma.scholarship.create).toHaveBeenCalled();
    });
  });

  describe("delete", () => {
    it("deletes scholarship by id", async () => {
      vi.mocked(prisma.scholarship.delete).mockResolvedValue({ id: "s1" } as any);
      const res = await scholarshipService.delete("s1");
      expect(res.id).toBe("s1");
      expect(prisma.scholarship.delete).toHaveBeenCalledWith({ where: { id: "s1" } });
    });
  });

  describe("getAllScholarships", () => {
    it("fetches scholarships with member summaries sorted by endDate desc", async () => {
      vi.mocked(prisma.scholarship.findMany).mockResolvedValue([{ id: "s1" }] as any);
      const res = await scholarshipService.getAllScholarships();
      expect(res).toEqual([{ id: "s1" }]);
      expect(prisma.scholarship.findMany).toHaveBeenCalledWith({
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
    it("fetches scholarship by slug including deep relation selected ids", async () => {
      vi.mocked(prisma.scholarship.findUnique).mockResolvedValue({ id: "s1", slug: "s-a" } as any);
      const res = await scholarshipService.getBySlug("s-a");
      expect(res?.slug).toBe("s-a");
      expect(prisma.scholarship.findUnique).toHaveBeenCalledWith({
        where: { slug: "s-a" },
        include: {
          members: { select: { id: true } },
          projects: { select: { id: true } },
          theses: { select: { id: true } },
        },
      });
    });
  });

  describe("getScholarshipDetail", () => {
    it("fetches scholarship detail with related collections", async () => {
      vi.mocked(prisma.scholarship.findUnique).mockResolvedValue({ id: "s1" } as any);
      const res = await scholarshipService.getScholarshipDetail("s-a");
      expect(res).toEqual({ id: "s1" });
      expect(prisma.scholarship.findUnique).toHaveBeenCalledWith({
        where: { slug: "s-a" },
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
          theses: {
            select: {
              id: true,
              title: true,
              slug: true,
              student: true,
              level: true,
              progress: true,
            },
          },
        },
      });
    });
  });

  describe("getFormSelectionList", () => {
    it("fetches all scholarships sorted by endDate desc", async () => {
      vi.mocked(prisma.scholarship.findMany).mockResolvedValue([{ id: "s1" }] as any);
      const res = await scholarshipService.getFormSelectionList();
      expect(res).toEqual([{ id: "s1" }]);
      expect(prisma.scholarship.findMany).toHaveBeenCalledWith({
        orderBy: { endDate: "desc" },
      });
    });
  });
});

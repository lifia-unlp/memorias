import { describe, it, expect, vi, beforeEach } from "vitest";
import { publicationService } from "../publicationService";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    publication: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

describe("publicationService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("throws error if missing required parameters", async () => {
      await expect(
        publicationService.create({ title: "", authors: "Someone", year: 2025, type: "article" })
      ).rejects.toThrow("Title, Authors, Year, and Type are mandatory fields");
    });

    it("creates publication successfully resolving unique slug and formatting BibTeX data", async () => {
      vi.mocked(prisma.publication.findFirst).mockResolvedValue(null);
      // Mock findUnique to return null immediately on slug lookup
      vi.mocked(prisma.publication.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.publication.create).mockResolvedValue({ id: "1", slug: "pub-slug", title: "Pub Title" } as any);

      const res = await publicationService.create({
        title: "Pub Title",
        authors: "Author A",
        year: 2025,
        type: "article",
      });

      expect(res.title).toBe("Pub Title");
      expect(prisma.publication.create).toHaveBeenCalled();
    });
  });

  describe("delete", () => {
    it("deletes publication by id", async () => {
      vi.mocked(prisma.publication.delete).mockResolvedValue({ id: "pb1" } as any);
      const res = await publicationService.delete("pb1");
      expect(res.id).toBe("pb1");
      expect(prisma.publication.delete).toHaveBeenCalledWith({ where: { id: "pb1" } });
    });
  });

  describe("getAllPublications", () => {
    it("fetches publications sorted by year desc", async () => {
      vi.mocked(prisma.publication.findMany).mockResolvedValue([{ id: "pb1" }] as any);
      const res = await publicationService.getAllPublications({ type: "article" });
      expect(res).toEqual([{ id: "pb1" }]);
      expect(prisma.publication.findMany).toHaveBeenCalledWith({
        where: { type: "article" },
        orderBy: { year: "desc" },
      });
    });
  });

  describe("getDistinctYears", () => {
    it("fetches distinct publication years sorted desc", async () => {
      vi.mocked(prisma.publication.findMany).mockResolvedValue([
        { year: 2026 },
        { year: 2025 },
      ] as any);
      const res = await publicationService.getDistinctYears();
      expect(res).toEqual([2026, 2025]);
      expect(prisma.publication.findMany).toHaveBeenCalledWith({
        select: { year: true },
        distinct: ["year"],
        orderBy: { year: "desc" },
      });
    });
  });

  describe("getBySlug", () => {
    it("fetches publication by slug including deep relation selected ids", async () => {
      vi.mocked(prisma.publication.findUnique).mockResolvedValue({ id: "pb1", slug: "pb-a" } as any);
      const res = await publicationService.getBySlug("pb-a");
      expect(res?.slug).toBe("pb-a");
      expect(prisma.publication.findUnique).toHaveBeenCalledWith({
        where: { slug: "pb-a" },
        include: {
          members: { select: { id: true } },
          projects: { select: { id: true } },
          theses: { select: { id: true } },
        },
      });
    });
  });

  describe("getPublicationDetail", () => {
    it("fetches publication detail with related collections", async () => {
      vi.mocked(prisma.publication.findUnique).mockResolvedValue({ id: "pb1" } as any);
      const res = await publicationService.getPublicationDetail("pb-a");
      expect(res).toEqual({ id: "pb1" });
      expect(prisma.publication.findUnique).toHaveBeenCalledWith({
        where: { slug: "pb-a" },
        include: {
          members: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              slug: true,
              positionAtLab: true,
              avatarUrl: true,
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
    it("fetches all publications sorted by year desc", async () => {
      vi.mocked(prisma.publication.findMany).mockResolvedValue([{ id: "pb1" }] as any);
      const res = await publicationService.getFormSelectionList();
      expect(res).toEqual([{ id: "pb1" }]);
      expect(prisma.publication.findMany).toHaveBeenCalledWith({
        orderBy: { year: "desc" },
      });
    });
  });

  describe("getFeatured", () => {
    it("fetches featured publications sorted by updatedAt desc", async () => {
      vi.mocked(prisma.publication.findMany).mockResolvedValue([{ id: "pb2", featured: true }] as any);
      const res = await publicationService.getFeatured();
      expect(res).toEqual([{ id: "pb2", featured: true }]);
      expect(prisma.publication.findMany).toHaveBeenCalledWith({
        where: { featured: true },
        orderBy: { updatedAt: "desc" },
      });
    });
  });
});

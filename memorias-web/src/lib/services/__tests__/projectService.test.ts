import { describe, it, expect, vi, beforeEach } from "vitest";
import { projectService } from "../projectService";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    project: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findMany: vi.fn(),
    },
    thesis: {
      findMany: vi.fn(),
    },
    scholarship: {
      findMany: vi.fn(),
    },
    publication: {
      findMany: vi.fn(),
    },
  },
}));

describe("projectService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("throws error if duplicate title is found and bypass check is inactive", async () => {
      vi.mocked(prisma.project.findFirst).mockResolvedValue({ id: "1", title: "Project A" } as any);
      await expect(
        projectService.create({ title: "Project A", startDate: new Date(), endDate: new Date() })
      ).rejects.toThrow("DUPLICATE_TITLE");
    });

    it("creates project successfully bypassing duplicate checks if requested", async () => {
      vi.mocked(prisma.project.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.project.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.project.create).mockResolvedValue({ id: "2", title: "Project B" } as any);

      const res = await projectService.create({ title: "Project B", startDate: new Date(), endDate: new Date() });
      expect(res.title).toBe("Project B");
      expect(prisma.project.create).toHaveBeenCalled();
    });
  });

  describe("delete", () => {
    it("throws referential block error if referenced by theses", async () => {
      vi.mocked(prisma.thesis.findMany).mockResolvedValue([{ title: "Thesis A" }] as any);
      vi.mocked(prisma.scholarship.findMany).mockResolvedValue([]);
      vi.mocked(prisma.publication.findMany).mockResolvedValue([]);

      await expect(projectService.delete("1")).rejects.toThrow("REFERENTIAL_BLOCK");
    });
  });

  describe("getAllProjects", () => {
    it("fetches projects with member summaries sorted by endDate desc", async () => {
      vi.mocked(prisma.project.findMany).mockResolvedValue([{ id: "p1" }] as any);
      const res = await projectService.getAllProjects();
      expect(res).toEqual([{ id: "p1" }]);
      expect(prisma.project.findMany).toHaveBeenCalledWith({
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
    it("fetches project by slug including member IDs", async () => {
      vi.mocked(prisma.project.findUnique).mockResolvedValue({ id: "p1", slug: "p-a" } as any);
      const res = await projectService.getBySlug("p-a");
      expect(res?.slug).toBe("p-a");
      expect(prisma.project.findUnique).toHaveBeenCalledWith({
        where: { slug: "p-a" },
        include: {
          members: { select: { id: true } },
        },
      });
    });
  });

  describe("getProjectDetail", () => {
    it("fetches project details with related collections", async () => {
      vi.mocked(prisma.project.findUnique).mockResolvedValue({ id: "p1" } as any);
      const res = await projectService.getProjectDetail("p-a");
      expect(res).toEqual({ id: "p1" });
      expect(prisma.project.findUnique).toHaveBeenCalledWith({
        where: { slug: "p-a" },
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
    it("fetches all projects sorted by endDate desc", async () => {
      vi.mocked(prisma.project.findMany).mockResolvedValue([{ id: "p1" }] as any);
      const res = await projectService.getFormSelectionList();
      expect(res).toEqual([{ id: "p1" }]);
      expect(prisma.project.findMany).toHaveBeenCalledWith({
        orderBy: { endDate: "desc" },
      });
    });
  });
});

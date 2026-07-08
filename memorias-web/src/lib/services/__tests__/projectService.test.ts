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
});

import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
vi.mock("@/lib/prisma", () => ({
  prisma: {
    member: { findMany: vi.fn(), update: vi.fn(), findUnique: vi.fn() },
    project: { findMany: vi.fn(), update: vi.fn() },
    thesis: { findMany: vi.fn(), update: vi.fn() },
    scholarship: { findMany: vi.fn(), update: vi.fn() },
    publication: { findMany: vi.fn(), update: vi.fn() },
    systemOption: { findMany: vi.fn(), findFirst: vi.fn(), create: vi.fn() },
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/audit", () => ({
  logAction: vi.fn(() => Promise.resolve()),
}));

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------
import { tagService } from "../tagService";
import { prisma } from "@/lib/prisma";

const mockedPrisma = vi.mocked(prisma, true);

describe("tagService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getItemsByTag", () => {
    it("returns empty arrays if tag is empty", async () => {
      const result = await tagService.getItemsByTag(" ");
      expect(result.totalMatches).toBe(0);
      expect(result.members).toEqual([]);
    });

    it("performs search across all 5 models for the tag", async () => {
      mockedPrisma.member.findMany.mockResolvedValueOnce([{ id: "m1" }] as any);
      mockedPrisma.project.findMany.mockResolvedValueOnce([{ id: "p1" }] as any);
      mockedPrisma.thesis.findMany.mockResolvedValueOnce([]);
      mockedPrisma.scholarship.findMany.mockResolvedValueOnce([]);
      mockedPrisma.publication.findMany.mockResolvedValueOnce([]);

      const result = await tagService.getItemsByTag("machine-learning");

      expect(result.totalMatches).toBe(2);
      expect(result.members).toHaveLength(1);
      expect(result.projects).toHaveLength(1);
      expect(mockedPrisma.member.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tags: { has: "machine-learning" } },
        })
      );
    });
  });

  describe("addSystemTag", () => {
    it("does not create SystemOption if tag already exists", async () => {
      mockedPrisma.systemOption.findFirst.mockResolvedValueOnce({ id: "opt-1", value: "nlp" } as any);

      const result = await tagService.addSystemTag("nlp");

      expect(result).toEqual({ success: true });
      expect(mockedPrisma.systemOption.create).not.toHaveBeenCalled();
    });

    it("creates SystemOption if tag is new", async () => {
      mockedPrisma.systemOption.findFirst.mockResolvedValueOnce(null);
      mockedPrisma.systemOption.create.mockResolvedValueOnce({} as any);

      const result = await tagService.addSystemTag("robotics");

      expect(result).toEqual({ success: true });
      expect(mockedPrisma.systemOption.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            listName: "taxonomy_tag",
            value: "robotics",
          },
        })
      );
    });
  });

  describe("deriveMemberTags", () => {
    it("returns empty array if member does not exist", async () => {
      mockedPrisma.member.findUnique.mockResolvedValueOnce(null);
      const result = await tagService.deriveMemberTags("nonexistent");
      expect(result).toEqual([]);
    });

    it("derives top 3 tags based on connected items tags frequency", async () => {
      mockedPrisma.member.findUnique.mockResolvedValueOnce({
        id: "m1",
        projects: [{ tags: ["nlp", "ml"] }],
        theses: [{ tags: ["nlp", "ai"] }],
        scholarships: [{ tags: ["nlp"] }],
        publications: [{ tags: ["ml"] }],
      } as any);

      const result = await tagService.deriveMemberTags("m1");

      // nlp count: 3, ml count: 2, ai count: 1
      expect(result).toEqual(["nlp", "ml", "ai"]);
    });
  });

  describe("getAutoTaggerQueue", () => {
    it("constructs queue correctly mapping project details", async () => {
      mockedPrisma.project.findMany.mockResolvedValueOnce([
        { id: "p1", title: "Project A", summary: "Summary A", tags: ["existing"] }
      ] as any);

      const result = await tagService.getAutoTaggerQueue({
        targets: ["project"],
        mode: "replace"
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: "p1",
        target: "project",
        title: "Project A",
        summary: "Summary A",
        currentTags: ["existing"]
      });
    });

    it("filters out items when mode is skip and tags are present", async () => {
      mockedPrisma.project.findMany.mockResolvedValueOnce([
        { id: "p1", title: "Project A", summary: "Summary A", tags: ["existing"] }
      ] as any);

      const result = await tagService.getAutoTaggerQueue({
        targets: ["project"],
        mode: "skip"
      });

      expect(result).toHaveLength(0);
    });
  });

  describe("updateEntityTags", () => {
    it("updates correct model based on target", async () => {
      mockedPrisma.project.update.mockResolvedValueOnce({} as any);

      await tagService.updateEntityTags("project", "p1", ["new-tag"]);

      expect(mockedPrisma.project.update).toHaveBeenCalledWith({
        where: { id: "p1" },
        data: { tags: ["new-tag"] }
      });
    });
  });
});

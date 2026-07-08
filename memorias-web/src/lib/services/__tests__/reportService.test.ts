import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
vi.mock("@/lib/prisma", () => ({
  prisma: {
    member: { findMany: vi.fn() },
    publication: { findMany: vi.fn() },
    project: { findMany: vi.fn() },
    scholarship: { findMany: vi.fn() },
    thesis: { findMany: vi.fn() },
    systemOption: { findMany: vi.fn() },
    report: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock("@/lib/citations", () => ({
  formatCitation: vi.fn(() => ({
    html: "<span>citation</span>",
    text: "citation text",
  })),
}));

vi.mock("@/lib/services/tagService", () => ({
  tagService: {
    getDistinctTags: vi.fn(() => Promise.resolve(["ml", "nlp", "ai"])),
  },
}));

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------
import { reportService } from "../reportService";
import { prisma } from "@/lib/prisma";
import { tagService } from "@/lib/services/tagService";

const mockedPrisma = vi.mocked(prisma, true);
const mockedTagService = vi.mocked(tagService, true);

describe("reportService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getInitData", () => {
    it("returns members, years, and options tags", async () => {
      mockedPrisma.member.findMany.mockResolvedValueOnce([{ id: "m1", firstName: "A", lastName: "B" }] as any);
      // first call: distinct years; second call: distinct types
      mockedPrisma.publication.findMany
        .mockResolvedValueOnce([{ year: 2021 }, { year: 2020 }] as any)
        .mockResolvedValueOnce([{ type: "article" }] as any);
      mockedPrisma.scholarship.findMany.mockResolvedValueOnce([{ type: "conicet" }] as any);
      mockedPrisma.thesis.findMany.mockResolvedValueOnce([{ level: "phd" }] as any);
      mockedPrisma.systemOption.findMany.mockResolvedValue([]);
      mockedTagService.getDistinctTags.mockResolvedValueOnce(["ml", "ai"]);

      const data = await reportService.getInitData();

      expect(data.members).toHaveLength(1);
      expect(data.publicationYears).toEqual([2021, 2020]);
      expect(data.tags).toEqual(["ml", "ai"]);
    });
  });

  describe("saveReport", () => {
    it("throws if report with same title exists for user", async () => {
      mockedPrisma.report.findFirst.mockResolvedValueOnce({ id: "r1", title: "My Report" } as any);

      const result = await reportService.saveReport("user-123", {
        title: "My Report",
        blocks: [],
      });

      expect(result.duplicate).toBe(true);
      expect(result.existingId).toBe("r1");
    });

    it("creates report if no duplicate exists and id is missing", async () => {
      mockedPrisma.report.findFirst.mockResolvedValueOnce(null);
      mockedPrisma.report.create.mockResolvedValueOnce({ id: "r-new", title: "New" } as any);

      const result = await reportService.saveReport("user-123", {
        title: "New",
        blocks: [],
      });

      expect(result.duplicate).toBe(false);
      expect(result.report?.id).toBe("r-new");
    });
  });

  describe("deleteReport", () => {
    it("throws error if user does not own the report", async () => {
      mockedPrisma.report.findUnique.mockResolvedValueOnce({ id: "r1", userId: "other-user" } as any);

      await expect(reportService.deleteReport("r1", "user-123")).rejects.toThrow(
        "Unauthorized. You do not own this report."
      );
    });

    it("deletes report if user is the owner", async () => {
      mockedPrisma.report.findUnique.mockResolvedValueOnce({ id: "r1", userId: "user-123" } as any);
      mockedPrisma.report.delete.mockResolvedValueOnce({} as any);

      const result = await reportService.deleteReport("r1", "user-123");

      expect(result).toEqual({ success: true });
      expect(mockedPrisma.report.delete).toHaveBeenCalledWith({
        where: { id: "r1" },
      });
    });
  });
});

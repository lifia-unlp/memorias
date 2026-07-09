import { describe, it, expect, vi, beforeEach } from "vitest";
import { statisticsService } from "../statisticsService";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    publication: { findMany: vi.fn() },
    scholarship: { findMany: vi.fn() },
    member: { findMany: vi.fn() },
    project: { findMany: vi.fn() },
    thesis: { findMany: vi.fn() },
  },
}));

describe("statisticsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getStatisticsData", () => {
    it("returns aggregated data metrics correctly", async () => {
      // Mock publications
      vi.mocked(prisma.publication.findMany).mockResolvedValue([
        { year: 2026, type: "article" },
        { year: 2025, type: "book" },
      ] as any);

      // Mock scholarships
      vi.mocked(prisma.scholarship.findMany).mockResolvedValue([
        { startDate: new Date("2024-01-01"), endDate: null, type: "Doctoral" },
      ] as any);

      // Mock members
      vi.mocked(prisma.member.findMany).mockResolvedValue([
        { highestDegree: "PhD", positionAtLab: "Researcher", endDate: null },
      ] as any);

      // Mock projects
      vi.mocked(prisma.project.findMany).mockResolvedValue([
        { startDate: new Date("2024-01-01"), endDate: new Date("2027-12-31"), fundingAgency: "UNLP" },
      ] as any);

      // Mock theses
      vi.mocked(prisma.thesis.findMany).mockResolvedValue([
        { startDate: new Date("2024-01-01"), endDate: null, progress: 50 },
      ] as any);

      const res = await statisticsService.getStatisticsData();

      // Check production results
      const yr2026 = res.production.find((p) => p.year === 2026);
      expect(yr2026?.article).toBe(1);
      expect(yr2026?.total).toBe(1);

      // Check funding
      const unlpAgency = res.fundingAgencies.find((f) => f.label === "UNLP");
      expect(unlpAgency?.value).toBe(1);

      // Check summary
      expect(res.summary.totalMembers).toBe(1);
      expect(res.summary.activeProjects).toBe(1);
      expect(res.summary.activeTheses).toBe(1);
    });
  });
});

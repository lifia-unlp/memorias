import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
vi.mock("@/lib/prisma", () => ({
  prisma: {
    member: { count: vi.fn(), findMany: vi.fn() },
    project: { count: vi.fn(), findMany: vi.fn() },
    thesis: { count: vi.fn(), findMany: vi.fn() },
    scholarship: { count: vi.fn(), findMany: vi.fn() },
    publication: { count: vi.fn(), findMany: vi.fn() },
  },
}));

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------
import { searchService } from "../searchService";
import { prisma } from "@/lib/prisma";

const mockedPrisma = vi.mocked(prisma, true);

describe("searchService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedPrisma.member.count.mockResolvedValue(0);
    mockedPrisma.project.count.mockResolvedValue(0);
    mockedPrisma.thesis.count.mockResolvedValue(0);
    mockedPrisma.scholarship.count.mockResolvedValue(0);
    mockedPrisma.publication.count.mockResolvedValue(0);
    mockedPrisma.member.findMany.mockResolvedValue([]);
    mockedPrisma.project.findMany.mockResolvedValue([]);
    mockedPrisma.thesis.findMany.mockResolvedValue([]);
    mockedPrisma.scholarship.findMany.mockResolvedValue([]);
    mockedPrisma.publication.findMany.mockResolvedValue([]);
  });

  it("delegates count queries to prisma for parallel totals", async () => {
    mockedPrisma.member.count.mockResolvedValueOnce(5);
    mockedPrisma.project.count.mockResolvedValueOnce(2);

    const result = await searchService.search("Diego");

    expect(result.counts.all).toBe(7);
    expect(result.counts.member).toBe(5);
    expect(result.counts.project).toBe(2);
    expect(mockedPrisma.member.count).toHaveBeenCalledOnce();
  });

  it("performs paginated query for specific type filter: member", async () => {
    mockedPrisma.member.count.mockResolvedValueOnce(1);
    const mockMembers = [{ id: "m1", slug: "m-1", firstName: "D", lastName: "T", updatedAt: new Date() }];
    mockedPrisma.member.findMany.mockResolvedValueOnce(mockMembers as any);

    const result = await searchService.search("Diego", "member", 1, 10);

    expect(result.paginatedResults).toHaveLength(1);
    expect(result.paginatedResults[0]).toMatchObject({
      id: "m1",
      type: "member",
      slug: "m-1",
    });
    expect(mockedPrisma.member.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 10,
        skip: 0,
      })
    );
  });

  it("performs merged parallel fetch for 'all' typeFilter", async () => {
    const date1 = new Date("2023-01-01");
    const date2 = new Date("2023-02-01");
    mockedPrisma.member.findMany.mockResolvedValueOnce([
      { id: "m1", slug: "m-1", updatedAt: date1 },
    ]);
    mockedPrisma.project.findMany.mockResolvedValueOnce([
      { id: "p1", slug: "p-1", updatedAt: date2 },
    ]);
    mockedPrisma.thesis.findMany.mockResolvedValueOnce([]);
    mockedPrisma.scholarship.findMany.mockResolvedValueOnce([]);
    mockedPrisma.publication.findMany.mockResolvedValueOnce([]);

    const result = await searchService.search("test", "all", 1, 10);

    // Sorted by updatedAt desc, so project (date2) should be first
    expect(result.paginatedResults).toHaveLength(2);
    expect(result.paginatedResults[0].id).toBe("p1");
    expect(result.paginatedResults[1].id).toBe("m1");
  });
});

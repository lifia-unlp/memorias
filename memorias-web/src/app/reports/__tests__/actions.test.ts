import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks — must be hoisted before any imports that use them
// ---------------------------------------------------------------------------

// Mock auth (NextAuth) — prevents next-auth from resolving next/server
vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

// Mock next/cache (used in server actions indirectly)
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

// Mock next/navigation (may be pulled in transitively)
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/",
}));

// Mock prisma
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

// Mock tagService
vi.mock("@/lib/services/tagService", () => ({
  tagService: {
    getDistinctTags: vi.fn(() => Promise.resolve(["ml", "nlp", "ai"])),
  },
}));

// Mock formatCitation
vi.mock("@/lib/citations", () => ({
  formatCitation: vi.fn((_pub: unknown, style: string) => ({
    html: `<span>Citation (${style})</span>`,
    text: `Citation text (${style})`,
  })),
}));

// Mock fs (used by generateReportAIContent)
vi.mock("fs", () => ({
  default: { readFileSync: vi.fn(() => "You are an assistant. Limit: {{MAX_LENGTH}} words.") },
}));

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  ensureActiveUser,
  queryPublications,
  queryProjects,
  queryScholarships,
  queryTheses,
  saveReport,
  getReports,
  deleteReport,
  generateReportAIContent,
} from "../actions";

// Typed mocks
const mockedAuth = vi.mocked(auth) as any;
const mockedPrisma = vi.mocked(prisma, true) as any;

const activeSession = {
  user: { id: "user-1", active: true, role: "ADMIN" },
};
const activeEditorSession = {
  user: { id: "user-1", active: true, role: "EDITOR" },
};
const inactiveSession = {
  user: { id: "user-1", active: false, role: "ADMIN" },
};

// ---------------------------------------------------------------------------
// ensureActiveUser
// ---------------------------------------------------------------------------
describe("ensureActiveUser", () => {
  it("throws when there is no session", async () => {
    mockedAuth.mockResolvedValueOnce(null);
    await expect(ensureActiveUser()).rejects.toThrow("Unauthorized");
  });

  it("throws when the session is inactive", async () => {
    mockedAuth.mockResolvedValueOnce(inactiveSession as any);
    await expect(ensureActiveUser()).rejects.toThrow("Unauthorized");
  });

  it("resolves without throwing for an active session", async () => {
    mockedAuth.mockResolvedValueOnce(activeSession as any);
    await expect(ensureActiveUser()).resolves.toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// queryPublications
// ---------------------------------------------------------------------------
describe("queryPublications", () => {
  const defaultSort = { field: "year" as const, direction: "desc" as const };

  beforeEach(() => {
    vi.clearAllMocks();
    mockedAuth.mockResolvedValue(activeSession as any);
    mockedPrisma.publication.findMany.mockResolvedValue([]);
  });

  it("builds empty where when no filters are provided", async () => {
    await queryPublications({}, defaultSort);
    const call = mockedPrisma.publication.findMany.mock.calls[0][0];
    expect(call.where).toEqual({});
  });

  it("builds memberIds filter", async () => {
    await queryPublications({ memberIds: ["m1", "m2"] }, defaultSort);
    const { where } = mockedPrisma.publication.findMany.mock.calls[0][0];
    expect(where.members).toEqual({ some: { id: { in: ["m1", "m2"] } } });
  });

  it("builds types filter", async () => {
    await queryPublications({ types: ["article", "book"] }, defaultSort);
    const { where } = mockedPrisma.publication.findMany.mock.calls[0][0];
    expect(where.type).toEqual({ in: ["article", "book"] });
  });

  it("builds exact year filter", async () => {
    await queryPublications({ year: "2021" }, defaultSort);
    const { where } = mockedPrisma.publication.findMany.mock.calls[0][0];
    expect(where.year).toBe(2021);
  });

  it("builds year range filter with startYear and endYear", async () => {
    await queryPublications({ year: "all", startYear: 2018, endYear: 2022 }, defaultSort);
    const { where } = mockedPrisma.publication.findMany.mock.calls[0][0];
    expect(where.year).toEqual({ gte: 2018, lte: 2022 });
  });

  it("builds tag filter when not all tags are selected", async () => {
    await queryPublications({ tags: ["ml"] }, defaultSort);
    const { where } = mockedPrisma.publication.findMany.mock.calls[0][0];
    expect(where.tags).toEqual({ hasSome: ["ml"] });
  });

  it("does NOT apply tag filter when all available tags are selected", async () => {
    await queryPublications({ tags: ["ml", "nlp", "ai"] }, defaultSort);
    const { where } = mockedPrisma.publication.findMany.mock.calls[0][0];
    expect(where.tags).toBeUndefined();
  });

  it("sorts by title when sort.field is title", async () => {
    await queryPublications({}, { field: "title", direction: "asc" });
    const { orderBy } = mockedPrisma.publication.findMany.mock.calls[0][0];
    expect(orderBy[0]).toEqual({ title: "asc" });
  });

  it("maps results through formatCitation", async () => {
    mockedPrisma.publication.findMany.mockResolvedValueOnce([
      {
        id: "pub-1",
        slug: "pub-1",
        type: "article",
        title: "Test Paper",
        authors: "Smith, J.",
        year: 2020,
        members: [],
      },
    ] as any);
    const results = await queryPublications({ style: "vancouver" }, defaultSort);
    expect(results[0].citationText).toContain("vancouver");
  });
});

// ---------------------------------------------------------------------------
// queryProjects — tests for buildActiveYearFilters indirectly
// ---------------------------------------------------------------------------
describe("queryProjects", () => {
  const defaultSort = { field: "year" as const, direction: "desc" as const };

  beforeEach(() => {
    vi.clearAllMocks();
    mockedAuth.mockResolvedValue(activeSession as any);
    mockedPrisma.project.findMany.mockResolvedValue([]);
  });

  it("builds AND filter for startYear: OR includes endDate null (ongoing projects)", async () => {
    await queryProjects({ startYear: 2020 }, defaultSort);
    const { where } = mockedPrisma.project.findMany.mock.calls[0][0];
    expect(where.AND).toHaveLength(1);
    // startYear filter: project must have ended on/after startYear OR be still active (endDate null)
    expect(where.AND[0].OR).toEqual(
      expect.arrayContaining([{ endDate: null }])
    );
  });

  it("builds AND filter for endYear: OR includes startDate null", async () => {
    await queryProjects({ endYear: 2023 }, defaultSort);
    const { where } = mockedPrisma.project.findMany.mock.calls[0][0];
    expect(where.AND).toHaveLength(1);
    // endYear filter: project must have started before endYear OR has no startDate
    expect(where.AND[0].OR).toEqual(
      expect.arrayContaining([{ startDate: null }])
    );
  });

  it("builds two AND filters when both startYear and endYear are set", async () => {
    await queryProjects({ startYear: 2018, endYear: 2023 }, defaultSort);
    const { where } = mockedPrisma.project.findMany.mock.calls[0][0];
    expect(where.AND).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// saveReport
// ---------------------------------------------------------------------------
describe("saveReport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws when session is missing", async () => {
    mockedAuth.mockResolvedValueOnce(null);
    await expect(saveReport({ title: "R1", blocks: [] })).rejects.toThrow("Unauthorized");
  });

  it("returns duplicate: true when a report with the same title exists", async () => {
    mockedAuth.mockResolvedValueOnce(activeSession as any);
    mockedPrisma.report.findFirst.mockResolvedValueOnce({ id: "existing-id", title: "R1" } as any);
    const result = await saveReport({ title: "R1", blocks: [] });
    expect(result).toMatchObject({ duplicate: true, existingId: "existing-id" });
  });

  it("creates a new report when no id is provided", async () => {
    mockedAuth.mockResolvedValueOnce(activeSession as any);
    mockedPrisma.report.findFirst.mockResolvedValueOnce(null);
    const created = { id: "new-id", title: "R2", blocks: [] };
    mockedPrisma.report.create.mockResolvedValueOnce(created as any);
    const result = await saveReport({ title: "R2", blocks: [] });
    expect(result).toMatchObject({ duplicate: false, report: created });
  });

  it("updates existing report when id is provided and user owns it", async () => {
    mockedAuth.mockResolvedValueOnce(activeSession as any);
    mockedPrisma.report.findFirst.mockResolvedValueOnce(null);
    mockedPrisma.report.findUnique.mockResolvedValueOnce({
      id: "r-1",
      userId: "user-1",
    } as any);
    const updated = { id: "r-1", title: "Updated" };
    mockedPrisma.report.update.mockResolvedValueOnce(updated as any);
    const result = await saveReport({ id: "r-1", title: "Updated", blocks: [] });
    expect(result).toMatchObject({ duplicate: false, report: updated });
  });

  it("throws when user does not own the report", async () => {
    mockedAuth.mockResolvedValueOnce(activeSession as any);
    mockedPrisma.report.findFirst.mockResolvedValueOnce(null);
    mockedPrisma.report.findUnique.mockResolvedValueOnce({
      id: "r-1",
      userId: "other-user",
    } as any);
    await expect(saveReport({ id: "r-1", title: "Hack", blocks: [] })).rejects.toThrow(
      "Unauthorized. You do not own this report."
    );
  });
});

// ---------------------------------------------------------------------------
// deleteReport
// ---------------------------------------------------------------------------
describe("deleteReport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws when report does not exist", async () => {
    mockedAuth.mockResolvedValueOnce(activeSession as any);
    mockedPrisma.report.findUnique.mockResolvedValueOnce(null);
    await expect(deleteReport("nonexistent")).rejects.toThrow("Report not found.");
  });

  it("throws when user does not own the report", async () => {
    mockedAuth.mockResolvedValueOnce(activeSession as any);
    mockedPrisma.report.findUnique.mockResolvedValueOnce({
      id: "r-1",
      userId: "other-user",
    } as any);
    await expect(deleteReport("r-1")).rejects.toThrow("Unauthorized");
  });

  it("deletes and returns success when user owns the report", async () => {
    mockedAuth.mockResolvedValueOnce(activeSession as any);
    mockedPrisma.report.findUnique.mockResolvedValueOnce({
      id: "r-1",
      userId: "user-1",
    } as any);
    mockedPrisma.report.delete.mockResolvedValueOnce({} as any);
    const result = await deleteReport("r-1");
    expect(result).toEqual({ success: true });
    expect(mockedPrisma.report.delete).toHaveBeenCalledWith({ where: { id: "r-1" } });
  });
});

// ---------------------------------------------------------------------------
// generateReportAIContent
// ---------------------------------------------------------------------------
describe("generateReportAIContent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.OPENAI_API_KEY = "test-key";
  });

  it("throws for non-ADMIN / non-POWER_EDITOR roles", async () => {
    mockedAuth.mockResolvedValueOnce(activeEditorSession as any);
    await expect(
      generateReportAIContent({ prompt: "Summarize", maxLength: 200, inputContent: "ctx" })
    ).rejects.toThrow("Unauthorized. GenAI blocks are restricted");
  });

  it("returns empty content when prompt is blank", async () => {
    mockedAuth.mockResolvedValueOnce(activeSession as any);
    const result = await generateReportAIContent({
      prompt: "   ",
      maxLength: 200,
      inputContent: "ctx",
    });
    expect(result).toEqual({ content: "" });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("throws when OPENAI_API_KEY is missing", async () => {
    mockedAuth.mockResolvedValueOnce(activeSession as any);
    delete process.env.OPENAI_API_KEY;
    await expect(
      generateReportAIContent({ prompt: "Summarize", maxLength: 200, inputContent: "ctx" })
    ).rejects.toThrow("OpenAI API key is missing");
  });

  it("calls OpenAI and returns content", async () => {
    mockedAuth.mockResolvedValueOnce(activeSession as any);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "Generated text." } }],
      }),
    });
    const result = await generateReportAIContent({
      prompt: "Summarize research",
      maxLength: 300,
      inputContent: "Some context",
    });
    expect(result).toEqual({ content: "Generated text." });
    expect(mockFetch).toHaveBeenCalledOnce();
  });

  it("throws when OpenAI responds with non-ok status", async () => {
    mockedAuth.mockResolvedValueOnce(activeSession as any);
    mockFetch.mockResolvedValueOnce({
      ok: false,
      statusText: "Too Many Requests",
      text: async () => "rate limit",
    });
    await expect(
      generateReportAIContent({ prompt: "Summarize", maxLength: 200, inputContent: "ctx" })
    ).rejects.toThrow("LLM Generation failed");
  });
});

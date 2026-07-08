import { describe, it, expect, vi } from "vitest";

// ---------------------------------------------------------------------------
// Mocks — hoisted to prevent next-auth / prisma resolution in jsdom
// ---------------------------------------------------------------------------
vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("../actions", () => ({
  getReportInitData: vi.fn(() => Promise.resolve(null)),
  queryPublications: vi.fn(() => Promise.resolve([])),
  queryProjects: vi.fn(() => Promise.resolve([])),
  queryScholarships: vi.fn(() => Promise.resolve([])),
  queryTheses: vi.fn(() => Promise.resolve([])),
  saveReport: vi.fn(() => Promise.resolve({ duplicate: false, report: { id: "r1" } })),
  getReports: vi.fn(() => Promise.resolve([])),
  deleteReport: vi.fn(() => Promise.resolve({ success: true })),
  generateReportAIContent: vi.fn(() => Promise.resolve({ content: "" })),
}));
import {
  formatDateRange,
  buildProjectSentence,
  buildScholarshipSentence,
  buildThesisSentence,
  getBlockMarkdownContext,
  type Block,
} from "../useReportCompiler";

// ---------------------------------------------------------------------------
// formatDateRange
// ---------------------------------------------------------------------------
describe("formatDateRange", () => {
  it("formats both valid dates", () => {
    const result = formatDateRange("2020-03-15", "2023-11-01");
    expect(result).toContain("2020");
    expect(result).toContain("2023");
    expect(result).toContain(" - ");
  });

  it("shows N/D when startDate is null", () => {
    expect(formatDateRange(null, "2023-06-01")).toMatch(/^N\/D/);
  });

  it("shows N/D when startDate is undefined", () => {
    expect(formatDateRange(undefined, "2023-06-01")).toMatch(/^N\/D/);
  });

  it("shows Ongoing when endDate is null", () => {
    expect(formatDateRange("2020-01-01", null)).toContain("Ongoing");
  });

  it("shows Ongoing when endDate is undefined", () => {
    expect(formatDateRange("2020-01-01", undefined)).toContain("Ongoing");
  });

  it("shows N/D - Ongoing when both are null", () => {
    const result = formatDateRange(null, null);
    expect(result).toBe("N/D - Ongoing");
  });

  it("accepts Date objects", () => {
    const result = formatDateRange(new Date("2021-06-15"), new Date("2022-06-15"));
    expect(result).toContain("2021");
    expect(result).toContain("2022");
  });
});

// ---------------------------------------------------------------------------
// buildProjectSentence
// ---------------------------------------------------------------------------
describe("buildProjectSentence", () => {
  const base = { startDate: "2020-06-01", endDate: "2022-06-01" };

  it("includes the date range", () => {
    const result = buildProjectSentence(base);
    expect(result).toContain("Active from");
    expect(result).toContain("2020");
  });

  it("appends director when present and not N/A", () => {
    expect(buildProjectSentence({ ...base, director: "Dr. Smith" })).toContain(
      "directed by Dr. Smith"
    );
  });

  it("omits director when N/A", () => {
    expect(buildProjectSentence({ ...base, director: "N/A" })).not.toContain("directed by");
  });

  it("appends coDirector when present", () => {
    expect(buildProjectSentence({ ...base, coDirector: "Dr. Jones" })).toContain(
      "with Co-Director Dr. Jones"
    );
  });

  it("appends fundingAgency when present", () => {
    expect(buildProjectSentence({ ...base, fundingAgency: "CONICET" })).toContain(
      "funding provided by CONICET"
    );
  });

  it("appends amount when present alongside fundingAgency", () => {
    const result = buildProjectSentence({
      ...base,
      fundingAgency: "CONICET",
      amount: "$50,000",
    });
    expect(result).toContain("CONICET");
    expect(result).toContain("$50,000");
  });

  it("ends with a period", () => {
    expect(buildProjectSentence(base)).toMatch(/\.$/);
  });
});

// ---------------------------------------------------------------------------
// buildScholarshipSentence
// ---------------------------------------------------------------------------
describe("buildScholarshipSentence", () => {
  const base = { startDate: "2019-03-01", endDate: null };

  it("starts with Scholarship active from", () => {
    expect(buildScholarshipSentence(base)).toMatch(/^Scholarship active from/);
  });

  it("appends student when present", () => {
    expect(buildScholarshipSentence({ ...base, student: "Ana López" })).toContain(
      "awarded to student Ana López"
    );
  });

  it("appends director when not N/A", () => {
    expect(buildScholarshipSentence({ ...base, director: "Prof. Ruiz" })).toContain(
      "directed by Prof. Ruiz"
    );
  });

  it("omits coDirector when N/A", () => {
    expect(buildScholarshipSentence({ ...base, coDirector: "N/A" })).not.toContain(
      "Co-Director"
    );
  });

  it("appends fundingAgency", () => {
    expect(
      buildScholarshipSentence({ ...base, fundingAgency: "ANPCyT" })
    ).toContain("funding provided by ANPCyT");
  });

  it("ends with a period", () => {
    expect(buildScholarshipSentence(base)).toMatch(/\.$/);
  });
});

// ---------------------------------------------------------------------------
// buildThesisSentence
// ---------------------------------------------------------------------------
describe("buildThesisSentence", () => {
  const base = { startDate: "2021-01-01", endDate: null };

  it("starts with Thesis when no career", () => {
    expect(buildThesisSentence(base)).toMatch(/^Thesis active from/);
  });

  it("includes career in prefix", () => {
    expect(buildThesisSentence({ ...base, career: "Computer Science" })).toContain(
      "Thesis for career Computer Science"
    );
  });

  it("appends student when present", () => {
    expect(buildThesisSentence({ ...base, student: "Pedro García" })).toContain(
      "with student Pedro García"
    );
  });

  it("appends director when not N/A", () => {
    expect(buildThesisSentence({ ...base, director: "Dr. Vera" })).toContain("directed by Dr. Vera");
  });

  it("appends progress percentage", () => {
    expect(buildThesisSentence({ ...base, progress: "75" })).toContain("progress: 75%");
  });

  it("omits progress when N/A", () => {
    expect(buildThesisSentence({ ...base, progress: "N/A" })).not.toContain("progress:");
  });

  it("ends with a period", () => {
    expect(buildThesisSentence(base)).toMatch(/\.$/);
  });
});

// ---------------------------------------------------------------------------
// getBlockMarkdownContext
// ---------------------------------------------------------------------------
const makeBlock = (overrides: Partial<Block>): Block => ({
  id: "b1",
  type: "markdown",
  content: "",
  filters: {
    memberIds: [],
    types: [],
    year: "all",
    startYear: "",
    endYear: "",
    style: "apa",
    showSummary: true,
  },
  sort: { field: "year", direction: "desc" },
  compiledItems: [],
  ...overrides,
});

describe("getBlockMarkdownContext", () => {
  it("returns content for markdown blocks", () => {
    const block = makeBlock({ type: "markdown", content: "# Hello" });
    expect(getBlockMarkdownContext(block)).toBe("# Hello");
  });

  it("returns empty string for markdown block with no content", () => {
    const block = makeBlock({ type: "markdown", content: undefined });
    expect(getBlockMarkdownContext(block)).toBe("");
  });

  it("returns fallback message when publications block is empty", () => {
    const block = makeBlock({ type: "publications", compiledItems: [] });
    expect(getBlockMarkdownContext(block)).toBe("*No publications matched.*");
  });

  it("joins citation texts for publications", () => {
    const block = makeBlock({
      type: "publications",
      compiledItems: [
        { citationText: "Smith (2020). Paper A." },
        { citationText: "Jones (2021). Paper B." },
      ],
    });
    const result = getBlockMarkdownContext(block);
    expect(result).toContain("Smith (2020)");
    expect(result).toContain("Jones (2021)");
  });

  it("returns fallback message when projects block is empty", () => {
    const block = makeBlock({ type: "projects", compiledItems: [] });
    expect(getBlockMarkdownContext(block)).toBe("*No projects matched.*");
  });

  it("renders project title and sentence for projects", () => {
    const block = makeBlock({
      type: "projects",
      compiledItems: [
        {
          title: "My Project",
          code: "P-001",
          startDate: "2020-01-01",
          endDate: "2022-01-01",
          director: "N/A",
          coDirector: "N/A",
          responsibleGroup: "N/A",
          fundingAgency: "N/A",
          amount: "N/A",
          summary: "A great project.",
        },
      ],
    });
    const result = getBlockMarkdownContext(block);
    expect(result).toContain("### Project: My Project (P-001)");
    expect(result).toContain("Summary: A great project.");
  });

  it("returns fallback message when scholarships block is empty", () => {
    const block = makeBlock({ type: "scholarships", compiledItems: [] });
    expect(getBlockMarkdownContext(block)).toBe("*No scholarships matched.*");
  });

  it("returns fallback message when theses block is empty", () => {
    const block = makeBlock({ type: "theses", compiledItems: [] });
    expect(getBlockMarkdownContext(block)).toBe("*No theses matched.*");
  });

  it("renders thesis title and sentence for theses", () => {
    const block = makeBlock({
      type: "theses",
      compiledItems: [
        {
          title: "My Thesis",
          level: "PhD",
          startDate: "2018-01-01",
          endDate: null,
          career: "N/A",
          student: "N/A",
          director: "N/A",
          coDirector: "N/A",
          otherAdvisors: "N/A",
          progress: "N/A",
          summary: null,
        },
      ],
    });
    const result = getBlockMarkdownContext(block);
    expect(result).toContain("### Thesis: My Thesis (PhD)");
  });

  it("returns empty string for genai blocks", () => {
    const block = makeBlock({ type: "genai" });
    expect(getBlockMarkdownContext(block)).toBe("");
  });
});

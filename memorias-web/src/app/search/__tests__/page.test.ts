import { describe, it, expect, vi } from "vitest";

// ---------------------------------------------------------------------------
// Mocks — hoisted before the import of page.tsx
// ---------------------------------------------------------------------------

// Prevent prisma from being instantiated
vi.mock("@/lib/prisma", () => ({
  prisma: {
    member: { count: vi.fn(), findMany: vi.fn() },
    project: { count: vi.fn(), findMany: vi.fn() },
    thesis: { count: vi.fn(), findMany: vi.fn() },
    scholarship: { count: vi.fn(), findMany: vi.fn() },
    publication: { count: vi.fn(), findMany: vi.fn() },
  },
}));

// Prevent next/headers from being resolved (used by some Next.js internals)
vi.mock("next/headers", () => ({ headers: vi.fn(), cookies: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/search",
}));

// Mock all UI components to avoid resolving MUI or custom imports
vi.mock("@/components/Header", () => ({ Header: () => null }));
vi.mock("@/components/Footer", () => ({ Footer: () => null }));
vi.mock("@/components/Pagination", () => ({ Pagination: () => null }));
vi.mock("@/components/reusable/LinkComponents", () => ({ LinkButton: () => null }));
vi.mock("@/components/reusable/MemberSearchCard", () => ({ MemberSearchCard: () => null }));
vi.mock("@/components/reusable/ProjectSearchCard", () => ({ ProjectSearchCard: () => null }));
vi.mock("@/components/reusable/ThesisSearchCard", () => ({ ThesisSearchCard: () => null }));
vi.mock("@/components/reusable/ScholarshipSearchCard", () => ({ ScholarshipSearchCard: () => null }));
vi.mock("@/components/reusable/PublicationSearchCard", () => ({ PublicationSearchCard: () => null }));

// ---------------------------------------------------------------------------
// Imports — after mocks
// ---------------------------------------------------------------------------
import {
  buildMemberWhere,
  buildProjectWhere,
  buildThesisWhere,
  buildScholarshipWhere,
  buildPublicationWhere,
} from "../page";

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------
const expectEmptyWhere = (result: object) => {
  expect(result).toEqual({});
};

const getAndClauses = (result: any): any[] => result.AND;

const getOrClause = (result: any, index = 0): any[] =>
  getAndClauses(result)[index].OR;

// ---------------------------------------------------------------------------
// buildMemberWhere
// ---------------------------------------------------------------------------
describe("buildMemberWhere", () => {
  it("returns empty object for empty tokens", () => {
    expectEmptyWhere(buildMemberWhere([]));
  });

  it("builds a single AND clause for one token", () => {
    const result = buildMemberWhere(["smith"]);
    const clauses = getAndClauses(result);
    expect(clauses).toHaveLength(1);
  });

  it("builds multiple AND clauses for multiple tokens", () => {
    const result = buildMemberWhere(["smith", "phd"]);
    expect(getAndClauses(result)).toHaveLength(2);
  });

  it("includes firstName, lastName, interests, and tags in OR", () => {
    const result = buildMemberWhere(["test"]);
    const orItems = getOrClause(result);
    const keys = orItems.map((o: any) => Object.keys(o)[0]);
    expect(keys).toEqual(
      expect.arrayContaining(["firstName", "lastName", "interestsInEnglish", "interestsInSpanish", "tags"])
    );
  });

  it("strips # prefix for the tags filter but keeps token for other fields", () => {
    const result = buildMemberWhere(["#ml"]);
    const orItems = getOrClause(result);
    const tagsClause = orItems.find((o: any) => o.tags);
    const firstNameClause = orItems.find((o: any) => o.firstName);
    expect(tagsClause.tags).toEqual({ has: "ml" });
    expect(firstNameClause.firstName.contains).toBe("#ml");
  });

  it("uses insensitive mode on text fields", () => {
    const result = buildMemberWhere(["TEST"]);
    const orItems = getOrClause(result);
    const textClause = orItems.find((o: any) => o.firstName);
    expect(textClause.firstName.mode).toBe("insensitive");
  });
});

// ---------------------------------------------------------------------------
// buildProjectWhere
// ---------------------------------------------------------------------------
describe("buildProjectWhere", () => {
  it("returns empty object for empty tokens", () => {
    expectEmptyWhere(buildProjectWhere([]));
  });

  it("includes title, code, director, coDirector, summary, fundingAgency, tags", () => {
    const result = buildProjectWhere(["test"]);
    const orItems = getOrClause(result);
    const keys = orItems.map((o: any) => Object.keys(o)[0]);
    expect(keys).toEqual(
      expect.arrayContaining(["title", "code", "director", "coDirector", "summary", "fundingAgency", "tags"])
    );
  });

  it("strips # prefix for tags", () => {
    const result = buildProjectWhere(["#neural"]);
    const orItems = getOrClause(result);
    const tagsClause = orItems.find((o: any) => o.tags);
    expect(tagsClause.tags).toEqual({ has: "neural" });
  });

  it("builds AND for two tokens", () => {
    expect(getAndClauses(buildProjectWhere(["a", "b"]))).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// buildThesisWhere
// ---------------------------------------------------------------------------
describe("buildThesisWhere", () => {
  it("returns empty object for empty tokens", () => {
    expectEmptyWhere(buildThesisWhere([]));
  });

  it("includes title, student, director, coDirector, summary, career, tags", () => {
    const result = buildThesisWhere(["test"]);
    const orItems = getOrClause(result);
    const keys = orItems.map((o: any) => Object.keys(o)[0]);
    expect(keys).toEqual(
      expect.arrayContaining(["title", "student", "director", "coDirector", "summary", "career", "tags"])
    );
  });

  it("strips # prefix for tags", () => {
    const result = buildThesisWhere(["#phd"]);
    const orItems = getOrClause(result);
    const tagsClause = orItems.find((o: any) => o.tags);
    expect(tagsClause.tags).toEqual({ has: "phd" });
  });
});

// ---------------------------------------------------------------------------
// buildScholarshipWhere
// ---------------------------------------------------------------------------
describe("buildScholarshipWhere", () => {
  it("returns empty object for empty tokens", () => {
    expectEmptyWhere(buildScholarshipWhere([]));
  });

  it("includes title, student, director, coDirector, summary, type, tags", () => {
    const result = buildScholarshipWhere(["test"]);
    const orItems = getOrClause(result);
    const keys = orItems.map((o: any) => Object.keys(o)[0]);
    expect(keys).toEqual(
      expect.arrayContaining(["title", "student", "director", "coDirector", "summary", "type", "tags"])
    );
  });

  it("strips # prefix for tags", () => {
    const result = buildScholarshipWhere(["#conicet"]);
    const orItems = getOrClause(result);
    const tagsClause = orItems.find((o: any) => o.tags);
    expect(tagsClause.tags).toEqual({ has: "conicet" });
  });

  it("builds AND for two tokens", () => {
    expect(getAndClauses(buildScholarshipWhere(["a", "b"]))).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// buildPublicationWhere
// ---------------------------------------------------------------------------
describe("buildPublicationWhere", () => {
  it("returns empty object for empty tokens", () => {
    expectEmptyWhere(buildPublicationWhere([]));
  });

  it("includes title, authors, and tags", () => {
    const result = buildPublicationWhere(["test"]);
    const orItems = getOrClause(result);
    const keys = orItems.map((o: any) => Object.keys(o)[0]);
    expect(keys).toEqual(expect.arrayContaining(["title", "authors", "tags"]));
  });

  it("strips # prefix for tags", () => {
    const result = buildPublicationWhere(["#nlp"]);
    const orItems = getOrClause(result);
    const tagsClause = orItems.find((o: any) => o.tags);
    expect(tagsClause.tags).toEqual({ has: "nlp" });
  });

  it("non-# token is passed as-is to text fields", () => {
    const result = buildPublicationWhere(["nlp"]);
    const orItems = getOrClause(result);
    const titleClause = orItems.find((o: any) => o.title);
    expect(titleClause.title.contains).toBe("nlp");
  });

  it("builds AND for multiple tokens", () => {
    expect(getAndClauses(buildPublicationWhere(["a", "b", "c"]))).toHaveLength(3);
  });
});

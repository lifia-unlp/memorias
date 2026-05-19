"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function ensureActiveUser() {
  const session = await auth();
  if (!session || !session.user?.active) {
    throw new Error("Unauthorized. Active session required.");
  }
}

/**
 * Fetches all initialization data needed by the Report Builder page:
 * - Members list
 * - Distinct publication years and types
 * - Distinct scholarship types
 * - Distinct thesis levels
 */
export async function getReportInitData() {
  await ensureActiveUser();

  // 1. Fetch all members sorted by last name, then first name
  const members = await prisma.member.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      slug: true,
    },
    orderBy: [
      { lastName: "asc" },
      { firstName: "asc" },
    ],
  });

  // 2. Fetch distinct publication years
  const distinctPubYears = await prisma.publication.findMany({
    select: { year: true },
    distinct: ["year"],
    orderBy: { year: "desc" },
  });
  const publicationYears = distinctPubYears.map((p) => p.year);

  // 3. Fetch distinct publication types (stored in db or standard list)
  const distinctPubTypes = await prisma.publication.findMany({
    select: { type: true },
    distinct: ["type"],
  });
  const publicationTypes = Array.from(
    new Set([
      ...distinctPubTypes.map((p) => p.type),
      "article",
      "inproceedings",
      "book",
      "phdthesis",
      "mastersthesis",
      "techreport",
      "misc",
    ])
  ).filter(Boolean);

  // 4. Fetch distinct scholarship types from the Scholarship model and SystemOption options list
  const distinctScholarshipTypes = await prisma.scholarship.findMany({
    select: { type: true },
    distinct: ["type"],
  });
  const scholarshipSystemOptions = await prisma.systemOption.findMany({
    where: { listName: "scholarshipType" },
    select: { value: true },
  });
  const scholarshipTypes = Array.from(
    new Set([
      ...distinctScholarshipTypes.map((s) => s.type),
      ...scholarshipSystemOptions.map((o) => o.value),
    ])
  ).filter(Boolean) as string[];

  // 5. Fetch distinct thesis levels from the Thesis model and SystemOption options list
  const distinctThesisLevels = await prisma.thesis.findMany({
    select: { level: true },
    distinct: ["level"],
  });
  const thesisSystemOptions = await prisma.systemOption.findMany({
    where: { listName: "thesisLevel" },
    select: { value: true },
  });
  const thesisLevels = Array.from(
    new Set([
      ...distinctThesisLevels.map((t) => t.level),
      ...thesisSystemOptions.map((o) => o.value),
    ])
  ).filter(Boolean) as string[];

  return {
    members,
    publicationYears,
    publicationTypes,
    scholarshipTypes,
    thesisLevels,
  };
}

import { formatCitation } from "@/lib/citations";

interface PublicationFilters {
  memberIds?: string[];
  types?: string[];
  year?: string; // "all" or numeric string
  style?: string; // "apa" | "vancouver" | "harvard"
  startYear?: number;
  endYear?: number;
}

interface ProjectFilters {
  memberIds?: string[];
  startYear?: number;
  endYear?: number;
}

interface ScholarshipFilters {
  memberIds?: string[];
  types?: string[];
  startYear?: number;
  endYear?: number;
}

interface ThesisFilters {
  memberIds?: string[];
  levels?: string[];
  startYear?: number;
  endYear?: number;
}

interface SortConfig {
  field: "year" | "title";
  direction: "asc" | "desc";
}

/**
 * Queries Publications based on filters and sorting configs
 */
export async function queryPublications(filters: PublicationFilters, sort: SortConfig) {
  await ensureActiveUser();

  const { memberIds, types, year, style, startYear, endYear } = filters;
  const where: any = {};

  if (memberIds && memberIds.length > 0) {
    where.members = {
      some: {
        id: { in: memberIds },
      },
    };
  }

  if (types && types.length > 0) {
    where.type = { in: types };
  }

  if (year && year !== "all") {
    where.year = parseInt(year, 10);
  } else {
    const yearFilter: any = {};
    if (startYear) {
      yearFilter.gte = startYear;
    }
    if (endYear) {
      yearFilter.lte = endYear;
    }
    if (startYear || endYear) {
      where.year = yearFilter;
    }
  }

  // Set up orderBy
  const orderBy: any[] = [];
  if (sort.field === "year") {
    orderBy.push({ year: sort.direction });
    orderBy.push({ title: "asc" }); // secondary sort
  } else {
    orderBy.push({ title: sort.direction });
    orderBy.push({ year: "desc" }); // secondary sort
  }

  const publications = await prisma.publication.findMany({
    where,
    orderBy,
    include: {
      members: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          slug: true,
        },
      },
    },
  });

  return publications.map((pb) => {
    const citation = formatCitation(pb, style || "apa");
    return {
      id: pb.id,
      slug: pb.slug,
      type: pb.type,
      title: pb.title,
      authors: pb.authors,
      year: pb.year,
      citationHtml: citation.html,
      citationText: citation.text,
      members: pb.members,
    };
  });
}

/**
 * Helper to build start/end active year overlap query filters
 */
function buildActiveYearFilters(startYear?: number, endYear?: number) {
  const andFilters: any[] = [];

  if (startYear) {
    const startOfStartYear = new Date(`${startYear}-01-01T00:00:00.000Z`);
    andFilters.push({
      OR: [
        { endDate: null },
        { endDate: { gte: startOfStartYear } },
      ],
    });
  }

  if (endYear) {
    const endOfEndYear = new Date(`${endYear}-12-31T23:59:59.999Z`);
    andFilters.push({
      OR: [
        { startDate: null },
        { startDate: { lte: endOfEndYear } },
      ],
    });
  }

  return andFilters;
}

/**
 * Queries Projects based on filters and sorting configs
 */
export async function queryProjects(filters: ProjectFilters, sort: SortConfig) {
  await ensureActiveUser();

  const { memberIds, startYear, endYear } = filters;
  const where: any = {};

  if (memberIds && memberIds.length > 0) {
    where.members = {
      some: {
        id: { in: memberIds },
      },
    };
  }

  const andFilters = buildActiveYearFilters(startYear, endYear);
  if (andFilters.length > 0) {
    where.AND = andFilters;
  }

  // Set up orderBy
  const orderBy: any[] = [];
  if (sort.field === "year") {
    orderBy.push({ startDate: sort.direction });
    orderBy.push({ title: "asc" });
  } else {
    orderBy.push({ title: sort.direction });
    orderBy.push({ startDate: "desc" });
  }

  return await prisma.project.findMany({
    where,
    orderBy,
    include: {
      members: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          slug: true,
        },
      },
    },
  });
}

/**
 * Queries Scholarships based on filters and sorting configs
 */
export async function queryScholarships(filters: ScholarshipFilters, sort: SortConfig) {
  await ensureActiveUser();

  const { memberIds, types, startYear, endYear } = filters;
  const where: any = {};

  if (memberIds && memberIds.length > 0) {
    where.members = {
      some: {
        id: { in: memberIds },
      },
    };
  }

  if (types && types.length > 0) {
    where.type = { in: types };
  }

  const andFilters = buildActiveYearFilters(startYear, endYear);
  if (andFilters.length > 0) {
    where.AND = andFilters;
  }

  // Set up orderBy
  const orderBy: any[] = [];
  if (sort.field === "year") {
    orderBy.push({ startDate: sort.direction });
    orderBy.push({ title: "asc" });
  } else {
    orderBy.push({ title: sort.direction });
    orderBy.push({ startDate: "desc" });
  }

  return await prisma.scholarship.findMany({
    where,
    orderBy,
    include: {
      members: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          slug: true,
        },
      },
    },
  });
}

/**
 * Queries Theses based on filters and sorting configs
 */
export async function queryTheses(filters: ThesisFilters, sort: SortConfig) {
  await ensureActiveUser();

  const { memberIds, levels, startYear, endYear } = filters;
  const where: any = {};

  if (memberIds && memberIds.length > 0) {
    where.members = {
      some: {
        id: { in: memberIds },
      },
    };
  }

  if (levels && levels.length > 0) {
    where.level = { in: levels };
  }

  const andFilters = buildActiveYearFilters(startYear, endYear);
  if (andFilters.length > 0) {
    where.AND = andFilters;
  }

  // Set up orderBy
  const orderBy: any[] = [];
  if (sort.field === "year") {
    orderBy.push({ startDate: sort.direction });
    orderBy.push({ title: "asc" });
  } else {
    orderBy.push({ title: sort.direction });
    orderBy.push({ startDate: "desc" });
  }

  return await prisma.thesis.findMany({
    where,
    orderBy,
    include: {
      members: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          slug: true,
        },
      },
    },
  });
}

/**
 * Saves or updates a report configuration for the active user.
 */
export async function saveReport(data: { 
  id?: string; 
  title: string; 
  blocks: any[]; 
  ignoreDuplicateCheck?: boolean;
}) {
  const session = await auth();
  if (!session || !session.user?.id || !session.user?.active) {
    throw new Error("Unauthorized. Active session required.");
  }
  
  const { id, title, blocks, ignoreDuplicateCheck = false } = data;
  
  if (!ignoreDuplicateCheck) {
    // Check if a report with the same title already exists for this user (case-insensitive)
    const duplicate = await prisma.report.findFirst({
      where: {
        userId: session.user.id,
        title: { equals: title, mode: "insensitive" },
        ...(id ? { id: { not: id } } : {}),
      },
    });
    
    if (duplicate) {
      return {
        duplicate: true,
        existingId: duplicate.id,
        message: `A report titled "${title}" already exists.`,
      };
    }
  }
  
  if (id) {
    // Check ownership first
    const existing = await prisma.report.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new Error("Report not found.");
    }
    if (existing.userId !== session.user.id) {
      throw new Error("Unauthorized. You do not own this report.");
    }
    
    // Update
    const updated = await prisma.report.update({
      where: { id },
      data: {
        title,
        blocks: blocks as any,
      },
    });
    return { duplicate: false, report: updated };
  } else {
    // Create new
    const created = await prisma.report.create({
      data: {
        title,
        blocks: blocks as any,
        userId: session.user.id,
      },
    });
    return { duplicate: false, report: created };
  }
}

/**
 * Fetches all saved reports belonging to the authenticated user.
 */
export async function getReports() {
  const session = await auth();
  if (!session || !session.user?.id || !session.user?.active) {
    throw new Error("Unauthorized. Active session required.");
  }
  
  return await prisma.report.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      blocks: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

/**
 * Fetches a single saved report by ID, verifying ownership.
 */
export async function getReport(id: string) {
  const session = await auth();
  if (!session || !session.user?.id || !session.user?.active) {
    throw new Error("Unauthorized. Active session required.");
  }
  
  const report = await prisma.report.findUnique({
    where: { id },
  });
  
  if (!report) {
    throw new Error("Report not found.");
  }
  
  if (report.userId !== session.user.id) {
    throw new Error("Unauthorized. You do not own this report.");
  }
  
  return report;
}

/**
 * Deletes a saved report by ID, verifying ownership.
 */
export async function deleteReport(id: string) {
  const session = await auth();
  if (!session || !session.user?.id || !session.user?.active) {
    throw new Error("Unauthorized. Active session required.");
  }
  
  const existing = await prisma.report.findUnique({
    where: { id },
  });
  
  if (!existing) {
    throw new Error("Report not found.");
  }
  
  if (existing.userId !== session.user.id) {
    throw new Error("Unauthorized. You do not own this report.");
  }
  
  await prisma.report.delete({
    where: { id },
  });
  
  return { success: true };
}

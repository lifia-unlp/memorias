import { prismaReadOnly } from "@/lib/prisma-readonly";

/**
 * Predefined database query tool: Get Laboratory Statistics
 */
export async function getLabSummaryStats() {
  const [members, projects, theses, scholarships, publications] = await Promise.all([
    prismaReadOnly.member.count(),
    prismaReadOnly.project.count(),
    prismaReadOnly.thesis.count(),
    prismaReadOnly.scholarship.count(),
    prismaReadOnly.publication.count(),
  ]);

  // Retrieve top distinct tags to help the AI map taxonomy
  const distinctTags = await prismaReadOnly.member.findMany({
    select: { tags: true }
  }).then((rows) => {
    const all = rows.flatMap((r) => r.tags);
    const counts: Record<string, number> = {};
    all.forEach((t) => counts[t] = (counts[t] || 0) + 1);
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag]) => tag);
  }).catch(() => [] as string[]);

  return {
    totalMembers: members,
    totalProjects: projects,
    totalTheses: theses,
    totalScholarships: scholarships,
    totalPublications: publications,
    topTags: distinctTags,
  };
}

/**
 * Predefined database query tool: Search Laboratory Members
 */
export async function searchLabMembers(params: {
  name?: string;
  position?: string;
  tags?: string[];
}) {
  const { name, position, tags } = params;
  
  const where: any = {};
  
  if (name) {
    const terms = name.trim().split(/\s+/).filter(Boolean);
    if (terms.length > 0) {
      where.AND = terms.map((term) => ({
        OR: [
          { firstName: { contains: term, mode: "insensitive" } },
          { lastName: { contains: term, mode: "insensitive" } },
        ],
      }));
    }
  }
  
  if (position) {
    where.positionAtLab = { contains: position, mode: "insensitive" };
  }
  
  if (tags && tags.length > 0) {
    where.tags = { hasSome: tags.map(t => t.trim().toLowerCase()) };
  }

  const results = await prismaReadOnly.member.findMany({
    where,
    select: {
      firstName: true,
      lastName: true,
      slug: true,
      positionAtLab: true,
      highestDegree: true,
      institutionalEmail: true,
      tags: true,
    },
    take: 30,
  });

  return results;
}

/**
 * Predefined database query tool: Search Research Projects
 */
export async function searchLabProjects(params: {
  query?: string;
  fundingAgency?: string;
  tags?: string[];
}) {
  const { query, fundingAgency, tags } = params;

  const where: any = {};

  if (query) {
    where.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { summary: { contains: query, mode: "insensitive" } },
      { code: { contains: query, mode: "insensitive" } },
    ];
  }

  if (fundingAgency) {
    where.fundingAgency = { contains: fundingAgency, mode: "insensitive" };
  }

  if (tags && tags.length > 0) {
    where.tags = { hasSome: tags.map(t => t.trim().toLowerCase()) };
  }

  const results = await prismaReadOnly.project.findMany({
    where,
    select: {
      title: true,
      code: true,
      slug: true,
      director: true,
      coDirector: true,
      fundingAgency: true,
      tags: true,
    },
    take: 30,
  });

  return results;
}

/**
 * Predefined database query tool: Search Defended Theses
 */
export async function searchLabTheses(params: {
  student?: string;
  director?: string;
  level?: string;
  tags?: string[];
}) {
  const { student, director, level, tags } = params;

  const where: any = {};

  if (student) {
    where.student = { contains: student, mode: "insensitive" };
  }

  if (director) {
    where.OR = [
      { director: { contains: director, mode: "insensitive" } },
      { coDirector: { contains: director, mode: "insensitive" } },
    ];
  }

  if (level) {
    where.level = { equals: level };
  }

  if (tags && tags.length > 0) {
    where.tags = { hasSome: tags.map(t => t.trim().toLowerCase()) };
  }

  const results = await prismaReadOnly.thesis.findMany({
    where,
    select: {
      title: true,
      slug: true,
      student: true,
      director: true,
      level: true,
      progress: true,
      tags: true,
    },
    take: 30,
  });

  return results;
}

/**
 * Predefined database query tool: Search Academic Publications
 */
export async function searchLabPublications(params: {
  query?: string;
  author?: string;
  year?: number;
  tags?: string[];
}) {
  const { query, author, year, tags } = params;

  const where: any = {};

  if (query) {
    where.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { authors: { contains: query, mode: "insensitive" } },
    ];
  }

  if (author) {
    where.authors = { contains: author, mode: "insensitive" };
  }

  if (year) {
    where.year = { equals: Number(year) };
  }

  if (tags && tags.length > 0) {
    where.tags = { hasSome: tags.map(t => t.trim().toLowerCase()) };
  }

  const results = await prismaReadOnly.publication.findMany({
    where,
    select: {
      title: true,
      authors: true,
      year: true,
      type: true,
      slug: true,
      tags: true,
    },
    orderBy: { year: "desc" },
    take: 40,
  });

  return results;
}

/**
 * Predefined database query tool: Search Scholarships
 */
export async function searchLabScholarships(params: {
  student?: string;
  type?: string;
  tags?: string[];
}) {
  const { student, type, tags } = params;

  const where: any = {};

  if (student) {
    where.student = { contains: student, mode: "insensitive" };
  }

  if (type) {
    where.type = { contains: type, mode: "insensitive" };
  }

  if (tags && tags.length > 0) {
    where.tags = { hasSome: tags.map(t => t.trim().toLowerCase()) };
  }

  const results = await prismaReadOnly.scholarship.findMany({
    where,
    select: {
      title: true,
      slug: true,
      student: true,
      director: true,
      type: true,
      tags: true,
    },
    take: 30,
  });

  return results;
}



import { prisma } from "@/lib/prisma";

export interface SearchResultItem {
  id: string;
  type: "member" | "project" | "thesis" | "scholarship" | "publication";
  slug: string;
  updatedAt: Date;
  original: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export const buildMemberWhere = (tokens: string[]) => {
  if (tokens.length === 0) return {};
  return {
    AND: tokens.map((token) => {
      const cleanToken = token.startsWith("#") ? token.slice(1) : token;
      return {
        OR: [
          { firstName: { contains: token, mode: "insensitive" as const } },
          { lastName: { contains: token, mode: "insensitive" as const } },
          { interestsInEnglish: { contains: token, mode: "insensitive" as const } },
          { interestsInSpanish: { contains: token, mode: "insensitive" as const } },
          { tags: { has: cleanToken } },
        ],
      };
    }),
  };
};

export const buildProjectWhere = (tokens: string[]) => {
  if (tokens.length === 0) return {};
  return {
    AND: tokens.map((token) => {
      const cleanToken = token.startsWith("#") ? token.slice(1) : token;
      return {
        OR: [
          { title: { contains: token, mode: "insensitive" as const } },
          { code: { contains: token, mode: "insensitive" as const } },
          { director: { contains: token, mode: "insensitive" as const } },
          { coDirector: { contains: token, mode: "insensitive" as const } },
          { summary: { contains: token, mode: "insensitive" as const } },
          { fundingAgency: { contains: token, mode: "insensitive" as const } },
          { tags: { has: cleanToken } },
        ],
      };
    }),
  };
};

export const buildThesisWhere = (tokens: string[]) => {
  if (tokens.length === 0) return {};
  return {
    AND: tokens.map((token) => {
      const cleanToken = token.startsWith("#") ? token.slice(1) : token;
      return {
        OR: [
          { title: { contains: token, mode: "insensitive" as const } },
          { student: { contains: token, mode: "insensitive" as const } },
          { director: { contains: token, mode: "insensitive" as const } },
          { coDirector: { contains: token, mode: "insensitive" as const } },
          { summary: { contains: token, mode: "insensitive" as const } },
          { career: { contains: token, mode: "insensitive" as const } },
          { tags: { has: cleanToken } },
        ],
      };
    }),
  };
};

export const buildScholarshipWhere = (tokens: string[]) => {
  if (tokens.length === 0) return {};
  return {
    AND: tokens.map((token) => {
      const cleanToken = token.startsWith("#") ? token.slice(1) : token;
      return {
        OR: [
          { title: { contains: token, mode: "insensitive" as const } },
          { student: { contains: token, mode: "insensitive" as const } },
          { director: { contains: token, mode: "insensitive" as const } },
          { coDirector: { contains: token, mode: "insensitive" as const } },
          { summary: { contains: token, mode: "insensitive" as const } },
          { type: { contains: token, mode: "insensitive" as const } },
          { tags: { has: cleanToken } },
        ],
      };
    }),
  };
};

export const buildPublicationWhere = (tokens: string[]) => {
  if (tokens.length === 0) return {};
  return {
    AND: tokens.map((token) => {
      const cleanToken = token.startsWith("#") ? token.slice(1) : token;
      return {
        OR: [
          { title: { contains: token, mode: "insensitive" as const } },
          { authors: { contains: token, mode: "insensitive" as const } },
          { tags: { has: cleanToken } },
        ],
      };
    }),
  };
};

export const searchService = {
  search: async (q: string, typeFilter: string = "all", page: number = 1, limit: number = 10) => {
    const trimmed = q.trim();
    const tokens = trimmed ? trimmed.split(/\s+/).filter(Boolean) : [];

    const memberWhere = buildMemberWhere(tokens);
    const projectWhere = buildProjectWhere(tokens);
    const thesisWhere = buildThesisWhere(tokens);
    const scholarshipWhere = buildScholarshipWhere(tokens);
    const publicationWhere = buildPublicationWhere(tokens);

    // Fetch counts in parallel
    const [memberCount, projectCount, thesisCount, scholarshipCount, publicationCount] = await Promise.all([
      prisma.member.count({ where: memberWhere }),
      prisma.project.count({ where: projectWhere }),
      prisma.thesis.count({ where: thesisWhere }),
      prisma.scholarship.count({ where: scholarshipWhere }),
      prisma.publication.count({ where: publicationWhere }),
    ]);

    const counts = {
      all: memberCount + projectCount + thesisCount + scholarshipCount + publicationCount,
      member: memberCount,
      project: projectCount,
      thesis: thesisCount,
      scholarship: scholarshipCount,
      publication: publicationCount,
    };

    let paginatedResults: SearchResultItem[] = [];
    let totalCount = 0;

    if (typeFilter === "member") {
      totalCount = memberCount;
      const records = await prisma.member.findMany({
        where: memberWhere,
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      });
      paginatedResults = records.map((r) => ({
        id: r.id,
        type: "member",
        slug: r.slug,
        updatedAt: r.updatedAt,
        original: r,
      }));
    } else if (typeFilter === "project") {
      totalCount = projectCount;
      const records = await prisma.project.findMany({
        where: projectWhere,
        include: {
          members: {
            select: {
              firstName: true,
              lastName: true,
              slug: true,
            },
          },
        },
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      });
      paginatedResults = records.map((r) => ({
        id: r.id,
        type: "project",
        slug: r.slug,
        updatedAt: r.updatedAt,
        original: r,
      }));
    } else if (typeFilter === "thesis") {
      totalCount = thesisCount;
      const records = await prisma.thesis.findMany({
        where: thesisWhere,
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      });
      paginatedResults = records.map((r) => ({
        id: r.id,
        type: "thesis",
        slug: r.slug,
        updatedAt: r.updatedAt,
        original: r,
      }));
    } else if (typeFilter === "scholarship") {
      totalCount = scholarshipCount;
      const records = await prisma.scholarship.findMany({
        where: scholarshipWhere,
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      });
      paginatedResults = records.map((r) => ({
        id: r.id,
        type: "scholarship",
        slug: r.slug,
        updatedAt: r.updatedAt,
        original: r,
      }));
    } else if (typeFilter === "publication") {
      totalCount = publicationCount;
      const records = await prisma.publication.findMany({
        where: publicationWhere,
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      });
      paginatedResults = records.map((r) => ({
        id: r.id,
        type: "publication",
        slug: r.slug,
        updatedAt: r.updatedAt,
        original: r,
      }));
    } else {
      // "all" tab
      totalCount = counts.all;
      const maxFetch = page * limit;

      const [fetchedMembers, fetchedProjects, fetchedTheses, fetchedScholarships, fetchedPublications] = await Promise.all([
        prisma.member.findMany({
          where: memberWhere,
          orderBy: { updatedAt: "desc" },
          take: maxFetch,
        }),
        prisma.project.findMany({
          where: projectWhere,
          include: {
            members: {
              select: {
                firstName: true,
                lastName: true,
                slug: true,
              },
            },
          },
          orderBy: { updatedAt: "desc" },
          take: maxFetch,
        }),
        prisma.thesis.findMany({
          where: thesisWhere,
          orderBy: { updatedAt: "desc" },
          take: maxFetch,
        }),
        prisma.scholarship.findMany({
          where: scholarshipWhere,
          orderBy: { updatedAt: "desc" },
          take: maxFetch,
        }),
        prisma.publication.findMany({
          where: publicationWhere,
          orderBy: { updatedAt: "desc" },
          take: maxFetch,
        }),
      ]);

      const allMapped: SearchResultItem[] = [
        ...fetchedMembers.map((r) => ({ id: r.id, type: "member" as const, slug: r.slug, updatedAt: r.updatedAt, original: r })),
        ...fetchedProjects.map((r) => ({ id: r.id, type: "project" as const, slug: r.slug, updatedAt: r.updatedAt, original: r })),
        ...fetchedTheses.map((r) => ({ id: r.id, type: "thesis" as const, slug: r.slug, updatedAt: r.updatedAt, original: r })),
        ...fetchedScholarships.map((r) => ({ id: r.id, type: "scholarship" as const, slug: r.slug, updatedAt: r.updatedAt, original: r })),
        ...fetchedPublications.map((r) => ({ id: r.id, type: "publication" as const, slug: r.slug, updatedAt: r.updatedAt, original: r })),
      ];

      allMapped.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      paginatedResults = allMapped.slice((page - 1) * limit, page * limit);
    }

    const totalPages = Math.ceil(totalCount / limit);

    return {
      counts,
      paginatedResults,
      totalCount,
      totalPages,
    };
  },
};

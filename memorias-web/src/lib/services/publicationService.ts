import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugs";
import { sanitizeTag } from "@/lib/tags-sanitize";

export interface CreatePublicationInput {
  title: string;
  authors: string;
  year: number;
  type: string;
  ranking?: string;
  selfArchivingUrl?: string;
  doi?: string;
  abstract?: string;
  tags?: string[];
  members?: string[];
  projects?: string[];
  theses?: string[];
  citationKey?: string;
  customEntryTags?: Record<string, string>;
  featured?: boolean;
}

export const publicationService = {
  create: async (data: CreatePublicationInput, ignoreDuplicateCheck = false) => {
    const title = data.title.trim();
    const authors = data.authors.trim();
    const year = Number(data.year);
    const type = data.type.trim();

    if (!title || !authors || !year || !type) {
      throw new Error("Title, Authors, Year, and Type are mandatory fields");
    }

    if (!ignoreDuplicateCheck) {
      const duplicate = await prisma.publication.findFirst({
        where: {
          title: { equals: title, mode: "insensitive" },
        },
      });
      if (duplicate) {
        throw new Error("DUPLICATE_TITLE");
      }
    }

    // Construct unique slug
    const baseSlug = slugify(data.citationKey || title);
    let slug = baseSlug;
    let counter = 1;
    while (true) {
      const existing = await prisma.publication.findUnique({
        where: { slug },
      });
      if (!existing) break;
      slug = `${baseSlug}-${counter++}`;
    }

    // Build BibTeX JSON object
    const citationKey = data.citationKey?.trim() || slug;
    const entryTags: Record<string, string> = {
      ...(data.customEntryTags || {}),
      title,
      author: authors,
      year: String(year),
    };
    if (data.ranking) entryTags.ranking = data.ranking;
    if (data.selfArchivingUrl) entryTags.url = data.selfArchivingUrl;
    if (data.doi) entryTags.doi = data.doi.trim();
    if (data.abstract) entryTags.abstract = data.abstract.trim();

    const bibtexData = {
      citationKey,
      entryType: type,
      entryTags,
    };

    return prisma.publication.create({
      data: {
        slug,
        title,
        authors,
        year,
        type,
        ranking: data.ranking?.trim() || null,
        selfArchivingUrl: data.selfArchivingUrl?.trim() || null,
        bibtexData: bibtexData as any,
        featured: data.featured || false,
        tags: data.tags ? data.tags.map(sanitizeTag).filter(Boolean) : [],
        members: data.members ? { connect: data.members.map((id) => ({ id })) } : undefined,
        projects: data.projects ? { connect: data.projects.map((id) => ({ id })) } : undefined,
        theses: data.theses ? { connect: data.theses.map((id) => ({ id })) } : undefined,
      },
    });
  },

  update: async (slug: string, data: Partial<CreatePublicationInput>, ignoreDuplicateCheck = false) => {
    const title = data.title?.trim();
    const authors = data.authors?.trim();
    const year = data.year ? Number(data.year) : undefined;
    const type = data.type?.trim();

    if (title === "" || authors === "" || year === 0 || type === "") {
      throw new Error("Title, Authors, Year, and Type cannot be empty");
    }

    if (title && !ignoreDuplicateCheck) {
      const duplicate = await prisma.publication.findFirst({
        where: {
          title: { equals: title, mode: "insensitive" },
          slug: { not: slug },
        },
      });
      if (duplicate) {
        throw new Error("DUPLICATE_TITLE");
      }
    }

    const existingPub = await prisma.publication.findUnique({
      where: { slug },
    });

    if (!existingPub) {
      throw new Error("Publication not found");
    }

    const citationKey = data.citationKey?.trim() || slug;
    const entryTags: Record<string, string> = {
      ...(data.customEntryTags || {}),
      title: title || existingPub.title,
      author: authors || existingPub.authors,
      year: year ? String(year) : String(existingPub.year),
    };
    if (data.ranking) entryTags.ranking = data.ranking;
    if (data.selfArchivingUrl) entryTags.url = data.selfArchivingUrl;
    if (data.doi) entryTags.doi = data.doi.trim();
    if (data.abstract) entryTags.abstract = data.abstract.trim();

    const bibtexData = {
      citationKey,
      entryType: type || existingPub.type,
      entryTags,
    };

    return prisma.publication.update({
      where: { slug },
      data: {
        title,
        authors,
        year,
        type,
        ranking: data.ranking?.trim() || null,
        selfArchivingUrl: data.selfArchivingUrl?.trim() || null,
        tags: data.tags ? data.tags.map(sanitizeTag).filter(Boolean) : [],
        bibtexData: bibtexData as any,
        featured: data.featured || false,
        members: {
          set: data.members ? data.members.map((id) => ({ id })) : [],
        },
        projects: {
          set: data.projects ? data.projects.map((id) => ({ id })) : [],
        },
        theses: {
          set: data.theses ? data.theses.map((id) => ({ id })) : [],
        },
      },
    });
  },

  delete: async (id: string) => {
    return prisma.publication.delete({
      where: { id },
    });
  },

  getAllPublications: async (where?: any) => {
    return prisma.publication.findMany({
      where,
      orderBy: { year: "desc" },
    });
  },

  getDistinctYears: async (): Promise<number[]> => {
    const distinctYears = await prisma.publication.findMany({
      select: { year: true },
      distinct: ["year"],
      orderBy: { year: "desc" },
    });
    return distinctYears.map((d) => d.year);
  },

  getBySlug: async (slug: string) => {
    return prisma.publication.findUnique({
      where: { slug },
      include: {
        members: { select: { id: true } },
        projects: { select: { id: true } },
        theses: { select: { id: true } },
      },
    });
  },

  getPublicationDetail: async (slug: string) => {
    return prisma.publication.findUnique({
      where: { slug },
      include: {
        members: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            slug: true,
            positionAtLab: true,
            avatarUrl: true,
          },
        },
        projects: {
          select: {
            id: true,
            title: true,
            slug: true,
            code: true,
            fundingAgency: true,
            startDate: true,
            endDate: true,
          },
        },
        theses: {
          select: {
            id: true,
            title: true,
            slug: true,
            student: true,
            level: true,
            progress: true,
          },
        },
      },
    });
  },

  getFormSelectionList: async () => {
    return prisma.publication.findMany({
      orderBy: { year: "desc" },
    });
  },

  getFeatured: async () => {
    return prisma.publication.findMany({
      where: { featured: true },
      orderBy: { updatedAt: "desc" },
    });
  },
};

import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugs";
import { sanitizeTag } from "@/lib/tags-sanitize";

export interface CreateThesisInput {
  title: string;
  slug?: string;
  career?: string | null;
  level?: string | null;
  student?: string | null;
  director?: string | null;
  coDirector?: string | null;
  otherAdvisors?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  summary?: string | null;
  reportUrl?: string | null;
  progress?: number | null;
  keywords?: string | null;
  website?: string | null;
  featured?: boolean;
  tags?: string[];
  members?: string[];
  projects?: string[];
  publications?: string[];
  scholarships?: string[];
}

export const thesisService = {
  create: async (data: CreateThesisInput, ignoreDuplicateCheck = false) => {
    if (!data.title) {
      throw new Error("Thesis Title is required.");
    }

    if (!ignoreDuplicateCheck) {
      const duplicate = await prisma.thesis.findFirst({
        where: {
          title: { equals: data.title, mode: "insensitive" },
        },
      });
      if (duplicate) {
        throw new Error("DUPLICATE_TITLE");
      }
    }

    let slug = data.slug || slugify(data.title);

    // Ensure unique slug
    const existing = await prisma.thesis.findUnique({ where: { slug } });
    if (existing) {
      throw new Error(`The slug '${slug}' is already taken. Please customize it.`);
    }

    const { members, projects, publications, scholarships, ...rest } = data;

    return prisma.thesis.create({
      data: {
        ...rest,
        slug,
        members: members ? { connect: members.map((id) => ({ id })) } : undefined,
        projects: projects ? { connect: projects.map((id) => ({ id })) } : undefined,
        publications: publications ? { connect: publications.map((id) => ({ id })) } : undefined,
        scholarships: scholarships ? { connect: scholarships.map((id) => ({ id })) } : undefined,
      },
    });
  },

  update: async (id: string, data: Partial<CreateThesisInput>, ignoreDuplicateCheck = false) => {
    if (data.title === "") {
      throw new Error("Thesis Title is required.");
    }

    if (data.title && !ignoreDuplicateCheck) {
      const duplicate = await prisma.thesis.findFirst({
        where: {
          title: { equals: data.title, mode: "insensitive" },
          id: { not: id },
        },
      });
      if (duplicate) {
        throw new Error("DUPLICATE_TITLE");
      }
    }

    if (data.slug) {
      const existing = await prisma.thesis.findUnique({ where: { slug: data.slug } });
      if (existing && existing.id !== id) {
        throw new Error(`The slug '${data.slug}' is already taken by another thesis.`);
      }
    }

    const { members, projects, publications, scholarships, ...rest } = data;

    return prisma.thesis.update({
      where: { id },
      data: {
        ...rest,
        members: members ? { set: members.map((mid) => ({ id: mid })) } : undefined,
        projects: projects ? { set: projects.map((pid) => ({ id: pid })) } : undefined,
        publications: publications ? { set: publications.map((pid) => ({ id: pid })) } : undefined,
        scholarships: scholarships ? { set: scholarships.map((sid) => ({ id: sid })) } : undefined,
      },
    });
  },
  delete: async (id: string) => {
    return prisma.thesis.delete({
      where: { id },
    });
  },

  getAllTheses: async (where?: any) => {
    return prisma.thesis.findMany({
      where,
      include: {
        members: {
          select: {
            firstName: true,
            lastName: true,
            slug: true,
          },
        },
      },
      orderBy: { endDate: "desc" },
    });
  },

  getBySlug: async (slug: string) => {
    return prisma.thesis.findUnique({
      where: { slug },
      include: {
        members: { select: { id: true } },
        projects: { select: { id: true } },
        publications: { select: { id: true } },
        scholarships: { select: { id: true } },
      },
    });
  },

  getThesisDetail: async (slug: string) => {
    return prisma.thesis.findUnique({
      where: { slug },
      include: {
        members: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            slug: true,
            avatarUrl: true,
            positionAtLab: true,
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
        scholarships: {
          select: {
            id: true,
            title: true,
            slug: true,
            student: true,
            type: true,
          },
        },
        publications: {
          orderBy: { year: "desc" },
        },
      },
    });
  },

  getFormSelectionList: async () => {
    return prisma.thesis.findMany({
      orderBy: { endDate: "desc" },
    });
  },

  getFeatured: async () => {
    return prisma.thesis.findMany({
      where: { featured: true },
      orderBy: { updatedAt: "desc" },
    });
  },
};

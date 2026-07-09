import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugs";
import { sanitizeTag } from "@/lib/tags-sanitize";

export interface CreateScholarshipInput {
  title: string;
  slug?: string;
  type?: string | null;
  student?: string | null;
  director?: string | null;
  coDirector?: string | null;
  fundingAgency?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  summary?: string | null;
  tags?: string[];
  members?: string[];
  projects?: string[];
  theses?: string[];
}

export const scholarshipService = {
  create: async (data: CreateScholarshipInput, ignoreDuplicateCheck = false) => {
    if (!data.title) {
      throw new Error("Scholarship Title is required.");
    }

    if (!ignoreDuplicateCheck) {
      const duplicate = await prisma.scholarship.findFirst({
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
    const existing = await prisma.scholarship.findUnique({ where: { slug } });
    if (existing) {
      throw new Error(`The slug '${slug}' is already taken. Please customize it.`);
    }

    const { members, projects, theses, ...rest } = data;

    return prisma.scholarship.create({
      data: {
        ...rest,
        slug,
        members: members ? { connect: members.map((id) => ({ id })) } : undefined,
        projects: projects ? { connect: projects.map((id) => ({ id })) } : undefined,
        theses: theses ? { connect: theses.map((id) => ({ id })) } : undefined,
      },
    });
  },

  update: async (id: string, data: Partial<CreateScholarshipInput>, ignoreDuplicateCheck = false) => {
    if (data.title === "") {
      throw new Error("Scholarship Title is required.");
    }

    if (data.title && !ignoreDuplicateCheck) {
      const duplicate = await prisma.scholarship.findFirst({
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
      const existing = await prisma.scholarship.findUnique({ where: { slug: data.slug } });
      if (existing && existing.id !== id) {
        throw new Error(`The slug '${data.slug}' is already taken by another scholarship.`);
      }
    }

    const { members, projects, theses, ...rest } = data;

    return prisma.scholarship.update({
      where: { id },
      data: {
        ...rest,
        members: members ? { set: members.map((mid) => ({ id: mid })) } : undefined,
        projects: projects ? { set: projects.map((pid) => ({ id: pid })) } : undefined,
        theses: theses ? { set: theses.map((tid) => ({ id: tid })) } : undefined,
      },
    });
  },

  delete: async (id: string) => {
    return prisma.scholarship.delete({
      where: { id },
    });
  },

  getAllScholarships: async (where?: any) => {
    return prisma.scholarship.findMany({
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
    return prisma.scholarship.findUnique({
      where: { slug },
      include: {
        members: { select: { id: true } },
        projects: { select: { id: true } },
        theses: { select: { id: true } },
      },
    });
  },

  getScholarshipDetail: async (slug: string) => {
    return prisma.scholarship.findUnique({
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
    return prisma.scholarship.findMany({
      orderBy: { endDate: "desc" },
    });
  },
};

import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugs";

export interface CreateProjectInput {
  title: string;
  slug?: string;
  code?: string | null;
  startDate: Date;
  endDate: Date;
  director?: string | null;
  coDirector?: string | null;
  responsibleGroup?: string | null;
  fundingAgency?: string | null;
  amount?: string | null;
  summary?: string | null;
  website?: string | null;
  featured?: boolean;
  tags?: string[];
  members?: string[]; // IDs
}

export const projectService = {
  create: async (data: CreateProjectInput, ignoreDuplicateCheck = false) => {
    if (!data.title) {
      throw new Error("Project Title is required.");
    }

    if (!ignoreDuplicateCheck) {
      const duplicate = await prisma.project.findFirst({
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
    const existing = await prisma.project.findUnique({ where: { slug } });
    if (existing) {
      throw new Error(`The slug '${slug}' is already taken. Please customize it.`);
    }

    const { members, ...rest } = data;

    return prisma.project.create({
      data: {
        ...rest,
        slug,
        members: members ? {
          connect: members.map((id) => ({ id })),
        } : undefined,
      },
    });
  },

  update: async (id: string, data: Partial<CreateProjectInput>, ignoreDuplicateCheck = false) => {
    if (data.title === "") {
      throw new Error("Project Title is required.");
    }

    if (data.title && !ignoreDuplicateCheck) {
      const duplicate = await prisma.project.findFirst({
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
      const existing = await prisma.project.findUnique({ where: { slug: data.slug } });
      if (existing && existing.id !== id) {
        throw new Error(`The slug '${data.slug}' is already taken by another project.`);
      }
    }

    const { members, ...rest } = data;

    return prisma.project.update({
      where: { id },
      data: {
        ...rest,
        members: members ? {
          set: members.map((mid) => ({ id: mid })),
        } : undefined,
      },
    });
  },

  checkReferentialBlock: async (id: string) => {
    const theses = await prisma.thesis.findMany({
      where: { projects: { some: { id } } },
      select: { title: true, slug: true },
    });

    const scholarships = await prisma.scholarship.findMany({
      where: { projects: { some: { id } } },
      select: { title: true, slug: true },
    });

    const publications = await prisma.publication.findMany({
      where: { projects: { some: { id } } },
      select: { title: true, slug: true },
    });

    if (theses.length > 0 || scholarships.length > 0 || publications.length > 0) {
      return {
        isBlocked: true,
        references: { theses, scholarships, publications },
      };
    }

    return { isBlocked: false };
  },

  delete: async (id: string) => {
    const blockCheck = await projectService.checkReferentialBlock(id);
    if (blockCheck.isBlocked) {
      throw new Error("REFERENTIAL_BLOCK");
    }

    return prisma.project.delete({
      where: { id },
      select: { id: true, title: true, slug: true },
    });
  },

  getAllProjects: async () => {
    return prisma.project.findMany({
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
    return prisma.project.findUnique({
      where: { slug },
      include: {
        members: { select: { id: true } },
      },
    });
  },

  getProjectDetail: async (slug: string) => {
    return prisma.project.findUnique({
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
    return prisma.project.findMany({
      orderBy: { endDate: "desc" },
    });
  },

  getFeatured: async () => {
    return prisma.project.findMany({
      where: { featured: true },
      orderBy: { updatedAt: "desc" },
    });
  },
};

import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugs";

export interface CreateMemberInput {
  firstName: string;
  lastName: string;
  slug?: string;
  startDate?: Date | null;
  endDate?: Date | null;
  highestDegree?: string | null;
  coursesAtUNLP?: string | null;
  positionAtLab?: string | null;
  positionAtUnlp?: string | null;
  category?: string | null;
  sicadiCategory?: string | null;
  positionAtCIC?: string | null;
  positionAtCONICET?: string | null;
  personalEmail?: string | null;
  institutionalEmail?: string | null;
  phone?: string | null;
  webPage?: string | null;
  orcid?: string | null;
  dblpProfile?: string | null;
  googleResearchProfile?: string | null;
  researchGateProfile?: string | null;
  shortCvInSpanish?: string | null;
  shortCvInEnglish?: string | null;
  interestsInEnglish?: string | null;
  interestsInSpanish?: string | null;
  affiliations?: string | null;
  notes?: string | null;
  avatarUrl?: string | null;
  tags?: string[];
}

export const memberService = {
  create: async (data: CreateMemberInput) => {
    if (!data.firstName || !data.lastName) {
      throw new Error("First Name and Last Name are required.");
    }

    let slug = data.slug || slugify(`${data.firstName}-${data.lastName}`);

    // Ensure unique slug
    const existing = await prisma.member.findUnique({ where: { slug } });
    if (existing) {
      throw new Error(`The slug '${slug}' is already taken. Please customize it.`);
    }

    return prisma.member.create({
      data: {
        ...data,
        slug,
      },
    });
  },

  update: async (id: string, data: Partial<CreateMemberInput>) => {
    if (data.firstName === "" || data.lastName === "") {
      throw new Error("First Name and Last Name cannot be empty.");
    }

    if (data.slug) {
      const existing = await prisma.member.findUnique({ where: { slug: data.slug } });
      if (existing && existing.id !== id) {
        throw new Error(`The slug '${data.slug}' is already taken by another member.`);
      }
    }

    return prisma.member.update({
      where: { id },
      data,
    });
  },

  checkReferentialBlock: async (id: string) => {
    const projects = await prisma.project.findMany({
      where: { members: { some: { id } } },
      select: { title: true, slug: true },
    });

    const theses = await prisma.thesis.findMany({
      where: { members: { some: { id } } },
      select: { title: true, slug: true },
    });

    const scholarships = await prisma.scholarship.findMany({
      where: { members: { some: { id } } },
      select: { title: true, slug: true },
    });

    const publications = await prisma.publication.findMany({
      where: { members: { some: { id } } },
      select: { title: true, slug: true },
    });

    if (
      projects.length > 0 ||
      theses.length > 0 ||
      scholarships.length > 0 ||
      publications.length > 0
    ) {
      return {
        isBlocked: true,
        references: { projects, theses, scholarships, publications },
      };
    }

    return { isBlocked: false };
  },

  delete: async (id: string) => {
    const blockCheck = await memberService.checkReferentialBlock(id);
    if (blockCheck.isBlocked) {
      throw new Error("REFERENTIAL_BLOCK");
    }

    return prisma.member.delete({
      where: { id },
      select: { id: true, firstName: true, lastName: true, slug: true },
    });
  },

  getBySlug: async (slug: string) => {
    return prisma.member.findUnique({ where: { slug } });
  },

  getAllPositions: async (): Promise<string[]> => {
    const distinctPositions = await prisma.member.findMany({
      select: { positionAtLab: true },
      distinct: ["positionAtLab"],
    });
    return distinctPositions.map((p) => p.positionAtLab).filter(Boolean) as string[];
  },

  getAllMembers: async () => {
    return prisma.member.findMany({
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    });
  },

  getMemberDetail: async (slug: string) => {
    const member = await prisma.member.findUnique({ where: { slug } });
    if (!member) return null;

    const [projects, theses, scholarships, publications] = await Promise.all([
      prisma.project.findMany({
        where: {
          OR: [
            { director: member.id },
            { coDirector: member.id },
            { members: { some: { id: member.id } } },
          ],
        },
        orderBy: { startDate: "desc" },
      }),
      prisma.thesis.findMany({
        where: {
          OR: [
            { student: member.id },
            { director: member.id },
            { coDirector: member.id },
            { members: { some: { id: member.id } } },
          ],
        },
        orderBy: { startDate: "desc" },
      }),
      prisma.scholarship.findMany({
        where: {
          OR: [
            { student: member.id },
            { director: member.id },
            { coDirector: member.id },
            { members: { some: { id: member.id } } },
          ],
        },
        orderBy: { startDate: "desc" },
      }),
      prisma.publication.findMany({
        where: { members: { some: { id: member.id } } },
        orderBy: { year: "desc" },
      }),
    ]);

    return { member, projects, theses, scholarships, publications };
  },

  getFormSelectionList: async () => {
    return prisma.member.findMany({
      orderBy: { lastName: "asc" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        positionAtLab: true,
        endDate: true,
      },
    });
  },
};

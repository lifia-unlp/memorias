import { prisma } from "@/lib/prisma";

export const systemOptionsService = {
  getOptions: async (listName: string) => {
    return prisma.systemOption.findMany({
      where: { listName },
      orderBy: { value: "asc" },
    });
  },

  getAllOptions: async () => {
    return prisma.systemOption.findMany({
      orderBy: { value: "asc" },
    });
  },

  createOption: async (listName: string, value: string) => {
    return prisma.systemOption.create({
      data: { listName, value },
    });
  },

  checkOptionUsage: async (listName: string, value: string) => {
    switch (listName) {
      case "positionAtLab":
        return prisma.member.count({ where: { positionAtLab: value } });
      case "positionAtUnlp":
        return prisma.member.count({ where: { positionAtUnlp: value } });
      case "positionAtCIC":
        return prisma.member.count({ where: { positionAtCIC: value } });
      case "positionAtCONICET":
        return prisma.member.count({ where: { positionAtCONICET: value } });
      case "thesisLevel":
        return prisma.thesis.count({ where: { level: value } });
      case "scholarshipType":
        return prisma.scholarship.count({ where: { type: value } });
      default:
        throw new Error("Invalid list name");
    }
  },

  deleteOptionSafe: async (id: string, replacementValue?: string | null) => {
    const option = await prisma.systemOption.findUnique({
      where: { id },
    });

    if (!option) {
      throw new Error("System option not found");
    }

    const { listName, value } = option;

    await prisma.$transaction(async (tx) => {
      switch (listName) {
        case "positionAtLab":
          await tx.member.updateMany({
            where: { positionAtLab: value },
            data: { positionAtLab: replacementValue || null },
          });
          break;
        case "positionAtUnlp":
          await tx.member.updateMany({
            where: { positionAtUnlp: value },
            data: { positionAtUnlp: replacementValue || null },
          });
          break;
        case "positionAtCIC":
          await tx.member.updateMany({
            where: { positionAtCIC: value },
            data: { positionAtCIC: replacementValue || null },
          });
          break;
        case "positionAtCONICET":
          await tx.member.updateMany({
            where: { positionAtCONICET: value },
            data: { positionAtCONICET: replacementValue || null },
          });
          break;
        case "thesisLevel":
          await tx.thesis.updateMany({
            where: { level: value },
            data: { level: replacementValue || null },
          });
          break;
        case "scholarshipType":
          await tx.scholarship.updateMany({
            where: { type: value },
            data: { type: replacementValue || null },
          });
          break;
        default:
          throw new Error("Invalid list name in transaction");
      }

      await tx.systemOption.delete({
        where: { id },
      });
    });
  },
};

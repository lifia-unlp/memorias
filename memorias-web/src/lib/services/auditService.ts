import { prisma } from "@/lib/prisma";

export const auditService = {
  getLogs: async (params: { where?: any; skip: number; take: number }) => {
    return prisma.auditLog.findMany({
      where: params.where,
      orderBy: { createdAt: "desc" },
      skip: params.skip,
      take: params.take,
    });
  },

  getLogsCount: async (where?: any) => {
    return prisma.auditLog.count({
      where,
    });
  },

  getGlobalMetrics: async () => {
    const [totalLogs, createsCount, updatesCount, deletesCount] = await Promise.all([
      prisma.auditLog.count(),
      prisma.auditLog.count({ where: { action: "CREATE" } }),
      prisma.auditLog.count({ where: { action: "UPDATE" } }),
      prisma.auditLog.count({ where: { action: "DELETE" } }),
    ]);
    return {
      totalLogs,
      createsCount,
      updatesCount,
      deletesCount,
    };
  },
};

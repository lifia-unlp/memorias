import { prisma } from "@/lib/prisma";

export const auditService = {
  getLogs: async (params: { where?: any; skip: number; take: number }) => {
    const logs = await prisma.auditLog.findMany({
      where: params.where,
      orderBy: { createdAt: "desc" },
      skip: params.skip,
      take: params.take,
    });

    const userIds = Array.from(new Set(logs.map((l) => l.userId).filter(Boolean))) as string[];
    const users = userIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, name: true, email: true },
        })
      : [];

    const userMap = new Map(users.map((u) => [u.id, u]));

    return logs.map((log) => {
      const user = log.userId ? userMap.get(log.userId) : null;
      return {
        ...log,
        userName: user?.name || null,
      };
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

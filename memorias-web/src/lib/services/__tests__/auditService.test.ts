import { describe, it, expect, vi, beforeEach } from "vitest";
import { auditService } from "../auditService";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    auditLog: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));

describe("auditService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getLogs", () => {
    it("fetches audit logs with options using findMany", async () => {
      vi.mocked(prisma.auditLog.findMany).mockResolvedValue([{ id: "l1", action: "CREATE" }] as any);
      const res = await auditService.getLogs({ where: { action: "CREATE" }, skip: 0, take: 10 });
      expect(res).toEqual([{ id: "l1", action: "CREATE" }]);
      expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
        where: { action: "CREATE" },
        orderBy: { createdAt: "desc" },
        skip: 0,
        take: 10,
      });
    });
  });

  describe("getLogsCount", () => {
    it("fetches audit log count using count", async () => {
      vi.mocked(prisma.auditLog.count).mockResolvedValue(5);
      const res = await auditService.getLogsCount({ action: "UPDATE" });
      expect(res).toBe(5);
      expect(prisma.auditLog.count).toHaveBeenCalledWith({ where: { action: "UPDATE" } });
    });
  });

  describe("getGlobalMetrics", () => {
    it("fetches global audit metrics count", async () => {
      vi.mocked(prisma.auditLog.count)
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(4)  // create
        .mockResolvedValueOnce(3)  // update
        .mockResolvedValueOnce(2); // delete

      const res = await auditService.getGlobalMetrics();
      expect(res).toEqual({
        totalLogs: 10,
        createsCount: 4,
        updatesCount: 3,
        deletesCount: 2,
      });
    });
  });
});

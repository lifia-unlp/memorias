import { describe, it, expect, vi, beforeEach } from "vitest";
import { systemOptionsService } from "../systemOptionsService";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    systemOption: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    member: { count: vi.fn(), updateMany: vi.fn() },
    thesis: { count: vi.fn(), updateMany: vi.fn() },
    scholarship: { count: vi.fn(), updateMany: vi.fn() },
    $transaction: vi.fn((fn) => {
      if (typeof fn === "function") {
        return fn(prisma);
      }
      return Promise.all(fn);
    }),
  },
}));

describe("systemOptionsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getOptions", () => {
    it("fetches options by listName", async () => {
      vi.mocked(prisma.systemOption.findMany).mockResolvedValue([{ id: "1", value: "A" }] as any);
      const res = await systemOptionsService.getOptions("positionAtLab");
      expect(res).toEqual([{ id: "1", value: "A" }]);
      expect(prisma.systemOption.findMany).toHaveBeenCalledWith({
        where: { listName: "positionAtLab" },
        orderBy: { value: "asc" },
      });
    });
  });

  describe("createOption", () => {
    it("creates list option", async () => {
      vi.mocked(prisma.systemOption.create).mockResolvedValue({ id: "o1" } as any);
      const res = await systemOptionsService.createOption("thesisLevel", "PhD");
      expect(res).toEqual({ id: "o1" });
      expect(prisma.systemOption.create).toHaveBeenCalledWith({
        data: { listName: "thesisLevel", value: "PhD" },
      });
    });
  });

  describe("checkOptionUsage", () => {
    it("counts position usages on Member model", async () => {
      vi.mocked(prisma.member.count).mockResolvedValue(3);
      const res = await systemOptionsService.checkOptionUsage("positionAtLab", "Student");
      expect(res).toBe(3);
      expect(prisma.member.count).toHaveBeenCalledWith({ where: { positionAtLab: "Student" } });
    });
  });

  describe("deleteOptionSafe", () => {
    it("performs safe updates and deletes option in a transaction", async () => {
      vi.mocked(prisma.systemOption.findUnique).mockResolvedValue({
        id: "o1",
        listName: "thesisLevel",
        value: "PhD",
      } as any);

      await systemOptionsService.deleteOptionSafe("o1", "Doctorate");
      expect(prisma.thesis.updateMany).toHaveBeenCalledWith({
        where: { level: "PhD" },
        data: { level: "Doctorate" },
      });
      expect(prisma.systemOption.delete).toHaveBeenCalledWith({ where: { id: "o1" } });
    });
  });
});

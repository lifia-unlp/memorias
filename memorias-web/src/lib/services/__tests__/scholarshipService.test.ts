import { describe, it, expect, vi, beforeEach } from "vitest";
import { scholarshipService } from "../scholarshipService";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    scholarship: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe("scholarshipService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("throws error if duplicate title is found and bypass check is inactive", async () => {
      vi.mocked(prisma.scholarship.findFirst).mockResolvedValue({ id: "1", title: "Scholarship A" } as any);
      await expect(
        scholarshipService.create({ title: "Scholarship A" })
      ).rejects.toThrow("DUPLICATE_TITLE");
    });

    it("creates scholarship successfully bypassing duplicate check", async () => {
      vi.mocked(prisma.scholarship.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.scholarship.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.scholarship.create).mockResolvedValue({ id: "2", title: "Scholarship B" } as any);

      const res = await scholarshipService.create({ title: "Scholarship B" });
      expect(res.title).toBe("Scholarship B");
      expect(prisma.scholarship.create).toHaveBeenCalled();
    });
  });
});

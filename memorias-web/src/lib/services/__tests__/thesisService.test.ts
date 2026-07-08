import { describe, it, expect, vi, beforeEach } from "vitest";
import { thesisService } from "../thesisService";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    thesis: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe("thesisService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("throws error if duplicate title is found and bypass check is inactive", async () => {
      vi.mocked(prisma.thesis.findFirst).mockResolvedValue({ id: "1", title: "Thesis A" } as any);
      await expect(
        thesisService.create({ title: "Thesis A" })
      ).rejects.toThrow("DUPLICATE_TITLE");
    });

    it("creates thesis successfully bypassing duplicate check", async () => {
      vi.mocked(prisma.thesis.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.thesis.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.thesis.create).mockResolvedValue({ id: "2", title: "Thesis B" } as any);

      const res = await thesisService.create({ title: "Thesis B" });
      expect(res.title).toBe("Thesis B");
      expect(prisma.thesis.create).toHaveBeenCalled();
    });
  });
});

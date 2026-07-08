import { describe, it, expect, vi, beforeEach } from "vitest";
import { publicationService } from "../publicationService";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    publication: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe("publicationService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("throws error if missing required parameters", async () => {
      await expect(
        publicationService.create({ title: "", authors: "Someone", year: 2025, type: "article" })
      ).rejects.toThrow("Title, Authors, Year, and Type are mandatory fields");
    });

    it("creates publication successfully resolving unique slug and formatting BibTeX data", async () => {
      vi.mocked(prisma.publication.findFirst).mockResolvedValue(null);
      // Mock findUnique to return null immediately on slug lookup
      vi.mocked(prisma.publication.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.publication.create).mockResolvedValue({ id: "1", slug: "pub-slug", title: "Pub Title" } as any);

      const res = await publicationService.create({
        title: "Pub Title",
        authors: "Author A",
        year: 2025,
        type: "article",
      });

      expect(res.title).toBe("Pub Title");
      expect(prisma.publication.create).toHaveBeenCalled();
    });
  });
});

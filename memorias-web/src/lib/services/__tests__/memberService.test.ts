import { describe, it, expect, vi, beforeEach } from "vitest";
import { memberService } from "../memberService";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    member: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    project: {
      findMany: vi.fn(),
    },
    thesis: {
      findMany: vi.fn(),
    },
    scholarship: {
      findMany: vi.fn(),
    },
    publication: {
      findMany: vi.fn(),
    },
  },
}));

describe("memberService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("throws error if firstName or lastName is missing", async () => {
      await expect(
        memberService.create({ firstName: "", lastName: "Perez" })
      ).rejects.toThrow("First Name and Last Name are required.");
    });

    it("throws error if slug is already taken", async () => {
      vi.mocked(prisma.member.findUnique).mockResolvedValue({ id: "1" } as any);
      await expect(
        memberService.create({ firstName: "Juan", lastName: "Perez", slug: "juan-perez" })
      ).rejects.toThrow("The slug 'juan-perez' is already taken. Please customize it.");
    });

    it("creates member successfully", async () => {
      vi.mocked(prisma.member.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.member.create).mockResolvedValue({ id: "1", firstName: "Juan" } as any);

      const res = await memberService.create({ firstName: "Juan", lastName: "Perez" });
      expect(res.firstName).toBe("Juan");
      expect(prisma.member.create).toHaveBeenCalled();
    });
  });

  describe("delete", () => {
    it("throws error if referential integrity block is met", async () => {
      vi.mocked(prisma.project.findMany).mockResolvedValue([{ title: "Project A" }] as any);
      vi.mocked(prisma.thesis.findMany).mockResolvedValue([]);
      vi.mocked(prisma.scholarship.findMany).mockResolvedValue([]);
      vi.mocked(prisma.publication.findMany).mockResolvedValue([]);

      await expect(memberService.delete("1")).rejects.toThrow("REFERENTIAL_BLOCK");
    });

    it("deletes member if no active references exist", async () => {
      vi.mocked(prisma.project.findMany).mockResolvedValue([]);
      vi.mocked(prisma.thesis.findMany).mockResolvedValue([]);
      vi.mocked(prisma.scholarship.findMany).mockResolvedValue([]);
      vi.mocked(prisma.publication.findMany).mockResolvedValue([]);
      vi.mocked(prisma.member.delete).mockResolvedValue({ id: "1" } as any);

      const res = await memberService.delete("1");
      expect(res.id).toBe("1");
      expect(prisma.member.delete).toHaveBeenCalled();
    });
  });
});

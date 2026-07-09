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
      findMany: vi.fn(),
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

  describe("getBySlug", () => {
    it("fetches member by slug using findUnique", async () => {
      vi.mocked(prisma.member.findUnique).mockResolvedValue({ id: "m1", slug: "juan" } as any);
      const res = await memberService.getBySlug("juan");
      expect(res?.slug).toBe("juan");
      expect(prisma.member.findUnique).toHaveBeenCalledWith({ where: { slug: "juan" } });
    });
  });

  describe("getAllPositions", () => {
    it("fetches distinct positions and maps them", async () => {
      vi.mocked(prisma.member.findMany).mockResolvedValue([
        { positionAtLab: "Researcher" },
        { positionAtLab: "Student" },
        { positionAtLab: null },
      ] as any);
      const res = await memberService.getAllPositions();
      expect(res).toEqual(["Researcher", "Student"]);
      expect(prisma.member.findMany).toHaveBeenCalledWith({
        select: { positionAtLab: true },
        distinct: ["positionAtLab"],
      });
    });
  });

  describe("getAllMembers", () => {
    it("fetches all members ordered by lastName and firstName", async () => {
      vi.mocked(prisma.member.findMany).mockResolvedValue([{ id: "m1" }] as any);
      const res = await memberService.getAllMembers();
      expect(res).toEqual([{ id: "m1" }]);
      expect(prisma.member.findMany).toHaveBeenCalledWith({
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      });
    });
  });

  describe("getMemberDetail", () => {
    it("returns null if member not found", async () => {
      vi.mocked(prisma.member.findUnique).mockResolvedValue(null);
      const res = await memberService.getMemberDetail("not-found");
      expect(res).toBeNull();
    });

    it("fetches member detail and all deep relation collections", async () => {
      vi.mocked(prisma.member.findUnique).mockResolvedValue({ id: "m1" } as any);
      vi.mocked(prisma.project.findMany).mockResolvedValue([{ id: "p1" }] as any);
      vi.mocked(prisma.thesis.findMany).mockResolvedValue([{ id: "t1" }] as any);
      vi.mocked(prisma.scholarship.findMany).mockResolvedValue([{ id: "s1" }] as any);
      vi.mocked(prisma.publication.findMany).mockResolvedValue([{ id: "pub1" }] as any);

      const res = await memberService.getMemberDetail("juan");
      expect(res?.member).toEqual({ id: "m1" });
      expect(res?.projects).toEqual([{ id: "p1" }]);
      expect(res?.theses).toEqual([{ id: "t1" }]);
      expect(res?.scholarships).toEqual([{ id: "s1" }]);
      expect(res?.publications).toEqual([{ id: "pub1" }]);
    });
  });

  describe("getFormSelectionList", () => {
    it("fetches members for dropdowns sorted by lastName asc", async () => {
      vi.mocked(prisma.member.findMany).mockResolvedValue([{ id: "m1" }] as any);
      const res = await memberService.getFormSelectionList();
      expect(res).toEqual([{ id: "m1" }]);
      expect(prisma.member.findMany).toHaveBeenCalledWith({
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
    });
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { systemSettingsService } from "../systemSettingsService";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    systemSetting: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      upsert: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
    $transaction: vi.fn((actions) => Promise.all(actions)),
  },
}));

describe("systemSettingsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getSetting", () => {
    it("retrieves a setting value", async () => {
      vi.mocked(prisma.systemSetting.findUnique).mockResolvedValue({ key: "k", value: "v" } as any);
      const res = await systemSettingsService.getSetting("k");
      expect(res).toEqual({ key: "k", value: "v" });
      expect(prisma.systemSetting.findUnique).toHaveBeenCalledWith({ where: { key: "k" } });
    });
  });

  describe("getAllSettings", () => {
    it("returns a key-value map of system settings", async () => {
      vi.mocked(prisma.systemSetting.findMany).mockResolvedValue([
        { key: "welcome_title", value: "Hello" },
        { key: "logo_url", value: "http://logo" },
      ] as any);

      const res = await systemSettingsService.getAllSettings();
      expect(res).toEqual({
        welcome_title: "Hello",
        logo_url: "http://logo",
      });
    });
  });

  describe("saveSettings", () => {
    it("updates multiple settings and creates audit log in a transaction", async () => {
      vi.mocked(prisma.systemSetting.upsert).mockResolvedValue({} as any);
      vi.mocked(prisma.auditLog.create).mockResolvedValue({} as any);

      await systemSettingsService.saveSettings(
        { welcome_title: "Title A", welcome_subtitle: "Sub A" },
        { id: "admin-1", email: "admin@test.com" }
      );

      expect(prisma.systemSetting.upsert).toHaveBeenCalledTimes(2);
      expect(prisma.auditLog.create).toHaveBeenCalledTimes(1);
      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });
});

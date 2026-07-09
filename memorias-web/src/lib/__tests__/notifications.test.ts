import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { triggerImmediateNotification, sendDigestEmails } from "../notifications";
import { prisma } from "../../lib/prisma";
import * as emailModule from "../../lib/email";

// Mock the Prisma client
vi.mock("../../lib/prisma", () => ({
  prisma: {
    publication: {
      findUnique: vi.fn(),
    },
    project: {
      findUnique: vi.fn(),
    },
    thesis: {
      findUnique: vi.fn(),
    },
    scholarship: {
      findUnique: vi.fn(),
    },
    user: {
      findMany: vi.fn(),
    },
    auditLog: {
      findMany: vi.fn(),
    },
    systemSetting: {
      findUnique: vi.fn(),
    },
  },
}));

// Mock the email sending helper
vi.mock("../../lib/email", () => ({
  sendEmail: vi.fn(),
  getTransporter: vi.fn(),
  resetTransporter: vi.fn(),
}));

describe("Notification System Services", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    (process.env as any).NODE_ENV = "test";
    process.env.AUTH_URL = "http://localhost:3000";

    // Setup standard lab setting mock
    vi.mocked(prisma.systemSetting.findUnique).mockResolvedValue({
      key: "lab_name",
      value: "LIFIA",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("Immediate Notifications", () => {
    it("should successfully trigger immediate emails to mapped users of a new publication", async () => {
      // 1. Mock publication authors lookup
      vi.mocked(prisma.publication.findUnique).mockResolvedValue({
        id: "pub-1",
        members: [{ id: "member-a" }, { id: "member-b" }],
      } as any);

      // 2. Mock mapped users lookup
      vi.mocked(prisma.user.findMany).mockResolvedValue([
        { email: "author-a@example.com" },
        { email: "author-b@example.com" },
      ] as any);

      // 3. Mock sendEmail to return success
      vi.mocked(emailModule.sendEmail).mockResolvedValue({ success: true, messageId: "msg-id" });

      // 4. Trigger
      await triggerImmediateNotification(
        "CREATE",
        "Publication",
        "pub-1",
        "autonomous-agent-se",
        "Created publication: Autonomous Agent SE"
      );

      // 5. Assertions
      expect(prisma.publication.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.publication.findUnique).toHaveBeenCalledWith({
        where: { id: "pub-1" },
        select: { members: { select: { id: true } } },
      });

      expect(prisma.user.findMany).toHaveBeenCalledTimes(1);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {
          memberId: { in: ["member-a", "member-b"] },
          active: true,
          immediateNotifications: true,
        },
        select: { email: true },
      });

      expect(emailModule.sendEmail).toHaveBeenCalledTimes(2);
      const firstSendOptions = vi.mocked(emailModule.sendEmail).mock.calls[0][0] as any;
      expect(firstSendOptions.to).toBe("author-a@example.com");
      expect(firstSendOptions.subject).toContain("Alert: Publication added");
      expect(firstSendOptions.html).toContain("Autonomous Agent SE");
      expect(firstSendOptions.html).toContain("User Preferences");
    });

    it("should send immediate email to a user when their personal Member profile is updated", async () => {
      // 1. Mock mapped user lookup for Member update (the memberId is the entityId itself)
      vi.mocked(prisma.user.findMany).mockResolvedValue([
        { email: "member-profile-user@example.com" },
      ] as any);

      vi.mocked(emailModule.sendEmail).mockResolvedValue({ success: true, messageId: "msg-id" });

      // 2. Trigger immediate notification on Member update
      await triggerImmediateNotification(
        "UPDATE",
        "Member",
        "member-a",
        "john-doe",
        "Updated member profile: John Doe"
      );

      // For Member profiles, we bypass relational tables and target the member ID directly
      expect(prisma.user.findMany).toHaveBeenCalledTimes(1);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {
          memberId: { in: ["member-a"] },
          active: true,
          immediateNotifications: true,
        },
        select: { email: true },
      });

      expect(emailModule.sendEmail).toHaveBeenCalledTimes(1);
      const sendOptions = vi.mocked(emailModule.sendEmail).mock.calls[0][0] as any;
      expect(sendOptions.to).toBe("member-profile-user@example.com");
      expect(sendOptions.subject).toContain("Alert: Profile updated");
      expect(sendOptions.html).toContain("updates made to your official member profile");
    });

    it("should gracefully exit if no members are linked to the modified research item", async () => {
      vi.mocked(prisma.publication.findUnique).mockResolvedValue({
        id: "pub-empty",
        members: [],
      } as any);

      await triggerImmediateNotification(
        "UPDATE",
        "Publication",
        "pub-empty",
        "empty-pub",
        "Updated details"
      );

      expect(prisma.user.findMany).not.toHaveBeenCalled();
      expect(emailModule.sendEmail).not.toHaveBeenCalled();
    });

    it("should gracefully exit if target users have opted-out or are unmapped", async () => {
      vi.mocked(prisma.publication.findUnique).mockResolvedValue({
        id: "pub-1",
        members: [{ id: "member-a" }],
      } as any);

      // Return empty list representing no active users with immediateNotifications enabled
      vi.mocked(prisma.user.findMany).mockResolvedValue([]);

      await triggerImmediateNotification(
        "CREATE",
        "Publication",
        "pub-1",
        "slug",
        "Created publication"
      );

      expect(emailModule.sendEmail).not.toHaveBeenCalled();
    });
  });

  describe("Chronological Digest Summaries", () => {
    it("should compile recent audit logs and send a digest summary to active subscribers", async () => {
      // 1. Mock recent logs query
      vi.mocked(prisma.auditLog.findMany).mockResolvedValue([
        {
          id: "log-1",
          action: "CREATE",
          entityType: "Publication",
          entityId: "pub-1",
          entitySlug: "agents-migration",
          details: "Created publication: monorepo migration with agents",
          createdAt: new Date(),
        },
        {
          id: "log-2",
          action: "UPDATE",
          entityType: "Thesis",
          entityId: "thesis-1",
          entitySlug: "phd-agents",
          details: "Updated thesis level to PhD",
          createdAt: new Date(),
        },
      ] as any);

      // 2. Mock digest subscribers query
      vi.mocked(prisma.user.findMany).mockResolvedValue([
        { email: "subscriber-a@example.com" },
        { email: "subscriber-b@example.com" },
      ] as any);

      vi.mocked(emailModule.sendEmail).mockResolvedValue({ success: true });

      // 3. Trigger digest execution
      const result = await sendDigestEmails("weekly");

      // 4. Assertions
      expect(result.success).toBe(true);
      expect(result.count).toBe(2); // two subscribers notified

      expect(prisma.auditLog.findMany).toHaveBeenCalledTimes(1);
      expect(prisma.user.findMany).toHaveBeenCalledTimes(1);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {
          active: true,
          digestEmails: true,
        },
        select: { email: true },
      });

      expect(emailModule.sendEmail).toHaveBeenCalledTimes(2);
      const sendOptions = vi.mocked(emailModule.sendEmail).mock.calls[0][0] as any;
      expect(sendOptions.to).toBe("subscriber-a@example.com");
      expect(sendOptions.subject).toContain("Weekly Portal Digest");
      expect(sendOptions.html).toContain("monorepo migration with agents");
      expect(sendOptions.html).toContain("Updated thesis level to PhD");
    });

    it("should exit cleanly and return count 0 if no audit logs are found during the lookback window", async () => {
      // Return empty logs
      vi.mocked(prisma.auditLog.findMany).mockResolvedValue([]);

      const result = await sendDigestEmails("daily");

      expect(result.success).toBe(true);
      expect(result.count).toBe(0);
      expect(prisma.user.findMany).not.toHaveBeenCalled();
      expect(emailModule.sendEmail).not.toHaveBeenCalled();
    });
  });
});

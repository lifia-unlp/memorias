import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/lib/notifications", () => ({
  sendDigestEmails: vi.fn(() => Promise.resolve({ success: true, count: 5 })),
}));

import { GET } from "../route";

describe("GET /api/cron/digest authentication", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns 401 Unauthorized when CRON_SECRET is not configured", async () => {
    delete process.env.CRON_SECRET;
    const req = new Request("http://localhost/api/cron/digest", {
      headers: { Authorization: "Bearer some-token" },
    });
    const res = await GET(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toContain("CRON_SECRET is not configured");
  });

  it("returns 401 Unauthorized when Authorization header is missing", async () => {
    process.env.CRON_SECRET = "super-secret-cron-key";
    const req = new Request("http://localhost/api/cron/digest");
    const res = await GET(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toContain("Authorization Bearer header is required");
  });

  it("returns 401 Unauthorized when credentials are sent via query parameter only", async () => {
    process.env.CRON_SECRET = "super-secret-cron-key";
    const req = new Request("http://localhost/api/cron/digest?secret=super-secret-cron-key");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("returns 401 Unauthorized when Bearer token is incorrect", async () => {
    process.env.CRON_SECRET = "super-secret-cron-key";
    const req = new Request("http://localhost/api/cron/digest", {
      headers: { Authorization: "Bearer wrong-key" },
    });
    const res = await GET(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toContain("Invalid CRON_SECRET token");
  });

  it("returns 200 OK when valid Bearer token is provided", async () => {
    process.env.CRON_SECRET = "super-secret-cron-key";
    const req = new Request("http://localhost/api/cron/digest", {
      headers: { Authorization: "Bearer super-secret-cron-key" },
    });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.usersNotified).toBe(5);
  });
});

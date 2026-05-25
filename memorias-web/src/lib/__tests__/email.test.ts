import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getTransporter, sendEmail, resetTransporter } from "../email";

describe("Email Notification Service", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    process.env.NODE_ENV = "test";
    resetTransporter();
  });

  afterEach(() => {
    process.env = originalEnv;
    resetTransporter();
  });

  it("should create a stream transporter when NODE_ENV is set to 'test'", () => {
    const transporter = getTransporter();
    expect(transporter).toBeDefined();
    expect((transporter.options as any).streamTransport).toBe(true);
  });

  it("should create a JSON transport when configuration is incomplete and not in production", () => {
    process.env.NODE_ENV = "development";
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;

    const transporter = getTransporter();
    expect(transporter).toBeDefined();
    expect((transporter.options as any).jsonTransport).toBe(true);
  });

  it("should create a real SMTP transporter when configuration is complete in production/development", () => {
    process.env.NODE_ENV = "production";
    process.env.SMTP_HOST = "smtp.gmail.com";
    process.env.SMTP_PORT = "587";
    process.env.SMTP_SECURE = "false";
    process.env.SMTP_USER = "test@gmail.com";
    process.env.SMTP_PASS = "app-password-123";

    const transporter = getTransporter();
    expect(transporter).toBeDefined();
    expect((transporter.options as any).host).toBe("smtp.gmail.com");
    expect((transporter.options as any).port).toBe(587);
    expect((transporter.options as any).secure).toBe(false);
    expect((transporter.options as any).auth.user).toBe("test@gmail.com");
  });

  it("should successfully send an email using streamTransport and return messageId in test mode", async () => {
    const result = await sendEmail({
      to: "recipient@example.com",
      subject: "Test Subject",
      html: "<p>Hello <strong>World</strong>!</p>",
    });

    expect(result.success).toBe(true);
    expect(result.messageId).toBeDefined();
  });

  it("should correctly format From, To, Subject, HTML, and Text fallback in the sent options", async () => {
    process.env.SMTP_FROM_NAME = "Custom Name";
    process.env.SMTP_FROM_EMAIL = "custom@example.com";

    const transporter = getTransporter();
    const sendMailSpy = vi.spyOn(transporter, "sendMail");

    await sendEmail({
      to: "user@example.com",
      subject: "Verification Needed",
      html: "<div>Please click <a href='#'>here</a>.</div>",
    });

    expect(sendMailSpy).toHaveBeenCalledTimes(1);
    const sentOptions = sendMailSpy.mock.calls[0][0] as any;
    
    expect(sentOptions.from).toBe('"Custom Name" <custom@example.com>');
    expect(sentOptions.to).toBe("user@example.com");
    expect(sentOptions.subject).toBe("Verification Needed");
    expect(sentOptions.html).toBe("<div>Please click <a href='#'>here</a>.</div>");
    expect(sentOptions.text).toBe("Please click here.");
  });

  it("should catch and return failure status when nodemailer transporter throws an error", async () => {
    const transporter = getTransporter();
    vi.spyOn(transporter, "sendMail").mockRejectedValueOnce(new Error("SMTP server connection timeout"));

    const result = await sendEmail({
      to: "fail@example.com",
      subject: "Error Test",
      html: "<p>Will fail</p>",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error.message).toBe("SMTP server connection timeout");
  });
});

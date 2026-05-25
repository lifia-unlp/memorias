import nodemailer from "nodemailer";

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

let transporter: nodemailer.Transporter | null = null;

/**
 * Retrieves or instantiates the singleton nodemailer transporter based on the active environment.
 * If NODE_ENV is set to "test", an in-memory stream transport is returned to isolate testing.
 * If config variables are missing, a development jsonTransport is returned.
 */
export function getTransporter(): nodemailer.Transporter {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const secure = process.env.SMTP_SECURE === "true";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (process.env.NODE_ENV === "test") {
    // Return a mock transporter that captures mail output into buffers for verification
    transporter = nodemailer.createTransport({
      streamTransport: true,
      newline: "unix",
      buffer: true,
    });
    return transporter;
  }

  if (!host || !user || !pass) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("SMTP configuration is incomplete. Emails will be logged locally instead of sent.");
    }
    // Return a console/JSON logging transport for development
    transporter = nodemailer.createTransport({
      jsonTransport: true,
    });
    return transporter;
  }

  // Create real secure SMTP transport (fully compatible with Google & Office 365 services)
  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: true,
    },
  });

  return transporter;
}

/**
 * Sends an email using the active environment transport.
 */
export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: any }> {
  try {
    const activeTransporter = getTransporter();
    const fromName = process.env.SMTP_FROM_NAME || "Memorias Portal";
    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || "noreply@lifia.info.unlp.edu.ar";

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ""), // simple fallback text strip
    };

    const info = await activeTransporter.sendMail(mailOptions);

    // Development mode console log preview
    if (
      process.env.NODE_ENV === "development" &&
      (!process.env.SMTP_HOST || (activeTransporter.options as any).jsonTransport)
    ) {
      console.log("[DEVELOPMENT EMAIL LOG]:", JSON.stringify(info, null, 2));
    }

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("Failed to send email:", error);
    return {
      success: false,
      error,
    };
  }
}

/**
 * Resets the cached singleton transporter.
 * Primarily used in test isolation to re-initialize configuration variables.
 */
export function resetTransporter(): void {
  transporter = null;
}

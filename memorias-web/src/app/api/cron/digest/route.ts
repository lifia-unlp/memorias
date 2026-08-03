import { NextResponse } from "next/server";
import { sendDigestEmails } from "@/lib/notifications";
import crypto from "crypto";

function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Exposes a GET route to trigger the automated digest generation.
 * Secured strictly using a CRON_SECRET token passed in the Authorization: Bearer header.
 */
export async function GET(request: Request) {
  try {
    const cronSecret = process.env.CRON_SECRET?.trim();
    if (!cronSecret) {
      return NextResponse.json(
        { error: "Unauthorized. Server CRON_SECRET is not configured." },
        { status: 401 }
      );
    }

    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized. Authorization Bearer header is required." },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7).trim();
    if (!safeCompare(token, cronSecret)) {
      return NextResponse.json(
        { error: "Unauthorized. Invalid CRON_SECRET token." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const frequency = searchParams.get("frequency") || undefined;

    const res = await sendDigestEmails(frequency);

    return NextResponse.json({
      success: res.success,
      message: "Successfully processed digest dispatch.",
      usersNotified: res.count,
    });
  } catch (error: any) {
    console.error("Cron digest execution failed:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error." },
      { status: 500 }
    );
  }
}

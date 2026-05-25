import { NextResponse } from "next/server";
import { sendDigestEmails } from "@/lib/notifications";

/**
 * Exposes a GET route to trigger the automated digest generation.
 * Secured using a CRON_SECRET token passed in the Authorization header or secret query parameter.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const authHeader = request.headers.get("authorization");

    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const token = authHeader?.startsWith("Bearer ")
        ? authHeader.slice(7)
        : searchParams.get("secret");

      if (token !== cronSecret) {
        return NextResponse.json(
          { error: "Unauthorized. Valid CRON_SECRET token required." },
          { status: 401 }
        );
      }
    }

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

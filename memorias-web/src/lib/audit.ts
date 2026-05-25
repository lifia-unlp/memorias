import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { triggerImmediateNotification } from "@/lib/notifications";

export async function logAction(
  action: "CREATE" | "UPDATE" | "DELETE",
  entityType: "Member" | "Project" | "Thesis" | "Scholarship" | "Publication" | "Tag",
  entityId: string,
  entitySlug: string | null,
  details: string | null
) {
  try {
    const session = await auth();
    await prisma.auditLog.create({
      data: {
        action,
        entityType,
        entityId,
        entitySlug,
        userId: session?.user?.id || null,
        userEmail: session?.user?.email || null,
        details,
      },
    });

    // Central Hook: trigger immediate alerts for mapped users
    try {
      await triggerImmediateNotification(action, entityType, entityId, entitySlug, details);
    } catch (notifErr) {
      console.error("Failed to trigger immediate notification:", notifErr);
    }
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}

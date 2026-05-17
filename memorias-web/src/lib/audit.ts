import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function logAction(
  action: "CREATE" | "UPDATE" | "DELETE",
  entityType: "Member" | "Project" | "Thesis" | "Scholarship" | "Publication",
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
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}

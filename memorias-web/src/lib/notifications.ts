import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { getLabName } from "@/lib/config";

/**
 * Immediate Notifications: Identifies mapped users linked to the modified entity
 * (including the Member profile itself) and sends them an immediate alert email.
 */
export async function triggerImmediateNotification(
  action: "CREATE" | "UPDATE" | "DELETE",
  entityType: "Member" | "Project" | "Thesis" | "Scholarship" | "Publication" | "Tag",
  entityId: string,
  entitySlug: string | null,
  details: string | null
) {
  try {
    // Only notify for primary research entities and the Member profile itself
    if (!["Publication", "Project", "Thesis", "Scholarship", "Member"].includes(entityType)) {
      return;
    }

    const labName = await getLabName();
    const portalUrl = process.env.AUTH_URL || "http://localhost:3000";

    // 1. Determine associated Member IDs
    let memberIds: string[] = [];
    if (entityType === "Member") {
      // If the Member profile itself was modified, target that Member profile directly
      memberIds = [entityId];
    } else if (entityType === "Publication") {
      const pub = await prisma.publication.findUnique({
        where: { id: entityId },
        select: { members: { select: { id: true } } },
      });
      memberIds = pub?.members.map((m) => m.id) || [];
    } else if (entityType === "Project") {
      const proj = await prisma.project.findUnique({
        where: { id: entityId },
        select: { members: { select: { id: true } } },
      });
      memberIds = proj?.members.map((m) => m.id) || [];
    } else if (entityType === "Thesis") {
      const thesis = await prisma.thesis.findUnique({
        where: { id: entityId },
        select: { members: { select: { id: true } } },
      });
      memberIds = thesis?.members.map((m) => m.id) || [];
    } else if (entityType === "Scholarship") {
      const sch = await prisma.scholarship.findUnique({
        where: { id: entityId },
        select: { members: { select: { id: true } } },
      });
      memberIds = sch?.members.map((m) => m.id) || [];
    }

    if (memberIds.length === 0) return;

    // 2. Query mapped active users who want immediate alerts
    const targetUsers = await prisma.user.findMany({
      where: {
        memberId: { in: memberIds },
        active: true,
        immediateNotifications: true,
      },
      select: { email: true },
    });

    if (targetUsers.length === 0) return;

    // 3. Format the lightweight HTML email
    const actionLabel = action === "CREATE" ? "added" : action === "UPDATE" ? "updated" : "deleted";
    const subject = `[${labName} Memorias] Alert: ${entityType === "Member" ? "Profile" : entityType} ${actionLabel}`;

    const introText = entityType === "Member"
      ? `This is an immediate notification regarding updates made to your official member profile.`
      : `This is an immediate notification regarding a research item you are linked to in the portal.`;

    const html = `
      <div style="font-family: sans-serif; font-size: 14px; line-height: 1.5; color: #111111;">
        <p>Hello,</p>
        <p>${introText}</p>
        
        <div style="margin: 20px 0; padding-left: 15px; border-left: 3px solid #1976d2;">
          <strong>Action:</strong> ${action === "CREATE" ? "Created / Added" : action === "UPDATE" ? "Updated / Modified" : "Deleted / Removed"}<br />
          <strong>Category:</strong> ${entityType}<br />
          <strong>Details:</strong> ${details || "No additional details provided."}
        </div>

        ${action !== "DELETE" && entitySlug ? `
        <p>You can view the record directly on the portal by clicking the link below:</p>
        <p><a href="${portalUrl}/${entityType.toLowerCase() === "member" ? "members" : entityType.toLowerCase() + "s"}/${entitySlug}" style="display: inline-block; background-color: #1976d2; color: #ffffff; padding: 8px 16px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 0.85rem;">View ${entityType}</a></p>
        ` : ""}

        <p style="margin-top: 30px; border-top: 1px solid #dddddd; padding-top: 15px; font-size: 12px; color: #666666;">
          This email was sent from the ${labName} Memorias Portal because your account is linked to your member profile.<br />
          If you wish to stop receiving these immediate alerts, you can customize your preferences at any time in your <a href="${portalUrl}/preferences" style="color: #1976d2; text-decoration: underline;">User Preferences</a>.
        </p>
      </div>
    `;

    // 4. Send emails concurrently
    await Promise.all(
      targetUsers.map((user) =>
        sendEmail({
          to: user.email,
          subject,
          html,
        }).catch((err) => {
          console.error(`Failed to send immediate notification to ${user.email}:`, err);
        })
      )
    );
  } catch (error) {
    console.error("Failed to process immediate notification:", error);
  }
}

/**
 * Digest Emails: Compiles recent updates from AuditLog and sends a summary to opted-in users.
 */
export async function sendDigestEmails(frequency?: string): Promise<{ success: boolean; count: number }> {
  try {
    const freq = frequency || process.env.DIGEST_FREQUENCY || "weekly";
    const labName = await getLabName();
    const portalUrl = process.env.AUTH_URL || "http://localhost:3000";

    // 1. Calculate lookback window
    let lookbackDays = 7;
    if (freq === "daily") lookbackDays = 1;
    else if (freq === "biweekly") lookbackDays = 14;
    else if (freq === "monthly") lookbackDays = 30;

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - lookbackDays);

    // 2. Fetch recent research log events
    const logs = await prisma.auditLog.findMany({
      where: {
        createdAt: { gte: cutoff },
        entityType: { in: ["Publication", "Project", "Thesis", "Scholarship", "Member"] },
      },
      orderBy: { createdAt: "desc" },
    });

    if (logs.length === 0) {
      return { success: true, count: 0 };
    }

    // 3. Fetch digest subscribers
    const targetUsers = await prisma.user.findMany({
      where: {
        active: true,
        digestEmails: true,
      },
      select: { email: true },
    });

    if (targetUsers.length === 0) {
      return { success: true, count: 0 };
    }

    // 4. Format digest HTML
    const startDate = cutoff.toLocaleDateString();
    const endDate = new Date().toLocaleDateString();
    const subject = `[${labName} Memorias] ${freq.charAt(0).toUpperCase() + freq.slice(1)} Portal Digest`;

    const html = `
      <div style="font-family: sans-serif; font-size: 14px; line-height: 1.5; color: #111111;">
        <p>Hello,</p>
        <p>Here is your ${freq} summary of recent research activity and portal updates at the ${labName} Memorias Portal between ${startDate} and ${endDate}.</p>
        
        <h3 style="border-bottom: 1px solid #dddddd; padding-bottom: 5px; color: #1976d2;">Recent Portal Updates (${logs.length} changes)</h3>
        <ul style="padding-left: 20px; line-height: 1.8;">
          ${logs
            .map((log) => {
              const actionLabel = log.action === "CREATE" ? "Added" : log.action === "UPDATE" ? "Modified" : "Removed";
              const pathName = log.entityType.toLowerCase() === "member" ? "members" : log.entityType.toLowerCase() + "s";
              return `
                <li>
                  <strong>${log.entityType} ${actionLabel}:</strong> 
                  ${log.details || `${log.entityType} with ID ${log.entityId}`}
                  ${
                    log.action !== "DELETE" && log.entitySlug
                      ? `(<a href="${portalUrl}/${pathName}/${log.entitySlug}" style="color: #1976d2; text-decoration: underline;">View details</a>)`
                      : ""
                  }
                </li>
              `;
            })
            .join("")}
        </ul>

        <p style="margin-top: 30px; border-top: 1px solid #dddddd; padding-top: 15px; font-size: 12px; color: #666666;">
          This email was sent from the ${labName} Memorias Portal because you are subscribed to digest updates.<br />
          If you wish to stop receiving these digest summaries, you can customize your preferences at any time in your <a href="${portalUrl}/preferences" style="color: #1976d2; text-decoration: underline;">User Preferences</a>.
        </p>
      </div>
    `;

    // 5. Send digests concurrently
    await Promise.all(
      targetUsers.map((user) =>
        sendEmail({
          to: user.email,
          subject,
          html,
        }).catch((err) => {
          console.error(`Failed to send digest email to ${user.email}:`, err);
        })
      )
    );

    return { success: true, count: targetUsers.length };
  } catch (error) {
    console.error("Failed to send digest emails:", error);
    return { success: false, count: 0 };
  }
}
export function resetTransporter(): void {
  // Provided for test setup conformity
}

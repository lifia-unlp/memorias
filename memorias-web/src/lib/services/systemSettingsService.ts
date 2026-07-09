import { prisma } from "@/lib/prisma";

export const systemSettingsService = {
  getSetting: async (key: string) => {
    return prisma.systemSetting.findUnique({ where: { key } }).catch(() => null);
  },

  getAllSettings: async () => {
    const keys = [
      "welcome_title",
      "welcome_subtitle",
      "logo_url",
      "lab_name",
      "lab_url",
      "require_user_activation",
    ];
    const settings = await prisma.systemSetting.findMany({
      where: { key: { in: keys } },
    });
    const map: Record<string, string> = {};
    for (const s of settings) {
      map[s.key] = s.value;
    }
    return map;
  },

  saveSettings: async (
    settings: Record<string, string>,
    sessionUser: { id: string | null; email: string }
  ) => {
    const upserts = Object.entries(settings).map(([key, value]) =>
      prisma.systemSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      })
    );

    await prisma.$transaction([
      ...upserts,
      prisma.auditLog.create({
        data: {
          action: "UPDATE",
          entityType: "SystemSetting",
          entityId: "system_configuration",
          entitySlug: "system-config",
          userId: sessionUser.id,
          userEmail: sessionUser.email,
          details: `Updated system settings: welcome_title="${(settings.welcome_title || "").slice(0, 40)}...", welcome_subtitle="${(settings.welcome_subtitle || "").slice(0, 40)}...", lab_name="${settings.lab_name || ""}", lab_url="${settings.lab_url || ""}", require_user_activation="${settings.require_user_activation || ""}".`,
        },
      }),
    ]);
  },
};

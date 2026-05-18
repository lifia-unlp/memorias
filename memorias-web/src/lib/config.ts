import { prisma } from "@/lib/prisma";

export async function getLabName(): Promise<string> {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: "lab_name" },
    });
    return setting?.value || process.env.LAB_NAME || "LIFIA";
  } catch {
    return process.env.LAB_NAME || "LIFIA";
  }
}

export async function getLabUrl(): Promise<string> {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: "lab_url" },
    });
    return setting?.value || process.env.LAB_URL || "https://lifia.info.unlp.edu.ar";
  } catch {
    return process.env.LAB_URL || "https://lifia.info.unlp.edu.ar";
  }
}

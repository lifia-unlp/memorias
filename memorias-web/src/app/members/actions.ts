"use server";

import { revalidatePath } from "next/cache";
import { logAction } from "@/lib/audit";
import { sanitizeTag } from "@/lib/tags";
import { ensureEditorOrAdmin } from "@/lib/auth-helpers";
import { memberService } from "@/lib/services/memberService";

export async function createMember(formData: FormData) {
  await ensureEditorOrAdmin();

  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const slug = formData.get("slug") as string;
  
  if (!firstName || !lastName) {
    throw new Error("First Name and Last Name are required.");
  }

  const startDateStr = formData.get("startDate") as string;
  const endDateStr = formData.get("endDate") as string;

  const member = await memberService.create({
    firstName,
    lastName,
    slug: slug || undefined,
    startDate: startDateStr ? new Date(startDateStr) : null,
    endDate: endDateStr ? new Date(endDateStr) : null,
    highestDegree: (formData.get("highestDegree") as string) || null,
    coursesAtUNLP: (formData.get("coursesAtUNLP") as string) || null,
    positionAtLab: (formData.get("positionAtLab") as string) || null,
    positionAtUnlp: (formData.get("positionAtUnlp") as string) || null,
    category: (formData.get("category") as string) || null,
    sicadiCategory: (formData.get("sicadiCategory") as string) || null,
    positionAtCIC: (formData.get("positionAtCIC") as string) || null,
    positionAtCONICET: (formData.get("positionAtCONICET") as string) || null,
    personalEmail: (formData.get("personalEmail") as string) || null,
    institutionalEmail: (formData.get("institutionalEmail") as string) || null,
    phone: (formData.get("phone") as string) || null,
    webPage: (formData.get("webPage") as string) || null,
    orcid: (formData.get("orcid") as string) || null,
    dblpProfile: (formData.get("dblpProfile") as string) || null,
    googleResearchProfile: (formData.get("googleResearchProfile") as string) || null,
    researchGateProfile: (formData.get("researchGateProfile") as string) || null,
    shortCvInSpanish: (formData.get("shortCvInSpanish") as string) || null,
    shortCvInEnglish: (formData.get("shortCvInEnglish") as string) || null,
    interestsInEnglish: (formData.get("interestsInEnglish") as string) || null,
    interestsInSpanish: (formData.get("interestsInSpanish") as string) || null,
    affiliations: (formData.get("affiliations") as string) || null,
    notes: (formData.get("notes") as string) || null,
    avatarUrl: (formData.get("avatarUrl") as string) || null,
    tags: formData.get("tags")
      ? (formData.get("tags") as string)
          .split(",")
          .map((t) => sanitizeTag(t))
          .filter(Boolean)
      : [],
  });

  await logAction("CREATE", "Member", member.id, member.slug, `Created member profile: ${member.firstName} ${member.lastName}`);

  revalidatePath("/members");
  return { success: true };
}

export async function updateMember(memberId: string, formData: FormData) {
  await ensureEditorOrAdmin();

  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const slug = formData.get("slug") as string;

  if (!firstName || !lastName || !slug) {
    throw new Error("First Name, Last Name, and Slug are required.");
  }

  const startDateStr = formData.get("startDate") as string;
  const endDateStr = formData.get("endDate") as string;

  const member = await memberService.update(memberId, {
    firstName,
    lastName,
    slug,
    startDate: startDateStr ? new Date(startDateStr) : null,
    endDate: endDateStr ? new Date(endDateStr) : null,
    highestDegree: (formData.get("highestDegree") as string) || null,
    coursesAtUNLP: (formData.get("coursesAtUNLP") as string) || null,
    positionAtLab: (formData.get("positionAtLab") as string) || null,
    positionAtUnlp: (formData.get("positionAtUnlp") as string) || null,
    category: (formData.get("category") as string) || null,
    sicadiCategory: (formData.get("sicadiCategory") as string) || null,
    positionAtCIC: (formData.get("positionAtCIC") as string) || null,
    positionAtCONICET: (formData.get("positionAtCONICET") as string) || null,
    personalEmail: (formData.get("personalEmail") as string) || null,
    institutionalEmail: (formData.get("institutionalEmail") as string) || null,
    phone: (formData.get("phone") as string) || null,
    webPage: (formData.get("webPage") as string) || null,
    orcid: (formData.get("orcid") as string) || null,
    dblpProfile: (formData.get("dblpProfile") as string) || null,
    googleResearchProfile: (formData.get("googleResearchProfile") as string) || null,
    researchGateProfile: (formData.get("researchGateProfile") as string) || null,
    shortCvInSpanish: (formData.get("shortCvInSpanish") as string) || null,
    shortCvInEnglish: (formData.get("shortCvInEnglish") as string) || null,
    interestsInEnglish: (formData.get("interestsInEnglish") as string) || null,
    interestsInSpanish: (formData.get("interestsInSpanish") as string) || null,
    affiliations: (formData.get("affiliations") as string) || null,
    notes: (formData.get("notes") as string) || null,
    avatarUrl: (formData.get("avatarUrl") as string) || null,
    tags: formData.get("tags")
      ? (formData.get("tags") as string)
          .split(",")
          .map((t) => sanitizeTag(t))
          .filter(Boolean)
      : [],
  });

  await logAction("UPDATE", "Member", member.id, member.slug, `Updated member profile: ${member.firstName} ${member.lastName}`);

  revalidatePath("/members");
  revalidatePath(`/members/${slug}`);
  return { success: true };
}

export async function deleteMember(memberId: string) {
  await ensureEditorOrAdmin();

  const blockCheck = await memberService.checkReferentialBlock(memberId);
  if (blockCheck.isBlocked) {
    return {
      success: false,
      error: "REFERENTIAL_BLOCK",
      references: blockCheck.references,
    };
  }

  const member = await memberService.delete(memberId);

  await logAction("DELETE", "Member", member.id, member.slug, `Deleted member profile: ${member.firstName} ${member.lastName}`);

  revalidatePath("/members");
  return { success: true };
}

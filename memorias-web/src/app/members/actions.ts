"use server";

import { revalidatePath } from "next/cache";
import { logAction } from "@/lib/audit";
import { ensureEditorOrAdmin } from "@/lib/auth-helpers";
import { memberService } from "@/lib/services/memberService";
import { parseMemberFormData } from "@/lib/mappers";

export async function createMember(formData: FormData) {
  await ensureEditorOrAdmin();

  const input = parseMemberFormData(formData);
  const member = await memberService.create(input);

  await logAction("CREATE", "Member", member.id, member.slug, `Created member profile: ${member.firstName} ${member.lastName}`);

  revalidatePath("/members");
  return { success: true };
}

export async function updateMember(memberId: string, formData: FormData) {
  await ensureEditorOrAdmin();

  const input = parseMemberFormData(formData, true);
  const member = await memberService.update(memberId, input);

  await logAction("UPDATE", "Member", member.id, member.slug, `Updated member profile: ${member.firstName} ${member.lastName}`);

  revalidatePath("/members");
  revalidatePath(`/members/${input.slug}`);
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

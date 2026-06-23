import { auth } from "@/auth";

export async function ensureEditorOrAdmin() {
  const session = await auth();
  if (!session || !session.user?.active) {
    throw new Error("Unauthorized. Active session required.");
  }
  const role = session.user.role;
  if (role !== "EDITOR" && role !== "ADMIN") {
    throw new Error("Unauthorized. Editor or Administrator role required.");
  }
}

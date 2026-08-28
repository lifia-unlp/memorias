import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleSignOut } from "../actions";

vi.mock("@/auth", () => ({
  signOut: vi.fn(),
}));

import { signOut } from "@/auth";

describe("Auth Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls signOut with default redirectTo '/'", async () => {
    await handleSignOut();
    expect(signOut).toHaveBeenCalledWith({ redirectTo: "/" });
  });

  it("calls signOut with custom redirectTo", async () => {
    await handleSignOut("/auth/signin");
    expect(signOut).toHaveBeenCalledWith({ redirectTo: "/auth/signin" });
  });
});

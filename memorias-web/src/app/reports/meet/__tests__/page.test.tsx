import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import MeetingPage from "../page";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

vi.mock("@/components/Header", () => ({ Header: () => <nav>Navigation</nav> }));
vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn(() => { throw new Error("redirect"); }) }));
vi.mock("../../follow-up/actions", () => ({
  getActiveFollowUpItems: vi.fn().mockResolvedValue([]),
  getRecentFollowUpChanges: vi.fn().mockResolvedValue([]),
}));
vi.mock("../MeetClient", () => ({ default: () => <div>Meeting content</div> }));

describe("MeetingPage", () => {
  it("renders the heading and meeting workspace for an active user", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { active: true } } as never);
    render(await MeetingPage());
    expect(screen.getByRole("heading", { level: 1, name: "Follow-Up Meeting Dashboard" })).toBeInTheDocument();
    expect(screen.getByText("Meeting content")).toBeInTheDocument();
  });
  it("redirects unauthenticated visitors", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);
    await expect(MeetingPage()).rejects.toThrow("redirect");
    expect(redirect).toHaveBeenCalledWith("/auth/signin");
  });
});

import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import MeetClient from "../MeetClient";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

// Mock server actions
vi.mock("../../follow-up/actions", () => ({
  updateFollowUpItemStatus: vi.fn().mockResolvedValue({ success: true }),
  updateFollowUpHistory: vi.fn().mockResolvedValue({ success: true }),
  deleteFollowUpHistory: vi.fn().mockResolvedValue({ success: true }),
  updateFollowUpItem: vi.fn().mockResolvedValue({ success: true }),
}));

describe("MeetClient component", () => {
  const sampleChanges = [
    {
      id: "hist-1",
      fromStatus: "PLANNING",
      toStatus: "IN_PROGRESS",
      notes: "Started draft",
      meetingDate: new Date().toISOString(),
      loggedBy: { name: "Alice Researcher", email: "alice@lifia.edu.ar" },
      followUpItem: {
        id: "item-1",
        title: "Paper on Antigravity LLMs",
        category: "PUBLICATION" as const,
        status: "IN_PROGRESS",
        description: "Drafting introduction section",
        owners: [{ id: "mem-1", firstName: "Alice", lastName: "Researcher" }],
        history: [],
      },
    },
    {
      id: "hist-2",
      fromStatus: "PLANNING",
      toStatus: "PLANNING",
      notes: "Proposed thesis topic",
      meetingDate: new Date().toISOString(),
      loggedBy: { name: "Bob Scientist", email: "bob@lifia.edu.ar" },
      followUpItem: {
        id: "item-2",
        title: "Master Thesis on Quantum AI",
        category: "THESIS" as const,
        status: "PLANNING",
        description: "Initial proposal",
        owners: [{ id: "mem-2", firstName: "Bob", lastName: "Scientist" }],
        history: [],
      },
    },
  ];

  it("renders empty state message when no changes match filter", () => {
    render(<MeetClient initialItems={[]} recentChanges={[]} />);
    expect(screen.getByText("No changes or news logged during the selected period.")).toBeInTheDocument();
  });

  it("renders changes grouped by Persona -> Tipo -> Estado", () => {
    render(<MeetClient initialItems={[]} recentChanges={sampleChanges} />);

    // Persona headers
    expect(screen.getByText(/Alice Researcher \(1 novedad\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Bob Scientist \(1 novedad\)/i)).toBeInTheDocument();

    // Tipo headers
    expect(screen.getByText(/Follow-up items for Publications/i)).toBeInTheDocument();
    expect(screen.getByText(/Follow-up items for Theses/i)).toBeInTheDocument();

    // Item titles
    expect(screen.getByText("Paper on Antigravity LLMs")).toBeInTheDocument();
    expect(screen.getByText("Master Thesis on Quantum AI")).toBeInTheDocument();
  });
});

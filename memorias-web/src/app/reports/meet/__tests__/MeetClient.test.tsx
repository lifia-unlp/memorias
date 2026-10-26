import { render, screen, fireEvent, within, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { updateFollowUpHistory, updateFollowUpItemStatus } from "../../follow-up/actions";
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

  it("groups by reporter with flat item entries", () => {
    render(<MeetClient initialItems={[]} recentChanges={sampleChanges} />);
    const alice = screen.getByRole("region", { name: "Alice Researcher" });
    expect(within(alice).getByRole("heading", { name: "Paper on Antigravity LLMs" })).toBeInTheDocument();
    expect(within(alice).getByText("Started draft")).toBeInTheDocument();
    expect(within(alice).getByText("Owners: Alice Researcher")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Bob Scientist" })).toBeInTheDocument();
    expect(within(alice).getByRole("heading", { name: "Publications" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Theses" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Delete note" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(2);
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(2);
    expect(screen.getAllByRole("heading", { level: 4 })).toHaveLength(2);
  });

  it("gives person and section headings more visual weight than item titles", () => {
    render(<MeetClient initialItems={[]} recentChanges={[sampleChanges[0]]} />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveStyle({ fontWeight: 750 });
    expect(screen.getByRole("heading", { level: 3 })).toHaveStyle({ fontWeight: 650 });
    expect(screen.getByRole("heading", { level: 4 })).toHaveStyle({ fontWeight: 400 });
  });

  it("switches to type, merges shared items and retains every reporter's notes", () => {
    const additional = { ...sampleChanges[0], id: "hist-3", loggedBy: sampleChanges[1].loggedBy, notes: "Reviewed the draft" };
    render(<MeetClient initialItems={[]} recentChanges={[...sampleChanges, additional]} />);
    expect(screen.getAllByText("Paper on Antigravity LLMs")).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: "Type" }));
    const publications = screen.getByRole("region", { name: "Publications" });
    expect(within(publications).getAllByRole("article")).toHaveLength(1);
    expect(within(publications).getByText("Started draft")).toBeInTheDocument();
    expect(within(publications).getByText("Reviewed the draft")).toBeInTheDocument();
    expect(within(publications).getByText(/· Alice Researcher/)).toBeInTheDocument();
    expect(within(publications).getByText(/· Bob Scientist/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Person reporting" }));
    expect(screen.getAllByText("Paper on Antigravity LLMs")).toHaveLength(2);
  });

  it("applies the date range in either grouping", () => {
    render(<MeetClient initialItems={[]} recentChanges={sampleChanges} />);
    fireEvent.change(screen.getByLabelText("Meeting Date To"), { target: { value: "2000-01-01" } });
    fireEvent.click(screen.getByRole("button", { name: "Type" }));
    expect(screen.getByText("No changes or news logged during the selected period.")).toBeInTheDocument();
    expect(screen.queryByText("Started draft")).not.toBeInTheDocument();
  });

  it("keeps reporters with the same name separate and supports missing reporters", () => {
    render(<MeetClient initialItems={[]} recentChanges={[
      sampleChanges[0],
      { ...sampleChanges[1], loggedBy: { name: "Alice Researcher", email: "other@example.com" } },
      { ...sampleChanges[0], id: "unknown", loggedBy: null },
    ]} />);
    expect(screen.getAllByRole("region", { name: "Alice Researcher" })).toHaveLength(2);
    expect(screen.getByRole("region", { name: "No reporter assigned" })).toBeInTheDocument();
  });

  it("identifies projects and scholarships and moves item editing into More", () => {
    render(<MeetClient initialItems={[]} recentChanges={[
      { ...sampleChanges[0], followUpItem: { ...sampleChanges[0].followUpItem, category: "PROJECT" } },
      { ...sampleChanges[1], followUpItem: { ...sampleChanges[1].followUpItem, category: "SCHOLARSHIP" } },
    ]} />);
    expect(screen.getByRole("heading", { name: "Projects" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Scholarships" })).toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: "Edit details" })).not.toBeInTheDocument();
    fireEvent.click(within(screen.getByRole("region", { name: "Alice Researcher" })).getByRole("button", { name: "Item actions" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Edit details" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("Edit Follow-Up Item");
    expect(screen.getByLabelText("Title")).toHaveValue("Paper on Antigravity LLMs");
  });

  it("orders items by type under a person and only shows populated type headings", () => {
    const project = { ...sampleChanges[0], id: "project-news", followUpItem: { ...sampleChanges[0].followUpItem, id: "project", category: "PROJECT" as const, title: "A project" } };
    const secondPublication = { ...sampleChanges[0], id: "other-news", followUpItem: { ...sampleChanges[0].followUpItem, id: "other-paper", title: "Another paper" } };
    render(<MeetClient initialItems={[]} recentChanges={[sampleChanges[0], project, secondPublication]} />);
    const person = screen.getByRole("region", { name: "Alice Researcher" });
    expect(within(person).getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual(["Publications", "Projects"]);
    expect(within(person).getAllByRole("article").map((a) => within(a).getByRole("heading").textContent)).toEqual(["Paper on Antigravity LLMs", "Another paper", "A project"]);
    const note = within(person).getAllByText("Started draft", { selector: "p" })[0];
    const row = note.closest("article")?.querySelector("time")?.parentElement;
    expect(row).toHaveStyle({ display: "grid" });
    expect(row).toContainElement(note);
    fireEvent.click(screen.getByRole("button", { name: "Type" }));
    expect(screen.queryByRole("heading", { level: 4 })).not.toBeInTheDocument();
  });

  it("avoids blank paragraphs and tall action buttons for notes without status changes", () => {
    const change = { ...sampleChanges[0], fromStatus: "IN_PROGRESS", notes: "Update without transition\n\n" };
    render(<MeetClient initialItems={[]} recentChanges={[change, { ...change, id: "next-note", notes: "Next update" }]} />);
    const article = screen.getByRole("article");
    const firstRow = article.querySelector("time")!.parentElement!;
    expect(firstRow.querySelectorAll("p")).toHaveLength(1);
    expect(firstRow).not.toHaveTextContent("→");
    expect(within(firstRow).getByRole("button", { name: "Note actions" })).toHaveStyle({ paddingTop: "0px", paddingBottom: "0px" });
    expect(screen.getByText("Next update")).toBeInTheDocument();
  });

  it("preserves note editing and adding news from the type view", async () => {
    render(<MeetClient initialItems={[]} recentChanges={[sampleChanges[0]]} />);
    fireEvent.click(screen.getByRole("button", { name: "Type" }));
    expect(screen.queryByRole("menuitem", { name: "Edit note" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Note actions" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Edit note" }));
    fireEvent.change(screen.getByLabelText("Progress news / update notes"), { target: { value: "Revised note" } });
    fireEvent.click(screen.getByRole("button", { name: "Save Notes" }));
    await waitFor(() => expect(updateFollowUpHistory).toHaveBeenCalledWith("hist-1", "Revised note"));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "+ Add News" }));
    fireEvent.change(screen.getByLabelText("Progress notes, news or meeting comments"), { target: { value: "Meeting decision" } });
    fireEvent.click(screen.getByRole("button", { name: "Confirm News" }));
    await waitFor(() => expect(updateFollowUpItemStatus).toHaveBeenCalledWith("item-1", "IN_PROGRESS", "Meeting decision"));
  });
});

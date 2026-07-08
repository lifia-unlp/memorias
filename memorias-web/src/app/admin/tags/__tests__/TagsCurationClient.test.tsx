import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TagsCurationClient } from "../TagsCurationClient";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("../actions", () => ({
  deleteTagGlobally: vi.fn(() => Promise.resolve({ success: true })),
  mergeTags: vi.fn(() => Promise.resolve({ success: true })),
  addSystemTag: vi.fn(() => Promise.resolve({ success: true })),
}));

vi.mock("../useAutoTagger", () => ({
  useAutoTagger: () => ({
    isOpenAIEnabled: false,
    checkingConfig: false,
    selectedModel: "gpt-4o-mini",
    setSelectedModel: vi.fn(),
    selectedTargets: ["publication"],
    setSelectedTargets: vi.fn(),
    selectedMode: "skip",
    setSelectedMode: vi.fn(),
    isAutoTagging: false,
    taggingProgress: null,
    handleRunAutoTagger: vi.fn(),
  }),
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------
import * as actions from "../actions";

const mockedDeleteTag = vi.mocked(actions.deleteTagGlobally);
const mockedMergeTags = vi.mocked(actions.mergeTags);
const mockedAddTag = vi.mocked(actions.addSystemTag);

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------
const sampleTags = [
  { tag: "machine-learning", count: 12 },
  { tag: "nlp", count: 7 },
  { tag: "computer-vision", count: 3 },
  { tag: "rare-tag", count: 1 },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const renderComponent = (tags = sampleTags) =>
  render(<TagsCurationClient initialTags={tags} />);

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("TagsCurationClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Rendering ──────────────────────────────────────────────────────────────

  it("renders all tags in the taxonomy table", () => {
    renderComponent();
    expect(screen.getByText("machine-learning")).toBeInTheDocument();
    expect(screen.getByText("nlp")).toBeInTheDocument();
    expect(screen.getByText("computer-vision")).toBeInTheDocument();
  });

  it("displays the correct total count of unique tags", () => {
    renderComponent();
    // Stats card shows total unique tags count
    expect(screen.getByText(String(sampleTags.length))).toBeInTheDocument();
  });

  it("displays the correct total classifications count", () => {
    renderComponent();
    const total = sampleTags.reduce((sum, t) => sum + t.count, 0);
    expect(screen.getByText(String(total))).toBeInTheDocument();
  });

  it("shows correct count of tags with 5+ uses", () => {
    renderComponent();
    const popularCount = sampleTags.filter((t) => t.count >= 5).length;
    // Two tags have ≥5: machine-learning (12), nlp (7)
    expect(popularCount).toBe(2);
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  // ── Search filter ──────────────────────────────────────────────────────────

  it("filters tag list based on search input", () => {
    renderComponent();
    const searchInput = screen.getByPlaceholderText("Search tags...");
    fireEvent.change(searchInput, { target: { value: "nlp" } });
    expect(screen.getByText("nlp")).toBeInTheDocument();
    expect(screen.queryByText("machine-learning")).not.toBeInTheDocument();
  });

  it("shows no-match message when search has no results", () => {
    renderComponent();
    const searchInput = screen.getByPlaceholderText("Search tags...");
    fireEvent.change(searchInput, { target: { value: "xyznonexistent" } });
    expect(
      screen.getByText(/No classifications found matching search filter/i)
    ).toBeInTheDocument();
  });

  it("restores all tags when search is cleared", () => {
    renderComponent();
    const searchInput = screen.getByPlaceholderText("Search tags...");
    fireEvent.change(searchInput, { target: { value: "nlp" } });
    fireEvent.change(searchInput, { target: { value: "" } });
    expect(screen.getByText("machine-learning")).toBeInTheDocument();
    expect(screen.getByText("nlp")).toBeInTheDocument();
  });

  // ── Add tag dialog ─────────────────────────────────────────────────────────

  it("opens the add tag dialog when 'Add Tag' button is clicked", () => {
    renderComponent();
    fireEvent.click(screen.getByRole("button", { name: /Add Tag/i }));
    // The dialog renders a form with the add tag input
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  // ── Rename dialog ──────────────────────────────────────────────────────────

  it("opens rename dialog with the correct tag pre-filled", () => {
    renderComponent();
    // Find the Rename button for 'nlp'
    const nlpRow = screen.getByText("nlp").closest("tr")!;
    const renameBtn = within(nlpRow).getByRole("button", { name: /Rename/i });
    fireEvent.click(renameBtn);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  // ── Merge dialog ───────────────────────────────────────────────────────────

  it("opens merge dialog when 'Merge' button is clicked", () => {
    renderComponent();
    const mlRow = screen.getByText("machine-learning").closest("tr")!;
    const mergeBtn = within(mlRow).getByRole("button", { name: /Merge/i });
    fireEvent.click(mergeBtn);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  // ── Delete action ──────────────────────────────────────────────────────────

  it("removes tag from list after successful deletion", async () => {
    mockedDeleteTag.mockResolvedValueOnce({ success: true });
    renderComponent();

    const rareRow = screen.getByText("rare-tag").closest("tr")!;
    const deleteBtn = within(rareRow).getByRole("button", { name: /Delete/i });
    fireEvent.click(deleteBtn);

    // Confirm in the dialog
    const dialog = screen.getByRole("dialog");
    const confirmBtn = within(dialog).getByRole("button", { name: /Delete/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(screen.queryByText("rare-tag")).not.toBeInTheDocument();
    });
    expect(mockedDeleteTag).toHaveBeenCalledWith("rare-tag");
  });

  // ── Add tag action ─────────────────────────────────────────────────────────

  it("adds a new tag to the list after successful submission", async () => {
    mockedAddTag.mockResolvedValueOnce({ success: true });
    renderComponent();

    fireEvent.click(screen.getByRole("button", { name: /Add Tag/i }));

    const dialog = screen.getByRole("dialog");
    const input = within(dialog).getByRole("textbox");
    fireEvent.change(input, { target: { value: "robotics" } });

    const submitBtn = within(dialog).getByRole("button", { name: /Add/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockedAddTag).toHaveBeenCalledWith("robotics");
    });
    await waitFor(() => {
      expect(screen.getByText("robotics")).toBeInTheDocument();
    });
  });

  // ── Rename (merge) action ──────────────────────────────────────────────────

  it("renames a tag locally after successful merge call", async () => {
    mockedMergeTags.mockResolvedValueOnce({ success: true });
    renderComponent();

    const nlpRow = screen.getByText("nlp").closest("tr")!;
    fireEvent.click(within(nlpRow).getByRole("button", { name: /Rename/i }));

    const dialog = screen.getByRole("dialog");
    const input = within(dialog).getByRole("textbox");
    // Clear current value and type new name
    fireEvent.change(input, { target: { value: "natural-language-processing" } });

    const submitBtn = within(dialog).getByRole("button", { name: /Save|Rename/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockedMergeTags).toHaveBeenCalledWith("nlp", "natural-language-processing");
    });
    await waitFor(() => {
      expect(screen.queryByText("nlp")).not.toBeInTheDocument();
      expect(screen.getByText("natural-language-processing")).toBeInTheDocument();
    });
  });
});

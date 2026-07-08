import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { PublicationForm } from "../PublicationForm";
import * as actions from "../actions";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock publication actions
vi.mock("../actions", () => ({
  resolveDoiAction: vi.fn(() =>
    Promise.resolve({
      success: true,
      data: {
        title: "DOI Article Title",
        authors: "Author A and Author B",
        year: 2025,
        type: "article",
        ranking: "Q1",
        citationKey: "doi2025",
        entryTags: { journal: "IEEE Transactions", volume: "12" },
      },
    })
  ),
  parseBibtex: vi.fn(() =>
    Promise.resolve({
      success: true,
      data: {
        title: "BibTeX Article Title",
        authors: "Author X and Author Y",
        year: 2024,
        type: "article",
        ranking: "Q2",
        citationKey: "bib2024",
        entryTags: { journal: "ACM Computing Surveys", volume: "56" },
      },
    })
  ),
  createPublication: vi.fn(() => Promise.resolve({ success: true, slug: "created-pub" })),
  updatePublication: vi.fn(() => Promise.resolve({ success: true, slug: "updated-pub" })),
}));

// Mock components
vi.mock("@/components/TagWidget", () => ({
  TagWidget: () => <div data-testid="tag-widget">Tag Widget</div>,
}));

vi.mock("@/components/reusable/MemberSelector", () => ({
  MemberSelector: () => <div data-testid="member-selector">Member Selector</div>,
}));

vi.mock("@/components/reusable/ProjectSelector", () => ({
  ProjectSelector: () => <div data-testid="project-selector">Project Selector</div>,
}));

vi.mock("@/components/reusable/ThesisSelector", () => ({
  ThesisSelector: () => <div data-testid="thesis-selector">Thesis Selector</div>,
}));

describe("PublicationForm Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the selection wizard screen by default for new publications", () => {
    render(<PublicationForm members={[]} projects={[]} theses={[]} />);

    expect(screen.getByText(/How would you like to add the publication/i)).toBeInTheDocument();
    expect(screen.getByText("Import with DOI")).toBeInTheDocument();
    expect(screen.getByText("Parse from BibTeX")).toBeInTheDocument();
    expect(screen.getByText("Add Manually")).toBeInTheDocument();
  });

  it("transitions to DOI lookup and resolves DOI successfully to populate the form", async () => {
    render(<PublicationForm members={[]} projects={[]} theses={[]} />);

    // Click Import with DOI card
    const doiCard = screen.getByText("Import with DOI").closest("div");
    if (doiCard) fireEvent.click(doiCard);

    expect(screen.getByLabelText(/DOI Reference/i)).toBeInTheDocument();

    // Fill in a DOI
    fireEvent.change(screen.getByLabelText(/DOI Reference/i), {
      target: { value: "10.1007/12345" },
    });

    const resolveBtn = screen.getByRole("button", { name: "Resolve and Pre-fill Form" });
    fireEvent.click(resolveBtn);

    await waitFor(() => {
      expect(actions.resolveDoiAction).toHaveBeenCalledWith("10.1007/12345");
      // Expect it to transition into form and pre-fill values
      expect(screen.getByLabelText(/Publication Title/i)).toHaveValue("DOI Article Title");
      expect(screen.getByLabelText(/Authors/i)).toHaveValue("Author A and Author B");
      expect(screen.getByLabelText(/Publication Year/i)).toHaveValue(2025);
    });
  });

  it("transitions to BibTeX lookup and parses citation successfully to populate the form", async () => {
    render(<PublicationForm members={[]} projects={[]} theses={[]} />);

    // Click BibTeX card
    const bibtexCard = screen.getByText("Parse from BibTeX").closest("div");
    if (bibtexCard) fireEvent.click(bibtexCard);

    expect(screen.getByLabelText(/BibTeX Source Code/i)).toBeInTheDocument();

    // Fill in BibTeX source
    fireEvent.change(screen.getByLabelText(/BibTeX Source Code/i), {
      target: { value: "@article{somekey, title={Hello}}" },
    });

    const parseBtn = screen.getByRole("button", { name: "Parse and Pre-fill Form" });
    fireEvent.click(parseBtn);

    await waitFor(() => {
      expect(actions.parseBibtex).toHaveBeenCalledWith("@article{somekey, title={Hello}}");
      // Expect it to transition to form
      expect(screen.getByLabelText(/Publication Title/i)).toHaveValue("BibTeX Article Title");
      expect(screen.getByLabelText(/Authors/i)).toHaveValue("Author X and Author Y");
      expect(screen.getByLabelText(/Publication Year/i)).toHaveValue(2024);
    });
  });

  it("submits the form successfully and creates publication", async () => {
    render(<PublicationForm members={[]} projects={[]} theses={[]} />);

    // Go straight to manual form
    const manualCard = screen.getByText("Add Manually").closest("div");
    if (manualCard) fireEvent.click(manualCard);

    // Pre-fill mandatory elements
    fireEvent.change(screen.getByLabelText(/Publication Title/i), {
      target: { value: "Manual Title" },
    });
    fireEvent.change(screen.getByLabelText(/Authors/i), {
      target: { value: "A. Author and B. Writer" },
    });
    fireEvent.change(screen.getByLabelText(/Publication Year/i), {
      target: { value: "2026" },
    });

    // For type: article, required fields in custom tags are journal and volume
    fireEvent.change(screen.getByLabelText(/journal \*/i), {
      target: { value: "Journal of Testing" },
    });
    fireEvent.change(screen.getByLabelText(/volume \*/i), {
      target: { value: "10" },
    });

    const titleInput = screen.getByLabelText(/Publication Title/i);
    const form = titleInput.closest("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(actions.createPublication).toHaveBeenCalled();
    });
  });

  it("shows validation error if a type-specific required field is missing", async () => {
    render(<PublicationForm members={[]} projects={[]} theses={[]} />);

    // Go straight to manual form
    const manualCard = screen.getByText("Add Manually").closest("div");
    if (manualCard) fireEvent.click(manualCard);

    // Pre-fill mandatory elements but miss journal & volume
    fireEvent.change(screen.getByLabelText(/Publication Title/i), {
      target: { value: "Manual Title" },
    });
    fireEvent.change(screen.getByLabelText(/Authors/i), {
      target: { value: "A. Author and B. Writer" },
    });
    fireEvent.change(screen.getByLabelText(/Publication Year/i), {
      target: { value: "2026" },
    });

    const titleInput = screen.getByLabelText(/Publication Title/i);
    const form = titleInput.closest("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/"journal" is a required field for publication type "Article \(Journal \/ Magazine\)"./i)).toBeInTheDocument();
    });
  });
});


import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ThesisForm } from "../ThesisForm";
import * as actions from "../actions";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock server actions
vi.mock("../actions", () => ({
  createThesis: vi.fn(() => Promise.resolve({ success: true })),
  updateThesis: vi.fn(() => Promise.resolve({ success: true })),
}));

// Mock widgets
vi.mock("@/components/TagWidget", () => ({
  TagWidget: () => <div data-testid="tag-widget">Tag Widget</div>,
}));
vi.mock("@/components/reusable/MemberSelector", () => ({
  MemberSelector: () => <div data-testid="member-selector">Member Selector</div>,
}));
vi.mock("@/components/reusable/ProjectSelector", () => ({
  ProjectSelector: () => <div data-testid="project-selector">Project Selector</div>,
}));
vi.mock("@/components/reusable/ScholarshipSelector", () => ({
  ScholarshipSelector: () => <div data-testid="scholarship-selector">Scholarship Selector</div>,
}));
vi.mock("@/components/reusable/PublicationSelector", () => ({
  PublicationSelector: () => <div data-testid="publication-selector">Publication Selector</div>,
}));

describe("ThesisForm Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly with empty initial state (creation mode)", () => {
    render(<ThesisForm members={[]} projects={[]} publications={[]} levels={["Doctorado", "Maestria"]} />);

    expect(screen.getByLabelText(/Thesis Title/i)).toHaveValue("");
    expect(screen.getByLabelText(/SEO Slug/i)).toHaveValue("");
    expect(screen.getByText("Auto-Generated")).toBeInTheDocument();
  });

  it("renders prefilled initial data (edit mode)", () => {
    const initialData = {
      id: "thesis-1",
      title: "Semantic Web Thesis",
      slug: "semantic-web-thesis",
      featured: true,
      student: "Alice Smith",
      level: "Doctorado",
    };
    render(
      <ThesisForm
        initialData={initialData}
        members={[]}
        projects={[]}
        publications={[]}
        levels={["Doctorado", "Maestria"]}
      />
    );

    expect(screen.getByLabelText(/Thesis Title/i)).toHaveValue("Semantic Web Thesis");
    expect(screen.getByLabelText(/SEO Slug/i)).toHaveValue("semantic-web-thesis");
    expect(screen.getByLabelText(/Student Name/i)).toHaveValue("Alice Smith");
    expect(screen.getByText("Reset Auto")).toBeInTheDocument();
  });

  it("automatically generates slug from Title changes", () => {
    render(<ThesisForm members={[]} projects={[]} publications={[]} levels={["Doctorado"]} />);

    const titleInput = screen.getByLabelText(/Thesis Title/i);
    const slugInput = screen.getByLabelText(/SEO Slug/i);

    fireEvent.change(titleInput, { target: { value: "New Thesis Title" } });
    expect(slugInput).toHaveValue("new-thesis-title");
  });

  it("stops auto-generating slug if user manually overrides it, and resets when Reset Auto is clicked", () => {
    render(<ThesisForm members={[]} projects={[]} publications={[]} levels={["Doctorado"]} />);

    const titleInput = screen.getByLabelText(/Thesis Title/i);
    const slugInput = screen.getByLabelText(/SEO Slug/i);

    fireEvent.change(titleInput, { target: { value: "New Thesis Title" } });
    expect(slugInput).toHaveValue("new-thesis-title");

    // Override slug manually
    fireEvent.change(slugInput, { target: { value: "custom-slug-value" } });
    expect(screen.getByText("Reset Auto")).toBeInTheDocument();

    // Change title and verify it does NOT auto-update anymore
    fireEvent.change(titleInput, { target: { value: "Another Thesis Title" } });
    expect(slugInput).toHaveValue("custom-slug-value");

    // Click reset auto and verify it generates another-thesis-title
    const resetBtn = screen.getByRole("button", { name: "Reset Auto" });
    fireEvent.click(resetBtn);
    expect(slugInput).toHaveValue("another-thesis-title");
  });

  it("submits the form correctly calling createThesis", async () => {
    render(<ThesisForm members={[]} projects={[]} publications={[]} levels={["Doctorado"]} />);

    fireEvent.change(screen.getByLabelText(/Thesis Title/i), { target: { value: "Final Thesis" } });

    const titleInput = screen.getByLabelText(/Thesis Title/i);
    const form = titleInput.closest("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(actions.createThesis).toHaveBeenCalled();
    });
  });
});

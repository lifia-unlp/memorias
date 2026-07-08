import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ScholarshipForm } from "../ScholarshipForm";
import * as actions from "../actions";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock server actions
vi.mock("../actions", () => ({
  createScholarship: vi.fn(() => Promise.resolve({ success: true })),
  updateScholarship: vi.fn(() => Promise.resolve({ success: true })),
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
vi.mock("@/components/reusable/ThesisSelector", () => ({
  ThesisSelector: () => <div data-testid="thesis-selector">Thesis Selector</div>,
}));

describe("ScholarshipForm Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly with empty initial state (creation mode)", () => {
    render(<ScholarshipForm members={[]} projects={[]} types={["Doctoral", "Postdoctoral"]} />);

    expect(screen.getByLabelText(/Scholarship Title/i)).toHaveValue("");
    expect(screen.getByLabelText(/SEO Slug/i)).toHaveValue("");
    expect(screen.getByText("Auto-Generated")).toBeInTheDocument();
  });

  it("renders prefilled initial data (edit mode)", () => {
    const initialData = {
      id: "schol-1",
      title: "HCI Doctoral Scholarship",
      slug: "hci-doctoral-scholarship",
      student: "Alice Smith",
      type: "Doctoral",
      fundingAgency: "CONICET",
    };
    render(
      <ScholarshipForm
        initialData={initialData}
        members={[]}
        projects={[]}
        types={["Doctoral", "Postdoctoral"]}
      />
    );

    expect(screen.getByLabelText(/Scholarship Title/i)).toHaveValue("HCI Doctoral Scholarship");
    expect(screen.getByLabelText(/SEO Slug/i)).toHaveValue("hci-doctoral-scholarship");
    expect(screen.getByLabelText(/Student Name/i)).toHaveValue("Alice Smith");
    expect(screen.getByLabelText(/Funding Agency/i)).toHaveValue("CONICET");
    expect(screen.getByText("Reset Auto")).toBeInTheDocument();
  });

  it("automatically generates slug from Title changes", () => {
    render(<ScholarshipForm members={[]} projects={[]} types={["Doctoral"]} />);

    const titleInput = screen.getByLabelText(/Scholarship Title/i);
    const slugInput = screen.getByLabelText(/SEO Slug/i);

    fireEvent.change(titleInput, { target: { value: "New Scholarship Title" } });
    expect(slugInput).toHaveValue("new-scholarship-title");
  });

  it("stops auto-generating slug if user manually overrides it, and resets when Reset Auto is clicked", () => {
    render(<ScholarshipForm members={[]} projects={[]} types={["Doctoral"]} />);

    const titleInput = screen.getByLabelText(/Scholarship Title/i);
    const slugInput = screen.getByLabelText(/SEO Slug/i);

    fireEvent.change(titleInput, { target: { value: "New Scholarship Title" } });
    expect(slugInput).toHaveValue("new-scholarship-title");

    // Override manually
    fireEvent.change(slugInput, { target: { value: "custom-slug-value" } });
    expect(screen.getByText("Reset Auto")).toBeInTheDocument();

    // Change title and check it does not auto-update anymore
    fireEvent.change(titleInput, { target: { value: "Another Scholarship" } });
    expect(slugInput).toHaveValue("custom-slug-value");

    // Click reset auto and verify it generates another-scholarship
    const resetBtn = screen.getByRole("button", { name: "Reset Auto" });
    fireEvent.click(resetBtn);
    expect(slugInput).toHaveValue("another-scholarship");
  });

  it("submits the form correctly calling createScholarship", async () => {
    render(<ScholarshipForm members={[]} projects={[]} types={["Doctoral"]} />);

    fireEvent.change(screen.getByLabelText(/Scholarship Title/i), { target: { value: "Final Scholarship" } });

    const titleInput = screen.getByLabelText(/Scholarship Title/i);
    const form = titleInput.closest("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(actions.createScholarship).toHaveBeenCalled();
    });
  });
});

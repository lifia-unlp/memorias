import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProjectForm } from "../ProjectForm";
import * as actions from "../actions";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock server actions
vi.mock("../actions", () => ({
  createProject: vi.fn(() => Promise.resolve({ success: true })),
  updateProject: vi.fn(() => Promise.resolve({ success: true })),
}));

// Mock widgets
vi.mock("@/components/TagWidget", () => ({
  TagWidget: () => <div data-testid="tag-widget">Tag Widget</div>,
}));
vi.mock("@/components/reusable/MemberSelector", () => ({
  MemberSelector: () => <div data-testid="member-selector">Member Selector</div>,
}));

describe("ProjectForm Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly with empty initial state (creation mode)", () => {
    render(<ProjectForm members={[]} />);

    expect(screen.getByLabelText(/Project Title/i)).toHaveValue("");
    expect(screen.getByLabelText(/SEO Slug/i)).toHaveValue("");
    expect(screen.getByText("Auto-Generated")).toBeInTheDocument();
  });

  it("renders prefilled initial data (edit mode)", () => {
    const initialData = {
      id: "proj-1",
      title: "Knowledge Systems Lab",
      slug: "knowledge-systems-lab",
      code: "I110",
      responsibleGroup: "LIFIA",
      startDate: "2020-01-01T00:00:00.000Z",
      endDate: "2024-12-31T00:00:00.000Z",
    };
    render(<ProjectForm initialData={initialData} members={[]} />);

    expect(screen.getByLabelText(/Project Title/i)).toHaveValue("Knowledge Systems Lab");
    expect(screen.getByLabelText(/SEO Slug/i)).toHaveValue("knowledge-systems-lab");
    expect(screen.getByLabelText(/Project Code/i)).toHaveValue("I110");
    expect(screen.getByLabelText(/Responsible Group/i)).toHaveValue("LIFIA");
    expect(screen.getByText("Reset Auto")).toBeInTheDocument();
  });

  it("automatically generates slug from Title changes", () => {
    render(<ProjectForm members={[]} />);

    const titleInput = screen.getByLabelText(/Project Title/i);
    const slugInput = screen.getByLabelText(/SEO Slug/i);

    fireEvent.change(titleInput, { target: { value: "New Project Title" } });
    expect(slugInput).toHaveValue("new-project-title");
  });

  it("stops auto-generating slug if user manually overrides it, and resets when Reset Auto is clicked", () => {
    render(<ProjectForm members={[]} />);

    const titleInput = screen.getByLabelText(/Project Title/i);
    const slugInput = screen.getByLabelText(/SEO Slug/i);

    fireEvent.change(titleInput, { target: { value: "New Project Title" } });
    expect(slugInput).toHaveValue("new-project-title");

    // Override manually
    fireEvent.change(slugInput, { target: { value: "custom-slug-value" } });
    expect(screen.getByText("Reset Auto")).toBeInTheDocument();

    // Change title and check it does not auto-update anymore
    fireEvent.change(titleInput, { target: { value: "Another Project" } });
    expect(slugInput).toHaveValue("custom-slug-value");

    // Click reset auto and verify it generates another-project
    const resetBtn = screen.getByRole("button", { name: "Reset Auto" });
    fireEvent.click(resetBtn);
    expect(slugInput).toHaveValue("another-project");
  });

  it("submits the form correctly calling createProject", async () => {
    render(<ProjectForm members={[]} />);

    fireEvent.change(screen.getByLabelText(/Project Title/i), { target: { value: "Final Project" } });

    const titleInput = screen.getByLabelText(/Project Title/i);
    const form = titleInput.closest("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(actions.createProject).toHaveBeenCalled();
    });
  });
});

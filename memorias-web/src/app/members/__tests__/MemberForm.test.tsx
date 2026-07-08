import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemberForm } from "../MemberForm";
import * as actions from "../actions";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock member server actions
vi.mock("../actions", () => ({
  createMember: vi.fn(() => Promise.resolve({ success: true })),
  updateMember: vi.fn(() => Promise.resolve({ success: true })),
}));

// Mock components that we don't want to test in-depth here
vi.mock("@/components/TagWidget", () => ({
  TagWidget: () => <div data-testid="tag-widget">Tag Widget</div>,
}));

vi.mock("@/components/AcmCcsSelector", () => ({
  AcmCcsSelector: ({ onChange }: { onChange: (newVal: string) => void }) => (
    <button
      data-testid="acm-selector"
      onClick={() => onChange(JSON.stringify(["12345"]))}
    >
      Select 12345
    </button>
  ),
}));

// Mock acm-ccs-utils getAcmCcsPath
vi.mock("@/lib/acm-ccs-utils", () => ({
  getAcmCcsPath: (id: string) => ["Computer systems organization", `Path ${id}`],
}));

describe("MemberForm Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly with empty initial state (creation mode)", () => {
    render(<MemberForm systemOptions={[]} />);

    expect(screen.getByLabelText(/First Name/i)).toHaveValue("");
    expect(screen.getByLabelText(/Last Name/i)).toHaveValue("");
    expect(screen.getByLabelText(/SEO Slug/i)).toHaveValue("");
    expect(screen.getByText("Auto-Generated")).toBeInTheDocument();
  });

  it("renders prefilled initial data (edit mode)", () => {
    const initialData = {
      id: "abc-123",
      firstName: "Carlos",
      lastName: "Mendoza",
      slug: "carlos-mendoza",
      positionAtLab: "Researcher",
      interestsInEnglish: '["12345"]',
    };
    render(<MemberForm initialData={initialData} systemOptions={[]} />);

    expect(screen.getByLabelText(/First Name/i)).toHaveValue("Carlos");
    expect(screen.getByLabelText(/Last Name/i)).toHaveValue("Mendoza");
    expect(screen.getByLabelText(/SEO Slug/i)).toHaveValue("carlos-mendoza");
    expect(screen.getByText("Reset Auto")).toBeInTheDocument();
  });

  it("automatically generates slug from First Name and Last Name changes", () => {
    render(<MemberForm systemOptions={[]} />);

    const firstNameInput = screen.getByLabelText(/First Name/i);
    const lastNameInput = screen.getByLabelText(/Last Name/i);
    const slugInput = screen.getByLabelText(/SEO Slug/i);

    fireEvent.change(firstNameInput, { target: { value: "Juan" } });
    fireEvent.change(lastNameInput, { target: { value: "Perez" } });

    expect(slugInput).toHaveValue("juan-perez");
  });

  it("stops auto-generating slug if user manually overrides it, and resets when Reset Auto is clicked", () => {
    render(<MemberForm systemOptions={[]} />);

    const firstNameInput = screen.getByLabelText(/First Name/i);
    const lastNameInput = screen.getByLabelText(/Last Name/i);
    const slugInput = screen.getByLabelText(/SEO Slug/i);

    fireEvent.change(firstNameInput, { target: { value: "Juan" } });
    fireEvent.change(lastNameInput, { target: { value: "Perez" } });
    expect(slugInput).toHaveValue("juan-perez");

    // Manually override the slug
    fireEvent.change(slugInput, { target: { value: "custom-slug-value" } });
    expect(screen.getByText("Reset Auto")).toBeInTheDocument();

    // Change first name and ensure slug does NOT auto-update anymore
    fireEvent.change(firstNameInput, { target: { value: "Mario" } });
    expect(slugInput).toHaveValue("custom-slug-value");

    // Click reset auto and verify it generates Mario Perez
    const resetBtn = screen.getByRole("button", { name: "Reset Auto" });
    fireEvent.click(resetBtn);
    expect(slugInput).toHaveValue("mario-perez");
  });

  it("submits the creation form correctly, calling createMember server action", async () => {
    render(<MemberForm systemOptions={[]} />);

    fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: "Juan" } });
    fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: "Perez" } });

    const submitBtn = screen.getByRole("button", { name: /Create Profile/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(actions.createMember).toHaveBeenCalled();
    });
  });

  it("displays legacy text interests warning if interestsInEnglish is plain text and not JSON array", () => {
    const legacyData = {
      id: "abc-123",
      firstName: "Carlos",
      lastName: "Mendoza",
      slug: "carlos-mendoza",
      interestsInEnglish: "Semantic Web, Machine Learning",
    };
    render(<MemberForm initialData={legacyData} systemOptions={[]} />);

    expect(screen.getByText(/Legacy Text Interests Found/i)).toBeInTheDocument();
    expect(screen.getByText(/"Semantic Web, Machine Learning"/i)).toBeInTheDocument();
  });
});

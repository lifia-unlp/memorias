import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemberSelector } from "../MemberSelector";

const mockMembers = [
  { id: "1", firstName: "Alice", lastName: "Smith", positionAtLab: "PhD Student", endDate: null },
  { id: "2", firstName: "John", lastName: "Doe", positionAtLab: "Researcher", endDate: "2020-12-31" }, // Former
  { id: "3", firstName: "Bob", lastName: "Smith", positionAtLab: "Postdoc", endDate: null },
  { id: "4", firstName: "Jane", lastName: "Doe", positionAtLab: "Director", endDate: "2028-12-31" }, // Future (Active)
];

describe("MemberSelector Component", () => {
  it("renders correctly in grid layout and applies default Hide Former filter (hiding Doe, John)", () => {
    const onChange = vi.fn();
    render(<MemberSelector items={mockMembers} selectedIds={[]} onChange={onChange} layout="grid" />);

    // Doe, John is former (endDate in the past) and not selected, so he should be hidden by default
    expect(screen.queryByText("John Doe")).not.toBeInTheDocument();

    // Active or future members should be visible
    expect(screen.getByText("Alice Smith")).toBeInTheDocument();
    expect(screen.getByText("Bob Smith")).toBeInTheDocument();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
  });

  it("sorts members alphabetically by lastName, then by firstName", () => {
    const onChange = vi.fn();
    render(<MemberSelector items={mockMembers} selectedIds={[]} onChange={onChange} layout="grid" />);

    // When hideFormer is active, visible members are: Jane Doe, Alice Smith, Bob Smith
    const names = screen.getAllByRole("heading", { level: 6 })
      .map((el) => el.textContent?.trim())
      .filter((t) => t !== "Involved Lab Members");
    // Jane Doe (D), Alice Smith (S - A), Bob Smith (S - B)
    expect(names).toEqual(["Jane Doe", "Alice Smith", "Bob Smith"]);
  });

  it("shows former members when 'Hide former members' checkbox is unchecked", () => {
    const onChange = vi.fn();
    render(<MemberSelector items={mockMembers} selectedIds={[]} onChange={onChange} layout="grid" />);

    const checkbox = screen.getByLabelText("Hide former members");
    expect(checkbox).toBeChecked(); // Default state is checked

    // Uncheck it
    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();

    // Now John Doe should be visible
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("UX Guard: always shows selected former members even when Hide Former is checked", () => {
    const onChange = vi.fn();
    // John Doe (id: 2) is a former member but is selected
    render(<MemberSelector items={mockMembers} selectedIds={["2"]} onChange={onChange} layout="grid" />);

    // John Doe should be visible because he is selected, despite being a former member and hideFormer being checked
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("filters members based on search query input", () => {
    const onChange = vi.fn();
    render(<MemberSelector items={mockMembers} selectedIds={[]} onChange={onChange} layout="grid" />);

    const searchInput = screen.getByPlaceholderText("Search members...");
    fireEvent.change(searchInput, { target: { value: "Jane" } });

    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.queryByText("Alice Smith")).not.toBeInTheDocument();
    expect(screen.queryByText("Bob Smith")).not.toBeInTheDocument();
  });

  it("invokes onChange callback when toggling checkbox list items", () => {
    const onChange = vi.fn();
    render(<MemberSelector items={mockMembers} selectedIds={[]} onChange={onChange} layout="grid" />);

    // Click on Alice Smith box container
    const aliceContainer = screen.getByText("Alice Smith").closest("div[role='button']") || screen.getByText("Alice Smith").closest("div");
    if (aliceContainer) {
      fireEvent.click(aliceContainer);
    }
    expect(onChange).toHaveBeenCalledWith(["1"]);
  });

  it("renders correctly in list layout", () => {
    const onChange = vi.fn();
    render(<MemberSelector items={mockMembers} selectedIds={[]} onChange={onChange} layout="list" />);

    // Check title in list layout card
    expect(screen.getByText("Involved Lab Members")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search researchers...")).toBeInTheDocument();
  });
});

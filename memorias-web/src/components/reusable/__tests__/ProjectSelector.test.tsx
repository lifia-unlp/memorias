import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ProjectSelector } from "../ProjectSelector";

const mockProjects = [
  { id: "1", title: "Alpha Project", code: "P-01", director: "Dr. Green", coDirector: "Dr. Blue", startDate: "2024-01-01T12:00:00", endDate: "2026-12-31T12:00:00" },
  { id: "2", title: "Beta Project", code: "P-02", director: "Dr. Yellow", coDirector: null, startDate: "2023-01-01T12:00:00", endDate: "2025-12-31T12:00:00" },
  { id: "3", title: "Gamma Project", code: "P-03", director: "Dr. Red", coDirector: null, startDate: "2024-06-01T12:00:00", endDate: "2026-12-31T12:00:00" }, // Same end-date as Alpha, later start-date
];

describe("ProjectSelector Component", () => {
  it("renders correctly in grid layout and displays director, co-director, code, and timeline info", () => {
    const onChange = vi.fn();
    render(<ProjectSelector items={mockProjects} selectedIds={[]} onChange={onChange} layout="grid" />);

    expect(screen.getByText("Alpha Project")).toBeInTheDocument();
    // Director and Co-director text
    expect(screen.getByText(/Dir: Dr. Green \/ Co-Dir: Dr. Blue/)).toBeInTheDocument();
    // Timeline text (e.g. Jan 2024 - Dec 2026 or Dec 2023 - Dec 2026 depending on timezone localization)
    expect(screen.getAllByText(/\w{3} \d{4} - \w{3} \d{4}/).length).toBe(3);
    
    // Slug should not be rendered anywhere
    expect(screen.queryByText(/Slug:/)).not.toBeInTheDocument();
  });

  it("sorts projects descending by end date, then by start date", () => {
    const onChange = vi.fn();
    render(<ProjectSelector items={mockProjects} selectedIds={[]} onChange={onChange} layout="grid" />);

    const titles = screen.getAllByRole("heading", { level: 6 })
      .map((el) => el.textContent?.trim())
      .filter((t) => t !== "Related Projects");
    // Sorting:
    // 1. Gamma Project (end: 2026-12-31, start: 2024-06-01) -> newer start date than Alpha (2024-01-01)
    // 2. Alpha Project (end: 2026-12-31, start: 2024-01-01)
    // 3. Beta Project (end: 2025-12-31, start: 2023-01-01)
    expect(titles).toEqual(["Gamma Project", "Alpha Project", "Beta Project"]);
  });

  it("filters projects based on search query", () => {
    const onChange = vi.fn();
    render(<ProjectSelector items={mockProjects} selectedIds={[]} onChange={onChange} layout="grid" />);

    const searchInput = screen.getByPlaceholderText("Search projects...");
    fireEvent.change(searchInput, { target: { value: "Beta" } });

    expect(screen.getByText("Beta Project")).toBeInTheDocument();
    expect(screen.queryByText("Alpha Project")).not.toBeInTheDocument();
    expect(screen.queryByText("Gamma Project")).not.toBeInTheDocument();
  });

  it("renders correctly in list layout", () => {
    const onChange = vi.fn();
    render(<ProjectSelector items={mockProjects} selectedIds={[]} onChange={onChange} layout="list" />);

    expect(screen.getByText("Related Projects")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search projects...")).toBeInTheDocument();
    // Primary list text combines code and title
    expect(screen.getByText("[P-01] Alpha Project")).toBeInTheDocument();
  });
});

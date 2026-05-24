import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { PublicationSelector } from "../PublicationSelector";

const mockPublications = [
  {
    id: "1",
    title: "Deep Learning in Practice",
    type: "article",
    authors: "Smith, A. and Doe, J.",
    year: 2024,
    bibtexData: {
      entryType: "article",
      entryTags: {
        author: "Smith, A. and Doe, J.",
        title: "Deep Learning in Practice",
        journal: "Journal of AI Research",
        year: "2024",
        volume: "10",
        pages: "100-120",
      },
    },
  },
  {
    id: "2",
    title: "Introduction to Neural Networks",
    type: "book",
    authors: "Smith, A.",
    year: 2022,
    bibtexData: {
      entryType: "book",
      entryTags: {
        author: "Smith, A.",
        title: "Introduction to Neural Networks",
        publisher: "Science Press",
        year: "2022",
      },
    },
  },
  {
    id: "3",
    title: "Advanced Cognitive Computing",
    type: "inproceedings",
    authors: "Doe, J. and Johnson, R.",
    year: 2025,
    bibtexData: {
      entryType: "inproceedings",
      entryTags: {
        author: "Doe, J. and Johnson, R.",
        title: "Advanced Cognitive Computing",
        booktitle: "IEEE Conference on AI",
        year: "2025",
        pages: "10-25",
      },
    },
  },
];

describe("PublicationSelector Component", () => {
  it("renders correctly in grid layout and formats title as bold APA citation", () => {
    const onChange = vi.fn();
    render(<PublicationSelector items={mockPublications} selectedIds={[]} onChange={onChange} layout="grid" />);

    // Renders the citation text
    expect(screen.getByText(/Smith, A. & Doe, J. \(2024\)./)).toBeInTheDocument();
    
    // Renders title inside a strong (bold) element
    const boldElements = screen.getAllByText("Deep Learning in Practice");
    expect(boldElements[0].tagName).toBe("STRONG");
  });

  it("sorts publications descending by year", () => {
    const onChange = vi.fn();
    render(<PublicationSelector items={mockPublications} selectedIds={[]} onChange={onChange} layout="grid" />);

    // In grid layout, each item container renders the citation
    const items = screen.getAllByRole("checkbox").map((chk) => {
      const container = chk.closest("div")?.parentElement;
      return container?.textContent || "";
    });

    // Sorting order by year:
    // 1. Advanced Cognitive Computing (2025)
    // 2. Deep Learning in Practice (2024)
    // 3. Introduction to Neural Networks (2022)
    expect(items[0]).toContain("Advanced Cognitive Computing");
    expect(items[1]).toContain("Deep Learning in Practice");
    expect(items[2]).toContain("Introduction to Neural Networks");
  });

  it("filters publications based on search query", () => {
    const onChange = vi.fn();
    render(<PublicationSelector items={mockPublications} selectedIds={[]} onChange={onChange} layout="grid" />);

    const searchInput = screen.getByPlaceholderText("Search publications...");
    fireEvent.change(searchInput, { target: { value: "Neural" } });

    expect(screen.getByText(/Introduction to Neural Networks/)).toBeInTheDocument();
    expect(screen.queryByText(/Deep Learning in Practice/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Advanced Cognitive Computing/)).not.toBeInTheDocument();
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
vi.mock("../actions", () => ({
  deleteTagGlobally: vi.fn(),
  mergeTags: vi.fn(),
  addSystemTag: vi.fn(),
}));

vi.mock("../useAutoTagger", () => ({
  useAutoTagger: vi.fn(() => ({
    isOpenAIEnabled: false,
    checkingConfig: false,
    selectedModel: "gpt-4o-mini",
    setSelectedModel: vi.fn(),
    selectedTargets: [],
    setSelectedTargets: vi.fn(),
    selectedMode: "skip",
    setSelectedMode: vi.fn(),
    isAutoTagging: false,
    taggingProgress: null,
    handleRunAutoTagger: vi.fn(),
  })),
}));

import { useTagsCuration } from "../useTagsCuration";
import { deleteTagGlobally, mergeTags, addSystemTag } from "../actions";

const mockedDeleteTag = vi.mocked(deleteTagGlobally);
const mockedMergeTags = vi.mocked(mergeTags);
const mockedAddSystemTag = vi.mocked(addSystemTag);

describe("useTagsCuration hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes tags list and filters them based on searchQuery", () => {
    const initial = [
      { tag: "javascript", count: 10 },
      { tag: "python", count: 5 },
    ];
    const { result } = renderHook(() => useTagsCuration({ initialTags: initial }));

    expect(result.current.tags).toEqual(initial);
    expect(result.current.filteredTags).toEqual(initial);

    act(() => {
      result.current.setSearchQuery("py");
    });

    expect(result.current.filteredTags).toEqual([{ tag: "python", count: 5 }]);
  });

  it("adds a system tag globally and updates the local state on success", async () => {
    mockedAddSystemTag.mockResolvedValueOnce({ success: true });
    const { result } = renderHook(() => useTagsCuration({ initialTags: [] }));

    act(() => {
      result.current.setAddTagValue("ruby");
    });

    await act(async () => {
      result.current.handleAddSubmit({ preventDefault: vi.fn() } as any);
    });

    expect(mockedAddSystemTag).toHaveBeenCalledWith("ruby");
    expect(result.current.tags).toEqual([{ tag: "ruby", count: 0 }]);
  });

  it("deletes a tag globally and updates the local state on success", async () => {
    mockedDeleteTag.mockResolvedValueOnce({ success: true });
    const { result } = renderHook(() =>
      useTagsCuration({
        initialTags: [{ tag: "rust", count: 3 }],
      })
    );

    await act(async () => {
      result.current.handleDelete("rust");
    });

    expect(mockedDeleteTag).toHaveBeenCalledWith("rust");
    expect(result.current.tags).toEqual([]);
  });

  it("renames a tag by calling mergeTags globally and updating local state", async () => {
    mockedMergeTags.mockResolvedValueOnce({ success: true });
    const { result } = renderHook(() =>
      useTagsCuration({
        initialTags: [
          { tag: "js", count: 3 },
          { tag: "javascript", count: 7 },
        ],
      })
    );

    // Prepare rename: js -> javascript (merge counts!)
    act(() => {
      result.current.setActiveRenameTag({ tag: "js", count: 3 });
      result.current.setRenameValue("javascript");
    });

    await act(async () => {
      result.current.handleRenameSubmit({ preventDefault: vi.fn() } as any);
    });

    expect(mockedMergeTags).toHaveBeenCalledWith("js", "javascript");
    // js (3) + javascript (7) = javascript (10), js removed
    expect(result.current.tags).toEqual([{ tag: "javascript", count: 10 }]);
  });
});

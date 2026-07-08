import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useReportBlocks } from "../useReportBlocks";

describe("useReportBlocks hook", () => {
  it("initializes with a default welcome markdown block", () => {
    const { result } = renderHook(() => useReportBlocks());
    expect(result.current.blocks).toHaveLength(1);
    expect(result.current.blocks[0]).toMatchObject({
      type: "markdown",
      id: "welcome-md",
    });
  });

  it("can add a markdown block without calling compileFn", () => {
    const { result } = renderHook(() => useReportBlocks());
    const compileMock = vi.fn();

    act(() => {
      result.current.addBlock("markdown", compileMock);
    });

    expect(result.current.blocks).toHaveLength(2);
    expect(result.current.blocks[1].type).toBe("markdown");
    expect(compileMock).not.toHaveBeenCalled();
  });

  it("can add a query block (e.g. projects) and trigger compileFn", () => {
    const { result } = renderHook(() => useReportBlocks());
    const compileMock = vi.fn();

    act(() => {
      result.current.addBlock("projects", compileMock);
    });

    expect(result.current.blocks).toHaveLength(2);
    expect(result.current.blocks[1].type).toBe("projects");
    expect(compileMock).toHaveBeenCalledOnce();
  });

  it("can remove a block and strip its reference from GenAI inputBlockIds", () => {
    const { result } = renderHook(() => useReportBlocks());
    
    // Add a block to reference
    act(() => {
      result.current.addBlock("publications");
    });
    const pubBlockId = result.current.blocks[1].id;

    // Add a GenAI block referencing the publications block
    act(() => {
      result.current.addBlock("genai");
    });
    const genaiBlockId = result.current.blocks[2].id;

    // Manually set inputBlockIds
    act(() => {
      result.current.updateBlockFilter(genaiBlockId, "inputBlockIds", [pubBlockId]);
    });
    expect(result.current.blocks[2].filters.inputBlockIds).toEqual([pubBlockId]);

    // Remove the referenced block
    act(() => {
      result.current.removeBlock(pubBlockId);
    });

    // Check publications is gone and GenAI references are updated
    expect(result.current.blocks).toHaveLength(2); // welcome + genai
    expect(result.current.blocks[1].id).toBe(genaiBlockId);
    expect(result.current.blocks[1].filters.inputBlockIds).toEqual([]);
  });

  it("can move blocks up and down", () => {
    const { result } = renderHook(() => useReportBlocks());
    
    act(() => {
      result.current.addBlock("publications");
    });
    const firstId = result.current.blocks[0].id;
    const secondId = result.current.blocks[1].id;

    // Move first down (index 0, down)
    act(() => {
      result.current.moveBlock(0, "down");
    });
    expect(result.current.blocks[0].id).toBe(secondId);
    expect(result.current.blocks[1].id).toBe(firstId);

    // Move it up again (index 1, up)
    act(() => {
      result.current.moveBlock(1, "up");
    });
    expect(result.current.blocks[0].id).toBe(firstId);
    expect(result.current.blocks[1].id).toBe(secondId);
  });

  it("can update block content", () => {
    const { result } = renderHook(() => useReportBlocks());
    act(() => {
      result.current.updateBlockContent("welcome-md", "New Content");
    });
    expect(result.current.blocks[0].content).toBe("New Content");
  });
});

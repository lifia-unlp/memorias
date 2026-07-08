import { useState } from "react";
import { Block } from "../useReportCompiler";

export function useReportBlocks() {
  const [blocks, setBlocks] = useState<Block[]>([
    {
      id: "welcome-md",
      type: "markdown",
      content: "# Research Report\nThis report has been compiled dynamically using the MEMORIAS Research Portal.\n\nUse the builder tools to configure elements, sort criteria, and filter by members or years.",
      filters: { memberIds: [], types: [], year: "all", startYear: "", endYear: "", style: "apa", showSummary: true },
      sort: { field: "year", direction: "desc" },
      compiledItems: [],
    },
  ]);

  const addBlock = (type: Block["type"], compileFn?: (updated: Block[]) => Promise<void>) => {
    const newBlock: Block = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      content:
        type === "markdown"
          ? "### Heading\nType your markdown content here."
          : type === "genai"
          ? "### GenAI Compilation\nClick 'Regenerate' or update filters to create dynamic text."
          : undefined,
      filters: {
        memberIds: [],
        types: [],
        year: "all",
        startYear: "",
        endYear: "",
        style: "apa",
        showSummary: true,
        tags: [],
        prompt: type === "genai" ? "Summarize the major highlights." : undefined,
        maxLength: type === "genai" ? 300 : undefined,
        inputBlockIds: type === "genai" ? [] : undefined,
      },
      sort: {
        field: "year",
        direction: "desc",
      },
      compiledItems: [],
    };
    const updated = [...blocks, newBlock];
    setBlocks(updated);
    if (type !== "markdown" && compileFn) {
      compileFn(updated);
    }
  };

  const removeBlock = (id: string) => {
    const remaining = blocks.filter((b) => b.id !== id);
    const updated = remaining.map((b) => {
      if (b.type === "genai" && b.filters.inputBlockIds?.includes(id)) {
        return {
          ...b,
          filters: {
            ...b.filters,
            inputBlockIds: b.filters.inputBlockIds.filter((refId) => refId !== id),
          },
        };
      }
      return b;
    });
    setBlocks(updated);
  };

  const moveBlock = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === blocks.length - 1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const updated = [...blocks];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setBlocks(updated);
  };

  const updateBlockContent = (id: string, text: string) => {
    setBlocks(
      blocks.map((b) => (b.id === id ? { ...b, content: text } : b))
    );
  };

  const updateBlockFilter = (
    id: string,
    key: keyof Block["filters"],
    value: any,
    compileFn?: (updated: Block[]) => Promise<void>
  ) => {
    const updated = blocks.map((b) => {
      if (b.id === id) {
        return {
          ...b,
          filters: {
            ...b.filters,
            [key]: value,
          },
        };
      }
      return b;
    });
    setBlocks(updated);
    const changedBlock = updated.find((b) => b.id === id);
    if (changedBlock && changedBlock.type !== "markdown" && changedBlock.type !== "genai" && compileFn) {
      compileFn(updated);
    }
  };

  const updateBlockSort = (
    id: string,
    key: keyof Block["sort"],
    value: any,
    compileFn?: (updated: Block[]) => Promise<void>
  ) => {
    const updated = blocks.map((b) => {
      if (b.id === id) {
        return {
          ...b,
          sort: {
            ...b.sort,
            [key]: value,
          },
        };
      }
      return b;
    });
    setBlocks(updated);
    const changedBlock = updated.find((b) => b.id === id);
    if (changedBlock && changedBlock.type !== "markdown" && changedBlock.type !== "genai" && compileFn) {
      compileFn(updated);
    }
  };

  return {
    blocks,
    setBlocks,
    addBlock,
    removeBlock,
    moveBlock,
    updateBlockContent,
    updateBlockFilter,
    updateBlockSort,
  };
}

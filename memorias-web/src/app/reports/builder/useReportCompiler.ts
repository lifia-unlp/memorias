"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  getReportInitData,
  queryPublications,
  queryProjects,
  queryScholarships,
  queryTheses,
  generateReportAIContent,
} from "../actions";
import { useReportBlocks } from "./hooks/useReportBlocks";
import { useSavedReports } from "./hooks/useSavedReports";

export interface Block {
  id: string;
  type: "markdown" | "publications" | "projects" | "scholarships" | "theses" | "genai";
  content?: string;
  filters: {
    memberIds: string[];
    types: string[];
    year: string;
    startYear: string;
    endYear: string;
    style: string; // apa, vancouver, harvard
    showSummary: boolean;
    tags?: string[];

    // GenAI specifics
    prompt?: string;
    maxLength?: number;
    inputBlockIds?: string[];
  };
  sort: {
    field: "year" | "title";
    direction: "asc" | "desc";
  };
  compiledItems: any[];
  isGenerating?: boolean;
  lastGeneratedConfig?: {
    prompt: string;
    maxLength: number;
    inputBlockIds: string[];
    inputContent: string;
  };
}

export interface InitData {
  members: Array<{ id: string; firstName: string; lastName: string; slug: string }>;
  publicationYears: number[];
  publicationTypes: string[];
  scholarshipTypes: string[];
  thesisLevels: string[];
  tags: string[];
}

export const formatDateRange = (startDate?: string | Date | null, endDate?: string | Date | null) => {
  const startStr = startDate
    ? new Date(startDate).toLocaleDateString("en-US", { year: "numeric", month: "short" })
    : "N/D";
  const endStr = endDate
    ? new Date(endDate).toLocaleDateString("en-US", { year: "numeric", month: "short" })
    : "Ongoing";
  return `${startStr} - ${endStr}`;
};

export const buildProjectSentence = (proj: any) => {
  const parts: string[] = [];
  const dateRange = formatDateRange(proj.startDate, proj.endDate);
  parts.push(`Active from ${dateRange}`);
  
  if (proj.director && proj.director !== "N/A") {
    parts.push(`directed by ${proj.director}`);
  }
  if (proj.coDirector && proj.coDirector !== "N/A") {
    parts.push(`with Co-Director ${proj.coDirector}`);
  }
  if (proj.responsibleGroup && proj.responsibleGroup !== "N/A") {
    parts.push(`under the responsible group ${proj.responsibleGroup}`);
  }
  
  const fundingParts: string[] = [];
  if (proj.fundingAgency && proj.fundingAgency !== "N/A") {
    fundingParts.push(`funding provided by ${proj.fundingAgency}`);
  }
  if (proj.amount && proj.amount !== "N/A") {
    fundingParts.push(`amount: ${proj.amount}`);
  }
  if (fundingParts.length > 0) {
    parts.push(`with ${fundingParts.join(" (")}${fundingParts.length > 1 ? ")" : ""}`);
  }
  return parts.join(", ") + ".";
};

export const buildScholarshipSentence = (schol: any) => {
  const parts: string[] = [];
  const dateRange = formatDateRange(schol.startDate, schol.endDate);
  parts.push(`Scholarship active from ${dateRange}`);
  
  if (schol.student && schol.student !== "N/A") {
    parts.push(`awarded to student ${schol.student}`);
  }
  if (schol.director && schol.director !== "N/A") {
    parts.push(`directed by ${schol.director}`);
  }
  if (schol.coDirector && schol.coDirector !== "N/A") {
    parts.push(`with Co-Director ${schol.coDirector}`);
  }
  if (schol.fundingAgency && schol.fundingAgency !== "N/A") {
    parts.push(`with funding provided by ${schol.fundingAgency}`);
  }
  return parts.join(", ") + ".";
};

export const buildThesisSentence = (thesis: any) => {
  const parts: string[] = [];
  let thesisPrefix = "Thesis";
  if (thesis.career && thesis.career !== "N/A") {
    thesisPrefix += ` for career ${thesis.career}`;
  }
  const dateRange = formatDateRange(thesis.startDate, thesis.endDate);
  parts.push(`${thesisPrefix} active from ${dateRange}`);
  
  if (thesis.student && thesis.student !== "N/A") {
    parts.push(`with student ${thesis.student}`);
  }
  if (thesis.director && thesis.director !== "N/A") {
    parts.push(`directed by ${thesis.director}`);
  }
  if (thesis.coDirector && thesis.coDirector !== "N/A") {
    parts.push(`with Co-Director ${thesis.coDirector}`);
  }
  if (thesis.otherAdvisors && thesis.otherAdvisors !== "N/A") {
    parts.push(`and advisors ${thesis.otherAdvisors}`);
  }
  if (thesis.progress && thesis.progress !== "N/A") {
    parts.push(`progress: ${thesis.progress}%`);
  }
  return parts.join(", ") + ".";
};

export const getBlockMarkdownContext = (block: Block): string => {
  if (block.type === "markdown") return block.content || "";
  if (block.type === "publications") {
    if (block.compiledItems.length === 0) return "*No publications matched.*";
    return block.compiledItems.map((pub) => pub.citationText).join("\n\n");
  }
  if (block.type === "projects") {
    if (block.compiledItems.length === 0) return "*No projects matched.*";
    return block.compiledItems.map((proj) => {
      let text = `### Project: ${proj.title} ${proj.code ? `(${proj.code})` : ""}\n${buildProjectSentence(proj)}`;
      if (proj.summary) text += `\nSummary: ${proj.summary}`;
      return text;
    }).join("\n\n");
  }
  if (block.type === "scholarships") {
    if (block.compiledItems.length === 0) return "*No scholarships matched.*";
    return block.compiledItems.map((schol) => {
      let text = `### Scholarship: ${schol.title} ${schol.type ? `(${schol.type})` : ""}\n${buildScholarshipSentence(schol)}`;
      if (schol.summary) text += `\nSummary: ${schol.summary}`;
      return text;
    }).join("\n\n");
  }
  if (block.type === "theses") {
    if (block.compiledItems.length === 0) return "*No theses matched.*";
    return block.compiledItems.map((thesis) => {
      let text = `### Thesis: ${thesis.title} ${thesis.level ? `(${thesis.level})` : ""}\n${buildThesisSentence(thesis)}`;
      if (thesis.summary) text += `\nSummary: ${thesis.summary}`;
      return text;
    }).join("\n\n");
  }
  return "";
};

export function useReportCompiler() {
  const [initData, setInitData] = useState<InitData | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);

  const blockHook = useReportBlocks();
  const savedHook = useSavedReports();

  const activeRequestsRef = useRef<Record<string, string>>({});

  const cancelGenAIUpdate = (id: string) => {
    if (activeRequestsRef.current[id]) {
      delete activeRequestsRef.current[id];
    }
    blockHook.setBlocks((prev) =>
      prev.map((b) =>
        b.id === id
          ? {
              ...b,
              isGenerating: false,
              content: "### Generation Cancelled\nGenAI block updates were stopped by the user.",
            }
          : b
      )
    );
  };

  useEffect(() => {
    async function load() {
      try {
        const data = await getReportInitData();
        setInitData(data);
      } catch (err) {
        console.error("Failed to load initialization data", err);
      }
    }
    load();
  }, []);

  const getInputBlocksContent = (block: Block, allBlocks: Block[]): string => {
    const inputBlockIds = block.filters.inputBlockIds || [];
    const contextParts: string[] = [];
    inputBlockIds.forEach((id) => {
      const refBlock = allBlocks.find((b) => b.id === id);
      if (refBlock) {
        contextParts.push(`--- Block (${refBlock.type}) ---\n${getBlockMarkdownContext(refBlock)}`);
      }
    });
    return contextParts.join("\n\n");
  };

  const isGenAIDirty = (block: Block, allBlocks: Block[]): boolean => {
    if (!block.lastGeneratedConfig) {
      return true;
    }
    const currentPrompt = block.filters.prompt || "";
    const currentMaxLength = block.filters.maxLength || 300;
    const currentInputBlockIds = block.filters.inputBlockIds || [];
    const currentInputContent = getInputBlocksContent(block, allBlocks);

    const last = block.lastGeneratedConfig;
    if (currentPrompt !== last.prompt) return true;
    if (currentMaxLength !== last.maxLength) return true;
    if (currentInputBlockIds.length !== last.inputBlockIds.length) return true;
    for (let i = 0; i < currentInputBlockIds.length; i++) {
      if (currentInputBlockIds[i] !== last.inputBlockIds[i]) return true;
    }
    if (currentInputContent !== last.inputContent) return true;

    return false;
  };

  const getSelectedContextLength = (block: Block): number => {
    const inputBlockIds = block.filters.inputBlockIds || [];
    let len = 0;
    inputBlockIds.forEach((id) => {
      const refBlock = blockHook.blocks.find((b) => b.id === id);
      if (refBlock) {
        len += getBlockMarkdownContext(refBlock).length;
      }
    });
    return len;
  };

  const compileReport = async (currentBlocks: Block[] = blockHook.blocks, forceGenAIBlockId?: string) => {
    setIsCompiling(true);
    try {
      const compiledNonAI = await Promise.all(
        currentBlocks.map(async (block) => {
          if (block.type === "markdown" || block.type === "genai") {
            return { ...block };
          }

          const memberIds = block.filters.memberIds;
          const startY = block.filters.startYear ? parseInt(block.filters.startYear, 10) : undefined;
          const endY = block.filters.endYear ? parseInt(block.filters.endYear, 10) : undefined;
          const tags = block.filters.tags;

          let items: any[] = [];
          if (block.type === "publications") {
            items = await queryPublications(
              {
                memberIds,
                types: block.filters.types,
                year: "all",
                style: block.filters.style || "apa",
                startYear: startY,
                endYear: endY,
                tags,
              },
              block.sort
            );
          } else if (block.type === "projects") {
            items = await queryProjects(
              {
                memberIds,
                startYear: startY,
                endYear: endY,
                tags,
              },
              block.sort
            );
          } else if (block.type === "scholarships") {
            items = await queryScholarships(
              {
                memberIds,
                types: block.filters.types,
                startYear: startY,
                endYear: endY,
                tags,
              },
              block.sort
            );
          } else if (block.type === "theses") {
            items = await queryTheses(
              {
                memberIds,
                levels: block.filters.types,
                startYear: startY,
                endYear: endY,
                tags,
              },
              block.sort
            );
          }

          return { ...block, compiledItems: items };
        })
      );

      const finalBlocks: Block[] = [];
      for (const block of compiledNonAI) {
        if (block.type !== "genai") {
          finalBlocks.push(block);
          continue;
        }

        const shouldGenerate = forceGenAIBlockId === block.id;
        if (!shouldGenerate) {
          finalBlocks.push(block);
          continue;
        }

        const inputBlockIds = block.filters.inputBlockIds || [];
        const contextParts: string[] = [];
        inputBlockIds.forEach((id) => {
          const refBlock = compiledNonAI.find((b) => b.id === id);
          if (refBlock) {
            contextParts.push(`--- Block (${refBlock.type}) ---\n${getBlockMarkdownContext(refBlock)}`);
          }
        });
        let inputContent = contextParts.join("\n\n");
        const MAX_CONTEXT_LENGTH = 15000;
        if (inputContent.length > MAX_CONTEXT_LENGTH) {
          inputContent = inputContent.substring(0, MAX_CONTEXT_LENGTH) + "\n\n[Context truncated due to size limits]";
        }

        block.isGenerating = true;
        const requestId = Math.random().toString(36).substring(2, 9);
        activeRequestsRef.current[block.id] = requestId;

        blockHook.setBlocks([...finalBlocks, block, ...compiledNonAI.slice(finalBlocks.length + 1)]);

        try {
          const res = await generateReportAIContent({
            prompt: block.filters.prompt || "",
            maxLength: block.filters.maxLength || 300,
            inputContent,
          });
          
          if (activeRequestsRef.current[block.id] === requestId) {
            block.content = res.content;
            block.lastGeneratedConfig = {
              prompt: block.filters.prompt || "",
              maxLength: block.filters.maxLength || 300,
              inputBlockIds: [...inputBlockIds],
              inputContent: inputContent,
            };
            block.isGenerating = false;
            delete activeRequestsRef.current[block.id];
          } else {
            block.isGenerating = false;
            block.content = "### Generation Cancelled\nGenAI block updates were stopped by the user.";
            finalBlocks.push(block);
            continue;
          }
        } catch (aiErr) {
          if (activeRequestsRef.current[block.id] === requestId) {
            console.error("AI Generation failed for block", block.id, aiErr);
            block.content = `### Error during generation\n${aiErr instanceof Error ? aiErr.message : "An unexpected error occurred."}`;
            block.isGenerating = false;
            delete activeRequestsRef.current[block.id];
          } else {
            block.isGenerating = false;
            block.content = "### Generation Cancelled\nGenAI block updates were stopped by the user.";
            finalBlocks.push(block);
            continue;
          }
        }

        finalBlocks.push(block);
      }

      blockHook.setBlocks(finalBlocks);
    } catch (err) {
      console.error("Compilation error", err);
    } finally {
      setIsCompiling(false);
    }
  };

  useEffect(() => {
    if (initData) {
      compileReport();
    }
  }, [initData]);

  const addBlock = (type: Block["type"]) => {
    blockHook.addBlock(type, compileReport);
  };

  const removeBlock = (id: string) => {
    blockHook.removeBlock(id);
  };

  const moveBlock = (index: number, direction: "up" | "down") => {
    blockHook.moveBlock(index, direction);
  };

  const updateBlockContent = (id: string, text: string) => {
    blockHook.updateBlockContent(id, text);
  };

  const updateBlockFilter = (id: string, key: keyof Block["filters"], value: any) => {
    blockHook.updateBlockFilter(id, key, value, compileReport);
  };

  const updateBlockSort = (id: string, key: keyof Block["sort"], value: any) => {
    blockHook.updateBlockSort(id, key, value, compileReport);
  };

  const exportMarkdown = () => {
    let md = "";
    blockHook.blocks.forEach((block) => {
      if (block.type === "markdown" || block.type === "genai") {
        md += `${block.content}\n\n`;
      } else if (block.type === "publications") {
        if (block.compiledItems.length === 0) {
          md += "*No publications found.*\n\n";
        } else {
          block.compiledItems.forEach((pub) => {
            md += `${pub.citationText}\n\n`;
          });
        }
      } else if (block.type === "projects") {
        if (block.compiledItems.length === 0) {
          md += "*No projects found.*\n\n";
        } else {
          block.compiledItems.forEach((proj) => {
            md += `### ${proj.title} ${proj.code ? `(${proj.code})` : ""}\n`;
            md += `${buildProjectSentence(proj)}\n`;
            if (block.filters.showSummary && proj.summary) {
              md += `Summary: ${proj.summary}\n`;
            }
            md += `\n`;
          });
        }
      } else if (block.type === "scholarships") {
        if (block.compiledItems.length === 0) {
          md += "*No scholarships found.*\n\n";
        } else {
          block.compiledItems.forEach((schol) => {
            md += `### ${schol.title} ${schol.type ? `(${schol.type})` : ""}\n`;
            md += `${buildScholarshipSentence(schol)}\n`;
            if (block.filters.showSummary && schol.summary) {
              md += `Summary: ${schol.summary}\n`;
            }
            md += `\n`;
          });
        }
      } else if (block.type === "theses") {
        if (block.compiledItems.length === 0) {
          md += "*No theses found.*\n\n";
        } else {
          block.compiledItems.forEach((thesis) => {
            md += `### ${thesis.title} ${thesis.level ? `(${thesis.level})` : ""}\n`;
            md += `${buildThesisSentence(thesis)}\n`;
            if (block.filters.showSummary && thesis.summary) {
              md += `Summary: ${thesis.summary}\n`;
            }
            md += `\n`;
          });
        }
      }
    });

    const blob = new Blob([md], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `memorias-report-${new Date().toISOString().slice(0, 10)}.md`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return {
    initData,
    blocks: blockHook.blocks,
    isCompiling,
    viewState: savedHook.viewState,
    setViewState: savedHook.setViewState,
    savedReports: savedHook.savedReports,
    reportId: savedHook.reportId,
    setReportId: savedHook.setReportId,
    reportTitle: savedHook.reportTitle,
    setReportTitle: savedHook.setReportTitle,
    isLoadingReports: savedHook.isLoadingReports,
    cancelGenAIUpdate,
    fetchSavedReports: savedHook.fetchSavedReports,
    handleSaveReport: () => savedHook.handleSaveReport(blockHook.blocks, setIsCompiling),
    handleEditReport: (report: any) => savedHook.handleEditReport(report, blockHook.setBlocks, compileReport),
    handleCreateNewReport: () => savedHook.handleCreateNewReport(blockHook.setBlocks, compileReport),
    handleViewReport: (report: any) => savedHook.handleViewReport(report, blockHook.setBlocks, compileReport),
    handleDeleteReport: savedHook.handleDeleteReport,
    isGenAIDirty: (block: Block) => isGenAIDirty(block, blockHook.blocks),
    getSelectedContextLength,
    compileReport: () => compileReport(blockHook.blocks),
    addBlock,
    removeBlock,
    moveBlock,
    updateBlockContent,
    updateBlockFilter,
    updateBlockSort,
    exportMarkdown,
    handlePrint,
  };
}

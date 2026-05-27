"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  Button,
  Grid,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Chip,
} from "@mui/material";
import {
  getReportInitData,
  queryPublications,
  queryProjects,
  queryScholarships,
  queryTheses,
  saveReport,
  getReports,
  deleteReport,
  generateReportAIContent,
} from "../actions";

interface Block {
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

interface InitData {
  members: Array<{ id: string; firstName: string; lastName: string; slug: string }>;
  publicationYears: number[];
  publicationTypes: string[];
  scholarshipTypes: string[];
  thesisLevels: string[];
  tags: string[];
}

export default function ReportBuilderClient({ userRole }: { userRole?: string }) {
  const [initData, setInitData] = useState<InitData | null>(null);
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
  const [isCompiling, setIsCompiling] = useState(false);

  // Persistence and view states
  const [viewState, setViewState] = useState<"list" | "editor" | "view">("list");
  const [savedReports, setSavedReports] = useState<any[]>([]);
  const [reportId, setReportId] = useState<string | null>(null);
  const [reportTitle, setReportTitle] = useState("My Research Report");
  const [isLoadingReports, setIsLoadingReports] = useState(false);

  const activeRequestsRef = React.useRef<Record<string, string>>({});

  const cancelGenAIUpdate = (id: string) => {
    if (activeRequestsRef.current[id]) {
      delete activeRequestsRef.current[id];
    }
    setBlocks((prev) =>
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

  const fetchSavedReports = async () => {
    setIsLoadingReports(true);
    try {
      const reportsList = await getReports();
      setSavedReports(reportsList);
    } catch (err) {
      console.error("Failed to fetch reports", err);
    } finally {
      setIsLoadingReports(false);
    }
  };

  useEffect(() => {
    if (viewState === "list") {
      fetchSavedReports();
    }
  }, [viewState]);

  const handleSaveReport = async () => {
    if (!reportTitle.trim()) {
      alert("Please enter a title for the report.");
      return;
    }
    setIsCompiling(true);
    try {
      const blocksToSave = blocks.map(({ id, type, content, filters, sort, lastGeneratedConfig }) => ({
        id,
        type,
        content,
        filters,
        sort,
        lastGeneratedConfig,
      }));

      const response = await saveReport({
        id: reportId || undefined,
        title: reportTitle,
        blocks: blocksToSave,
      });
      
      if (response.duplicate) {
        const choice = confirm(
          `${response.message}\n\n` +
          `* Click OK to OVERWRITE the existing report.\n` +
          `* Click CANCEL to save it as a new separate report (renamed automatically to avoid name collisions).`
        );
        
        if (choice) {
          // Overwrite duplicate: execute with existingId and ignore duplicate flag
          const overwriteResponse = await saveReport({
            id: response.existingId,
            title: reportTitle,
            blocks: blocksToSave,
            ignoreDuplicateCheck: true,
          });
          
          if (overwriteResponse.report) {
            setReportId(overwriteResponse.report.id);
            alert("Existing report overwritten successfully!");
            setViewState("list");
          }
        } else {
          // Save separately: append copy suffix and save as new
          const copyTitle = `${reportTitle} (Copy)`;
          setReportTitle(copyTitle);
          
          const copyResponse = await saveReport({
            title: copyTitle,
            blocks: blocksToSave,
            ignoreDuplicateCheck: true,
          });
          
          if (copyResponse.report) {
            setReportId(copyResponse.report.id);
            alert(`Saved as new report: "${copyTitle}"`);
            setViewState("list");
          }
        }
        return;
      }
      
      if (response.report) {
        setReportId(response.report.id);
        alert("Report saved successfully!");
        setViewState("list");
      }
    } catch (err) {
      console.error("Failed to save report", err);
      alert("Error saving report. Make sure your local server was restarted to refresh the Prisma cache.");
    } finally {
      setIsCompiling(false);
    }
  };

  const handleEditReport = async (report: any) => {
    setReportId(report.id);
    setReportTitle(report.title);
    const parsedBlocks = (report.blocks as any[]).map(block => ({
      ...block,
      filters: {
        ...block.filters,
        tags: block.filters?.tags ?? [],
        prompt: block.type === "genai" ? (block.filters?.prompt ?? "Summarize the major highlights.") : undefined,
        maxLength: block.type === "genai" ? (block.filters?.maxLength ?? 300) : undefined,
        inputBlockIds: block.type === "genai" ? (block.filters?.inputBlockIds ?? []) : undefined,
      },
      lastGeneratedConfig: block.lastGeneratedConfig,
      compiledItems: []
    }));
    setBlocks(parsedBlocks);
    setViewState("editor");
    await compileReport(parsedBlocks);
  };

  const handleCreateNewReport = () => {
    setReportId(null);
    setReportTitle("New Research Report");
    const defaultBlocks: Block[] = [
      {
        id: "welcome-md",
        type: "markdown",
        content: "# Research Report\nThis report has been compiled dynamically using the MEMORIAS Research Portal.\n\nUse the builder tools to configure elements, sort criteria, and filter by members or years.",
        filters: { memberIds: [], types: [], year: "all", startYear: "", endYear: "", style: "apa", showSummary: true },
        sort: { field: "year", direction: "desc" },
        compiledItems: [],
      }
    ];
    setBlocks(defaultBlocks);
    setViewState("editor");
    compileReport(defaultBlocks);
  };

  const handleViewReport = async (report: any) => {
    setReportId(report.id);
    setReportTitle(report.title);
    const parsedBlocks = (report.blocks as any[]).map(block => ({
      ...block,
      filters: {
        ...block.filters,
        tags: block.filters?.tags ?? [],
        prompt: block.type === "genai" ? (block.filters?.prompt ?? "Summarize the major highlights.") : undefined,
        maxLength: block.type === "genai" ? (block.filters?.maxLength ?? 300) : undefined,
        inputBlockIds: block.type === "genai" ? (block.filters?.inputBlockIds ?? []) : undefined,
      },
      lastGeneratedConfig: block.lastGeneratedConfig,
      compiledItems: []
    }));
    setBlocks(parsedBlocks);
    setViewState("view");
    await compileReport(parsedBlocks);
  };

  const handleDeleteReport = async (id: string) => {
    if (!confirm("Are you sure you want to delete this report?")) {
      return;
    }
    try {
      await deleteReport(id);
      fetchSavedReports();
    } catch (err) {
      console.error("Failed to delete report", err);
      alert("Error deleting report.");
    }
  };

  // Load init data
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

  // Format active timelines
  const formatDateRange = (startDate?: string | Date | null, endDate?: string | Date | null) => {
    const startStr = startDate
      ? new Date(startDate).toLocaleDateString("en-US", { year: "numeric", month: "short" })
      : "N/D";
    const endStr = endDate
      ? new Date(endDate).toLocaleDateString("en-US", { year: "numeric", month: "short" })
      : "Ongoing";
    return `${startStr} - ${endStr}`;
  };

  // Helper to format Projects as a concatenated sentence with optional/omitted properties
  const buildProjectSentence = (proj: any) => {
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

  // Helper to format Scholarships as a concatenated sentence with optional/omitted properties
  const buildScholarshipSentence = (schol: any) => {
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

  // Helper to format Theses as a concatenated sentence with optional/omitted properties
  const buildThesisSentence = (thesis: any) => {
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

  // Helper to serialize any block's compiled content to plain markdown text for LLM context
  const getBlockMarkdownContext = (block: Block): string => {
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
      return true; // Never generated
    }
    const currentPrompt = block.filters.prompt || "";
    const currentMaxLength = block.filters.maxLength || 300;
    const currentInputBlockIds = block.filters.inputBlockIds || [];
    const currentInputContent = getInputBlocksContent(block, allBlocks);

    const last = block.lastGeneratedConfig;
    
    // Check prompt
    if (currentPrompt !== last.prompt) return true;
    
    // Check maxLength
    if (currentMaxLength !== last.maxLength) return true;
    
    // Check input ids length/contents
    if (currentInputBlockIds.length !== last.inputBlockIds.length) return true;
    for (let i = 0; i < currentInputBlockIds.length; i++) {
      if (currentInputBlockIds[i] !== last.inputBlockIds[i]) return true;
    }
    
    // Check compiled input content
    if (currentInputContent !== last.inputContent) return true;

    return false;
  };

  const getSelectedContextLength = (block: Block): number => {
    const inputBlockIds = block.filters.inputBlockIds || [];
    let len = 0;
    inputBlockIds.forEach((id) => {
      const refBlock = blocks.find((b) => b.id === id);
      if (refBlock) {
        len += getBlockMarkdownContext(refBlock).length;
      }
    });
    return len;
  };

  // Compile individual blocks using server actions
  const compileReport = async (currentBlocks: Block[] = blocks, forceGenAIBlockId?: string) => {
    setIsCompiling(true);
    try {
      // Phase 1: Compile all static/dynamic non-GenAI blocks in parallel
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

      // Phase 2: Compile GenAI blocks sequentially based on Phase 1 output
      const finalBlocks: Block[] = [];
      for (const block of compiledNonAI) {
        if (block.type !== "genai") {
          finalBlocks.push(block);
          continue;
        }

        // We only generate if explicitly forced via the "Regenerate" button
        const shouldGenerate = forceGenAIBlockId === block.id;

        if (!shouldGenerate) {
          finalBlocks.push(block);
          continue;
        }

        // Get context from referenced blocks
        const inputBlockIds = block.filters.inputBlockIds || [];
        const contextParts: string[] = [];
        inputBlockIds.forEach((id) => {
          const refBlock = compiledNonAI.find((b) => b.id === id);
          if (refBlock) {
            contextParts.push(`--- Block (${refBlock.type}) ---\n${getBlockMarkdownContext(refBlock)}`);
          }
        });
        let inputContent = contextParts.join("\n\n");
        const MAX_CONTEXT_LENGTH = 15000; // character limit (roughly 2500 words)
        if (inputContent.length > MAX_CONTEXT_LENGTH) {
          inputContent = inputContent.substring(0, MAX_CONTEXT_LENGTH) + "\n\n[Context truncated due to size limits]";
        }

        // Set to generating status on the client canvas
        block.isGenerating = true;
        const requestId = Math.random().toString(36).substring(2, 9);
        activeRequestsRef.current[block.id] = requestId;

        setBlocks([...finalBlocks, block, ...compiledNonAI.slice(finalBlocks.length + 1)]);

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
            // Request was cancelled, keep the cancelled text and continue
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

      setBlocks(finalBlocks);
    } catch (err) {
      console.error("Compilation error", err);
    } finally {
      setIsCompiling(false);
    }
  };

  // Automatically compile once initial data is loaded
  useEffect(() => {
    if (initData) {
      compileReport();
    }
  }, [initData]);

  // Block handlers
  const addBlock = (type: Block["type"]) => {
    const newBlock: Block = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      content: type === "markdown" ? "### Heading\nType your markdown content here." : type === "genai" ? "### GenAI Compilation\nClick 'Regenerate' or update filters to create dynamic text." : undefined,
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
    if (type !== "markdown") {
      compileReport(updated);
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

  const updateBlockFilter = (id: string, key: keyof Block["filters"], value: any) => {
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
    // Auto-recompile dynamic blocks on filter change
    const changedBlock = updated.find((b) => b.id === id);
    if (changedBlock && changedBlock.type !== "markdown" && changedBlock.type !== "genai") {
      compileReport(updated);
    }
  };

  const updateBlockSort = (id: string, key: keyof Block["sort"], value: any) => {
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
    if (changedBlock && changedBlock.type !== "markdown" && changedBlock.type !== "genai") {
      compileReport(updated);
    }
  };

  // Exporters
  const exportMarkdown = () => {
    let md = "";
    blocks.forEach((block) => {
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

  // Custom parser to format client preview safely
  const renderMarkdownText = (text: string) => {
    return text.split("\n").map((line, index) => {
      // Basic markdown regex replacements
      const formattedLine = line
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>");

      if (formattedLine.startsWith("# ")) {
        return (
          <Typography
            key={index}
            variant="h4"
            sx={{ fontWeight: 800, mt: 3, mb: 1.5, borderBottom: "2px solid", borderColor: "grey.200", pb: 0.5, color: "text.primary" }}
          >
            {formattedLine.replace("# ", "")}
          </Typography>
        );
      } else if (formattedLine.startsWith("## ")) {
        return (
          <Typography
            key={index}
            variant="h5"
            sx={{ fontWeight: 700, mt: 2.5, mb: 1, borderBottom: "1px solid", borderColor: "grey.200", pb: 0.5, color: "text.primary" }}
          >
            {formattedLine.replace("## ", "")}
          </Typography>
        );
      } else if (formattedLine.startsWith("### ")) {
        return (
          <Typography
            key={index}
            variant="h6"
            sx={{ fontWeight: 600, mt: 2, mb: 1, color: "text.primary" }}
          >
            {formattedLine.replace("### ", "")}
          </Typography>
        );
      } else if (formattedLine.startsWith("- ") || formattedLine.startsWith("* ")) {
        return (
          <Typography
            key={index}
            component="li"
            variant="body2"
            sx={{ ml: 3, mb: 0.5, listStyleType: "disc", color: "text.primary" }}
            dangerouslySetInnerHTML={{ __html: formattedLine.substring(2) }}
          />
        );
      }
      return formattedLine.trim() ? (
        <Typography
          key={index}
          variant="body2"
          sx={{ mb: 1.5, lineHeight: 1.6, color: "text.primary" }}
          dangerouslySetInnerHTML={{ __html: formattedLine }}
        />
      ) : (
        <Box key={index} sx={{ height: 8 }} />
      );
    });
  };

  const renderA4Canvas = (hidePaperHeaders = false) => {
    return (
      <Card
        variant="outlined"
        sx={{
          position: "relative",
          bgcolor: "background.paper",
          borderColor: "divider",
          boxShadow: 3,
          borderRadius: 4,
          p: 4,
          minHeight: 600,
          overflowY: "auto",
          width: "100%",
          maxWidth: 800,
          "@media print": {
            boxShadow: "none",
            border: "none",
            p: 0,
            m: 0,
          }
        }}
      >
        {/* Decorative paper headers - no print */}
        {!hidePaperHeaders && (
          <Box sx={{ borderBottom: "2px solid", borderColor: "divider", pb: 2, mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography variant="caption" sx={{ textTransform: "uppercase", fontWeight: "bold", tracking: "0.1em", color: "text.secondary", display: "block" }}>
                Report Preview
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: "bold", color: "text.primary" }}>
                {reportTitle || "Untitled Report"}
              </Typography>
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Typography variant="caption" sx={{ fontFamily: "monospace", color: "text.secondary" }}>
                Date: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Loader placeholder when compiling */}
        {isCompiling && (
          <Box sx={{ position: "absolute", inset: 0, bgcolor: "rgba(255,255,255,0.7)", display: "flex", flexDirection: "column", items: "center", justify: "center", gap: 1.5, zIndex: 30, borderRadius: 4 }}>
            <CircularProgress size={32} />
            <Typography variant="caption" sx={{ fontWeight: "bold", color: "text.primary" }}>
              Compiling Report Preview...
            </Typography>
          </Box>
        )}

        {/* The Actual Plain Page Render */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {blocks.map((block) => {
            if (block.type === "markdown" || block.type === "genai") {
              return (
                <Box key={block.id} sx={{ position: "relative", color: "text.primary" }}>
                  {block.type === "genai" && block.isGenerating && (
                    <Box sx={{ p: 2.5, border: "1px dashed", borderColor: "primary.main", borderRadius: 3, display: "flex", alignItems: "center", gap: 2, bgcolor: "action.hover", mb: 2 }}>
                      <CircularProgress size={20} />
                      <Typography variant="body2" sx={{ fontWeight: "bold" }} color="primary.main">
                        GenAI Block: Compiling AI summary...
                      </Typography>
                    </Box>
                  )}
                  {renderMarkdownText(block.content || "")}
                </Box>
              );
            }

            if (block.type === "publications") {
              return (
                <Box key={block.id} sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {block.compiledItems.length === 0 ? (
                    <Typography variant="body2" sx={{ fontStyle: "italic" }} color="text.secondary">
                      No publications matched your filters.
                    </Typography>
                  ) : (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      {block.compiledItems.map((pub, i) => (
                        <Typography
                          key={pub.id || i}
                          variant="body2"
                          sx={{ lineHeight: 1.6, color: "text.primary" }}
                          dangerouslySetInnerHTML={{ __html: pub.citationHtml }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>
              );
            }

            if (block.type === "projects") {
              return (
                <Box key={block.id} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {block.compiledItems.length === 0 ? (
                    <Typography variant="body2" sx={{ fontStyle: "italic" }} color="text.secondary">
                      No projects matched your filters.
                    </Typography>
                  ) : (
                    block.compiledItems.map((proj, i) => (
                      <Box key={proj.id || i} sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "text.primary" }}>
                          {proj.title} {proj.code ? `(Code: ${proj.code})` : ""}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                          {buildProjectSentence(proj)}
                        </Typography>
                        {block.filters.showSummary && proj.summary && (
                          <Typography variant="body2" sx={{ fontStyle: "italic", mt: 0.5 }} color="text.secondary">
                            Summary: {proj.summary}
                          </Typography>
                        )}
                      </Box>
                    ))
                  )}
                </Box>
              );
            }

            if (block.type === "scholarships") {
              return (
                <Box key={block.id} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {block.compiledItems.length === 0 ? (
                    <Typography variant="body2" sx={{ fontStyle: "italic" }} color="text.secondary">
                      No scholarships matched your filters.
                    </Typography>
                  ) : (
                    block.compiledItems.map((schol, i) => (
                      <Box key={schol.id || i} sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "text.primary" }}>
                          {schol.title} {schol.type ? `(${schol.type})` : ""}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                          {buildScholarshipSentence(schol)}
                        </Typography>
                        {block.filters.showSummary && schol.summary && (
                          <Typography variant="body2" sx={{ fontStyle: "italic", mt: 0.5 }} color="text.secondary">
                            Summary: {schol.summary}
                          </Typography>
                        )}
                      </Box>
                    ))
                  )}
                </Box>
              );
            }

            if (block.type === "theses") {
              return (
                <Box key={block.id} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {block.compiledItems.length === 0 ? (
                    <Typography variant="body2" sx={{ fontStyle: "italic" }} color="text.secondary">
                      No theses matched your filters.
                    </Typography>
                  ) : (
                    block.compiledItems.map((thesis, i) => (
                      <Box key={thesis.id || i} sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "text.primary" }}>
                          {thesis.title} {thesis.level ? `(${thesis.level})` : ""}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                          {buildThesisSentence(thesis)}
                        </Typography>
                        {block.filters.showSummary && thesis.summary && (
                          <Typography variant="body2" sx={{ fontStyle: "italic", mt: 0.5 }} color="text.secondary">
                            Summary: {thesis.summary}
                          </Typography>
                        )}
                      </Box>
                    ))
                  )}
                </Box>
              );
            }

            return null;
          })}
        </Box>
      </Card>
    );
  };

  // 1. DASHBOARD LIST MODE
  if (viewState === "list") {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid",
            borderColor: "divider",
            pb: 2,
          }}
        >
          <Typography variant="h2" sx={{ fontSize: "1.35rem", fontWeight: 800 }}>
            Saved Configs
          </Typography>
          <Button
            variant="contained"
            onClick={handleCreateNewReport}
            sx={{
              fontWeight: "bold",
              textTransform: "none",
              borderRadius: 2.5,
              px: 3,
            }}
          >
            Create New Report
          </Button>
        </Box>

        {isLoadingReports ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 8, gap: 2 }}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: "bold" }}>
              Loading reports...
            </Typography>
          </Box>
        ) : savedReports.length === 0 ? (
          <Card variant="outlined" sx={{ p: 6, textAlign: "center", maxWidth: 500, mx: "auto", borderRadius: 4, bgcolor: "background.paper", borderColor: "divider" }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1, color: "text.primary" }}>
              No reports found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              You have no saved report configurations yet. Click below to compose your first custom research summary.
            </Typography>
            <Button variant="contained" onClick={handleCreateNewReport} sx={{ textTransform: "none", fontWeight: "bold" }}>
              Compose Report
            </Button>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {savedReports.map((report) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={report.id}>
                <Card sx={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", p: 3, borderRadius: 3, bgcolor: "background.paper", borderColor: "divider" }} variant="outlined">
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="h6"
                      onClick={() => handleViewReport(report)}
                      sx={{ fontWeight: "bold", cursor: "pointer", "&:hover": { color: "primary.main" }, mb: 1.5, color: "text.primary", lineHeight: 1.4 }}
                    >
                      {report.title}
                    </Typography>
                    <Box sx={{ fontFamily: "monospace", display: "flex", flexDirection: "column", gap: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        Created: {new Date(report.createdAt).toLocaleDateString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Modified: {new Date(report.updatedAt).toLocaleDateString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Blocks: {Array.isArray(report.blocks) ? report.blocks.length : 0}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1, pt: 2, borderTop: "1px solid", borderColor: "divider" }}>
                    <Button size="small" variant="outlined" onClick={() => handleViewReport(report)} sx={{ flex: 1, textTransform: "none", fontWeight: "bold" }}>
                      View
                    </Button>
                    <Button size="small" variant="contained" onClick={() => handleEditReport(report)} sx={{ flex: 1, textTransform: "none", fontWeight: "bold" }}>
                      Edit
                    </Button>
                    <Button size="small" variant="outlined" color="error" onClick={() => handleDeleteReport(report.id)} sx={{ textTransform: "none", fontWeight: "bold" }}>
                      Delete
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    );
  }

  // 2. FULL SCREEN VIEW MODE
  if (viewState === "view") {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {/* Reader menu */}
        <Card sx={{ p: 2.5, borderRadius: 3, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 2, bgcolor: "background.paper", borderColor: "divider" }} variant="outlined">
          <Box>
            <Typography variant="h6" sx={{ fontWeight: "bold", color: "text.primary" }}>
              {reportTitle}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Distraction-Free View Mode
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button variant="outlined" onClick={() => setViewState("list")} sx={{ textTransform: "none", fontWeight: "bold" }}>
              Back to List
            </Button>
            <Button variant="outlined" onClick={() => handleEditReport({ id: reportId, title: reportTitle, blocks })} sx={{ textTransform: "none", fontWeight: "bold" }}>
              Edit Config
            </Button>
            <Button variant="outlined" onClick={exportMarkdown} sx={{ textTransform: "none", fontWeight: "bold" }}>
              Export Markdown
            </Button>
            <Button variant="contained" color="secondary" onClick={handlePrint} sx={{ textTransform: "none", fontWeight: "bold" }}>
              Print to PDF
            </Button>
          </Box>
        </Card>

        {/* Centered Document Sheet */}
        <Box sx={{ display: "flex", justifyContent: "center", py: 4, bgcolor: "action.hover", borderRadius: 4, border: "1px solid", borderColor: "divider" }}>
          {renderA4Canvas(true)}
        </Box>
      </Box>
    );
  }

  // 3. EDITOR CANVA MODE
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {/* Title Input & Actions Panel */}
      <Card sx={{ p: 3, borderRadius: 4, display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: "center", justifyContent: "space-between", gap: 3, bgcolor: "background.paper", borderColor: "divider" }} variant="outlined">
        <Box sx={{ flex: 1, width: "100%" }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.05em", mb: 1, display: "block" }}>
            Report Title Configuration
          </Typography>
          <TextField
            fullWidth
            size="small"
            value={reportTitle}
            onChange={(e) => setReportTitle(e.target.value)}
            placeholder="Report Title"
            sx={{ bgcolor: "background.default" }}
          />
        </Box>
        <Box sx={{ display: "flex", gap: 1.5, width: { xs: "100%", md: "auto" }, justifyContent: "flex-end" }}>
          <Button variant="outlined" onClick={() => setViewState("list")} sx={{ textTransform: "none", fontWeight: "bold" }}>
            Back to List
          </Button>
          <Button variant="contained" onClick={handleSaveReport} sx={{ textTransform: "none", fontWeight: "bold" }}>
            Save Report
          </Button>
          {reportId && (
            <Button variant="contained" color="secondary" onClick={() => handleViewReport({ id: reportId, title: reportTitle, blocks })} sx={{ textTransform: "none", fontWeight: "bold" }}>
              View Full Screen
            </Button>
          )}
        </Box>
      </Card>
      {/* Builder Workspace Layout */}
      <Grid container spacing={4} sx={{ alignItems: "start" }}>
        
        {/* LEFT: Builder & Editor (7 Columns) */}
        <Grid size={{ xs: 12, lg: 7 }} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          
          {/* Element Palette */}
          <Card sx={{ p: 3, borderRadius: 3, bgcolor: "background.paper", borderColor: "divider" }} variant="outlined">
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", mb: 2, display: "block" }}>
              Add Elements to Report
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {[
                { label: "Markdown Block", type: "markdown" },
                { label: "Publications Block", type: "publications" },
                { label: "Projects Block", type: "projects" },
                { label: "Scholarships Block", type: "scholarships" },
                { label: "Thesis Block", type: "theses" },
                { label: "GenAI Block", type: "genai" },
              ].filter((item) => {
                if (item.type === "genai") {
                  return userRole === "ADMIN" || userRole === "POWER_EDITOR";
                }
                return true;
              }).map((item) => (
                <Button
                  key={item.type}
                  variant="outlined"
                  size="small"
                  onClick={() => addBlock(item.type as any)}
                  sx={{ textTransform: "none", fontWeight: "bold" }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          </Card>

          {/* Blocks Configuration Panel */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {blocks.length === 0 ? (
              <Card variant="outlined" sx={{ p: 6, textAlign: "center", borderStyle: "dashed", borderColor: "divider", bgcolor: "background.paper" }}>
                <Typography variant="body2" color="text.secondary">
                  Your report has no elements. Add an element from the palette above to build your report.
                </Typography>
              </Card>
            ) : (
              blocks.map((block, index) => (
                <Card key={block.id} sx={{ p: 3, borderRadius: 3, display: "flex", flexDirection: "column", gap: 2, bgcolor: "background.paper", borderColor: "divider" }} variant="outlined">
                  {/* Block Header */}
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid", borderColor: "divider", pb: 1.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Block {index + 1}
                      </Typography>
                      <Chip
                        label={block.type}
                        size="small"
                        color="primary"
                        sx={{ fontWeight: "bold", fontSize: "0.625rem", textTransform: "uppercase", height: 18 }}
                      />
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Button
                        size="small"
                        onClick={() => moveBlock(index, "up")}
                        disabled={index === 0}
                        sx={{ minWidth: 32, p: 0.5, textTransform: "none", fontWeight: "bold" }}
                      >
                        Up
                      </Button>
                      <Button
                        size="small"
                        onClick={() => moveBlock(index, "down")}
                        disabled={index === blocks.length - 1}
                        sx={{ minWidth: 32, p: 0.5, textTransform: "none", fontWeight: "bold" }}
                      >
                        Down
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => removeBlock(block.id)}
                        sx={{ ml: 1, textTransform: "none", fontWeight: "bold" }}
                      >
                        Delete
                      </Button>
                    </Box>
                  </Box>

                  {/* Block Specific Editors */}
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {block.type === "markdown" && (
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.05em", mb: 1, display: "block" }}>
                          Markdown text content
                        </Typography>
                        <TextField
                          fullWidth
                          multiline
                          rows={6}
                          value={block.content || ""}
                          onChange={(e) => updateBlockContent(block.id, e.target.value)}
                          placeholder="Type markdown syntax here..."
                          slotProps={{
                            htmlInput: { style: { fontFamily: "monospace", fontSize: "0.75rem" } }
                          }}
                        />
                      </Box>
                    )}

                    {block.type === "genai" && (
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                        {/* Token Warning Alert */}
                        <Box sx={{ p: 2, borderRadius: 2, bgcolor: "#fffbe6", border: "1px solid #ffe58f", display: "flex", flexDirection: "column", gap: 0.5 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#d48806" }}>
                            Generative AI System Warning
                          </Typography>
                          <Typography variant="caption" sx={{ color: "text.secondary", lineHeight: 1.5 }}>
                            This block dynamically invokes Natural Language Processing. It automatically regenerates on report saves, full views, and exports. Because this consumes third-party AI tokens and adds processing latency to the report builder compiler, please use AI blocks sparingly.
                          </Typography>
                        </Box>

                        {/* Instruction Prompt */}
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.05em", mb: 1, display: "block" }}>
                            GenAI Synthesis Instruction Prompt
                          </Typography>
                          <TextField
                            fullWidth
                            multiline
                            rows={3}
                            value={block.filters.prompt || ""}
                            onChange={(e) => updateBlockFilter(block.id, "prompt", e.target.value)}
                            placeholder="e.g. Summarize the main topics of these publications and suggest future lines of work."
                            size="small"
                          />
                        </Box>

                        {/* Maximum Word Length */}
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.05em", mb: 1, display: "block" }}>
                            Maximum generated text length (words)
                          </Typography>
                          <TextField
                            fullWidth
                            type="number"
                            size="small"
                            value={block.filters.maxLength || 300}
                            onChange={(e) => updateBlockFilter(block.id, "maxLength", parseInt(e.target.value, 10) || 100)}
                            placeholder="300"
                          />
                        </Box>

                        {/* Context Checklist */}
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.05em", mb: 1, display: "block" }}>
                            Select Input Blocks to Feed as Context
                          </Typography>
                          <Box sx={{ display: "flex", flexDirection: "column", gap: 1, p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 2, maxHeight: 150, overflowY: "auto" }}>
                            {blocks.filter((b) => b.id !== block.id && b.type !== "genai").length === 0 ? (
                              <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic" }}>
                                No other static or dynamic blocks available to serve as context.
                              </Typography>
                            ) : (
                              blocks
                                .filter((b) => b.id !== block.id && b.type !== "genai")
                                .map((b) => {
                                  const actualIndex = blocks.findIndex((item) => item.id === b.id);
                                  const isSelected = (block.filters.inputBlockIds || []).includes(b.id);
                                  return (
                                    <FormControlLabel
                                      key={b.id}
                                      control={
                                        <Checkbox
                                          size="small"
                                          checked={isSelected}
                                          onChange={(e) => {
                                            const curr = block.filters.inputBlockIds || [];
                                            const next = e.target.checked
                                              ? [...curr, b.id]
                                              : curr.filter((id) => id !== b.id);
                                            updateBlockFilter(block.id, "inputBlockIds", next);
                                          }}
                                        />
                                      }
                                      label={
                                        <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                                          Block {actualIndex + 1} ({b.type.toUpperCase()})
                                        </Typography>
                                      }
                                    />
                                  );
                                })
                            )}
                          </Box>
                        </Box>

                        {/* Dynamic Length Indicator */}
                        {(() => {
                          const contextLength = getSelectedContextLength(block);
                          const isTruncated = contextLength > 15000;
                          return (
                            <Box sx={{ mt: 0.5 }}>
                              <Typography variant="caption" sx={{ fontWeight: "bold" }} color={isTruncated ? "error.main" : "text.secondary"}>
                                Combined Context Size: {contextLength.toLocaleString()} / 15,000 characters
                              </Typography>
                              {isTruncated && (
                                <Typography variant="caption" sx={{ display: "block", color: "error.main", mt: 0.5, lineHeight: 1.4 }}>
                                  Warning: Selected context blocks exceed 15,000 characters. Input will be automatically truncated, which may omit critical details. Consider narrowing input filter ranges.
                                </Typography>
                              )}
                            </Box>
                          );
                        })()}

                        {/* Regenerate AI Button */}
                        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mt: 1 }}>
                          <Button
                            variant="contained"
                            color="secondary"
                            size="small"
                            disabled={block.isGenerating || !block.filters.prompt?.trim() || !isGenAIDirty(block, blocks)}
                            onClick={() => compileReport(blocks, block.id)}
                            sx={{ textTransform: "none", fontWeight: "bold" }}
                          >
                            {block.isGenerating ? "Generating Summary..." : "Regenerate AI Block Content"}
                          </Button>
                          {block.isGenerating && (
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              onClick={() => cancelGenAIUpdate(block.id)}
                              sx={{ textTransform: "none", fontWeight: "bold" }}
                            >
                              Stop
                            </Button>
                          )}
                        </Box>
                      </Box>
                    )}

                    {block.type === "publications" && (
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 12, sm: 4 }}>
                            <FormControl fullWidth size="small">
                              <InputLabel>Citation format</InputLabel>
                              <Select
                                label="Citation format"
                                value={block.filters.style}
                                onChange={(e) => updateBlockFilter(block.id, "style", e.target.value)}
                              >
                                <MenuItem value="apa">APA Style Guide</MenuItem>
                                <MenuItem value="vancouver">Vancouver Reference List</MenuItem>
                                <MenuItem value="harvard">Harvard Style Manual</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Start Year"
                              type="number"
                              value={block.filters.startYear || ""}
                              onChange={(e) => updateBlockFilter(block.id, "startYear", e.target.value)}
                              placeholder="Min Year"
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField
                              fullWidth
                              size="small"
                              label="End Year"
                              type="number"
                              value={block.filters.endYear || ""}
                              onChange={(e) => updateBlockFilter(block.id, "endYear", e.target.value)}
                              placeholder="Max Year"
                            />
                          </Grid>
                        </Grid>

                        <Box sx={{ borderTop: "1px solid", borderColor: "divider", pt: 2 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.05em", mb: 1, display: "block" }}>
                            Filter by publication types
                          </Typography>
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, p: 1, border: "1px solid", borderColor: "divider", borderRadius: 2, maxHeight: 96, overflowY: "auto" }}>
                            {initData?.publicationTypes.map((type) => {
                              const isSelected = block.filters.types.includes(type);
                              return (
                                <Chip
                                  key={type}
                                  label={type}
                                  size="small"
                                  onClick={() => {
                                    const curr = block.filters.types || [];
                                    const next = curr.includes(type)
                                      ? curr.filter((t) => t !== type)
                                      : [...curr, type];
                                    updateBlockFilter(block.id, "types", next);
                                  }}
                                  color={isSelected ? "primary" : "default"}
                                  variant={isSelected ? "filled" : "outlined"}
                                  sx={{ fontWeight: "bold", fontSize: "0.625rem", borderRadius: 1 }}
                                />
                              );
                            })}
                          </Box>
                        </Box>
                      </Box>
                    )}

                    {block.type !== "markdown" && block.type !== "publications" && block.type !== "genai" && (
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Timeline range (from)"
                              type="number"
                              value={block.filters.startYear || ""}
                              onChange={(e) => updateBlockFilter(block.id, "startYear", e.target.value)}
                              placeholder="Start Year"
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Timeline range (to)"
                              type="number"
                              value={block.filters.endYear || ""}
                              onChange={(e) => updateBlockFilter(block.id, "endYear", e.target.value)}
                              placeholder="End Year"
                            />
                          </Grid>
                        </Grid>

                        {block.type === "scholarships" && (
                          <Box sx={{ borderTop: "1px solid", borderColor: "divider", pt: 2 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.05em", mb: 1, display: "block" }}>
                              Scholarship level types
                            </Typography>
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, p: 1, border: "1px solid", borderColor: "divider", borderRadius: 2, maxHeight: 96, overflowY: "auto" }}>
                              {initData?.scholarshipTypes.map((type) => {
                                const isSelected = block.filters.types.includes(type);
                                return (
                                  <Chip
                                    key={type}
                                    label={type}
                                    size="small"
                                    onClick={() => {
                                      const curr = block.filters.types || [];
                                      const next = curr.includes(type)
                                        ? curr.filter((t) => t !== type)
                                        : [...curr, type];
                                      updateBlockFilter(block.id, "types", next);
                                    }}
                                    color={isSelected ? "primary" : "default"}
                                    variant={isSelected ? "filled" : "outlined"}
                                    sx={{ fontWeight: "bold", fontSize: "0.625rem", borderRadius: 1 }}
                                  />
                                );
                              })}
                            </Box>
                          </Box>
                        )}

                        {block.type === "theses" && (
                          <Box sx={{ borderTop: "1px solid", borderColor: "divider", pt: 2 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.05em", mb: 1, display: "block" }}>
                              Thesis academic level filters
                            </Typography>
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, p: 1, border: "1px solid", borderColor: "divider", borderRadius: 2, maxHeight: 96, overflowY: "auto" }}>
                              {initData?.thesisLevels.map((lvl) => {
                                const isSelected = block.filters.types.includes(lvl);
                                return (
                                  <Chip
                                    key={lvl}
                                    label={lvl}
                                    size="small"
                                    onClick={() => {
                                      const curr = block.filters.types || [];
                                      const next = curr.includes(lvl)
                                        ? curr.filter((t) => t !== lvl)
                                        : [...curr, lvl];
                                      updateBlockFilter(block.id, "types", next);
                                    }}
                                    color={isSelected ? "primary" : "default"}
                                    variant={isSelected ? "filled" : "outlined"}
                                    sx={{ fontWeight: "bold", fontSize: "0.625rem", borderRadius: 1 }}
                                  />
                                );
                              })}
                            </Box>
                          </Box>
                        )}
                      </Box>
                    )}

                    {block.type !== "markdown" && block.type !== "genai" && (
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, borderTop: "1px solid", borderColor: "divider", pt: 2 }}>
                        <Box>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                              Filter by research tags
                            </Typography>
                            <Box sx={{ display: "flex", gap: 1 }}>
                              <Button
                                size="small"
                                sx={{ fontSize: "0.625rem", p: 0, minWidth: 0, textTransform: "none", fontWeight: "bold" }}
                                onClick={() => updateBlockFilter(block.id, "tags", initData?.tags || [])}
                              >
                                Select All
                              </Button>
                              <Typography variant="caption" color="text.secondary">|</Typography>
                              <Button
                                size="small"
                                color="error"
                                sx={{ fontSize: "0.625rem", p: 0, minWidth: 0, textTransform: "none", fontWeight: "bold" }}
                                onClick={() => updateBlockFilter(block.id, "tags", [])}
                              >
                                Clear All
                              </Button>
                            </Box>
                          </Box>
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, p: 1, border: "1px solid", borderColor: "divider", borderRadius: 2, maxHeight: 96, overflowY: "auto" }}>
                            {initData?.tags && initData.tags.length === 0 ? (
                              <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic", p: 0.5 }}>
                                No taxonomy tags available.
                              </Typography>
                            ) : (
                              initData?.tags.map((tag) => {
                                const isSelected = (block.filters.tags || []).includes(tag);
                                return (
                                  <Chip
                                    key={tag}
                                    label={tag}
                                    size="small"
                                    onClick={() => {
                                      const curr = block.filters.tags || [];
                                      const next = curr.includes(tag)
                                        ? curr.filter((t) => t !== tag)
                                        : [...curr, tag];
                                      updateBlockFilter(block.id, "tags", next);
                                    }}
                                    color={isSelected ? "primary" : "default"}
                                    variant={isSelected ? "filled" : "outlined"}
                                    sx={{ fontWeight: "bold", fontSize: "0.625rem", borderRadius: 1 }}
                                  />
                                );
                              })
                            )}
                          </Box>
                        </Box>

                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.05em", mb: 1, display: "block" }}>
                            Filter by related members
                          </Typography>
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, p: 1, border: "1px solid", borderColor: "divider", borderRadius: 2, maxHeight: 96, overflowY: "auto" }}>
                            {initData?.members.map((member) => {
                              const isSelected = block.filters.memberIds.includes(member.id);
                              return (
                                <Chip
                                  key={member.id}
                                  label={`${member.lastName}, ${member.firstName}`}
                                  size="small"
                                  onClick={() => {
                                    const curr = block.filters.memberIds || [];
                                    const next = curr.includes(member.id)
                                      ? curr.filter((id) => id !== member.id)
                                      : [...curr, member.id];
                                    updateBlockFilter(block.id, "memberIds", next);
                                  }}
                                  color={isSelected ? "primary" : "default"}
                                  variant={isSelected ? "filled" : "outlined"}
                                  sx={{ fontWeight: "bold", fontSize: "0.625rem", borderRadius: 1 }}
                                />
                              );
                            })}
                          </Box>
                        </Box>

                        <Grid container spacing={2} sx={{ borderTop: "1px solid", borderColor: "divider", pt: 2 }}>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl fullWidth size="small">
                              <InputLabel>Sort By</InputLabel>
                              <Select
                                label="Sort By"
                                value={block.sort.field}
                                onChange={(e) => updateBlockSort(block.id, "field", e.target.value as any)}
                              >
                                <MenuItem value="year">Timeline / Year</MenuItem>
                                <MenuItem value="title">Title</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl fullWidth size="small">
                              <InputLabel>Direction</InputLabel>
                              <Select
                                label="Direction"
                                value={block.sort.direction}
                                onChange={(e) => updateBlockSort(block.id, "direction", e.target.value as any)}
                              >
                                <MenuItem value="desc">Descending</MenuItem>
                                <MenuItem value="asc">Ascending</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                        </Grid>
                      </Box>
                    )}

                    {block.type !== "markdown" && block.type !== "publications" && block.type !== "genai" && (
                      <Box sx={{ borderTop: "1px solid", borderColor: "divider", pt: 1.5 }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              size="small"
                              checked={block.filters.showSummary}
                              onChange={(e) => updateBlockFilter(block.id, "showSummary", e.target.checked)}
                            />
                          }
                          label={<Typography variant="body2" sx={{ fontWeight: "bold" }}>Show Summary Text (if available)</Typography>}
                        />
                      </Box>
                    )}
                  </Box>

                  {block.type !== "markdown" && block.type !== "genai" && (
                    <Typography variant="caption" sx={{ bgcolor: "action.hover", px: 1.5, py: 0.5, borderRadius: 1, border: "1px solid", borderColor: "divider", display: "inline-block", alignSelf: "flex-start", fontWeight: 500 }} color="text.secondary">
                      Items in preview: {block.compiledItems.length}
                    </Typography>
                  )}
                </Card>
              ))
            )}
          </Box>

        </Grid>

        {/* RIGHT: Live Preview (5 Columns) */}
        <Grid size={{ xs: 12, lg: 5 }} sx={{ position: { lg: "sticky" }, top: { lg: 24 } }}>
          {renderA4Canvas()}
        </Grid>

      </Grid>
    </Box>
  );
}

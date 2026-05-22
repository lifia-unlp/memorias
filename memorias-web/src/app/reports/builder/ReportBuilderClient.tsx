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
} from "../actions";

interface Block {
  id: string;
  type: "markdown" | "publications" | "projects" | "scholarships" | "theses";
  content?: string;
  filters: {
    memberIds: string[];
    types: string[];
    year: string;
    startYear: string;
    endYear: string;
    style: string; // apa, vancouver, harvard
    showSummary: boolean;
  };
  sort: {
    field: "year" | "title";
    direction: "asc" | "desc";
  };
  compiledItems: any[];
}

interface InitData {
  members: Array<{ id: string; firstName: string; lastName: string; slug: string }>;
  publicationYears: number[];
  publicationTypes: string[];
  scholarshipTypes: string[];
  thesisLevels: string[];
}

export default function ReportBuilderClient() {
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
      const blocksToSave = blocks.map(({ id, type, content, filters, sort }) => ({
        id,
        type,
        content,
        filters,
        sort,
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

  // Compile individual blocks using server actions
  const compileReport = async (currentBlocks: Block[] = blocks) => {
    setIsCompiling(true);
    try {
      const compiled = await Promise.all(
        currentBlocks.map(async (block) => {
          if (block.type === "markdown") {
            return { ...block, compiledItems: [] };
          }

          const memberIds = block.filters.memberIds;
          const startY = block.filters.startYear ? parseInt(block.filters.startYear, 10) : undefined;
          const endY = block.filters.endYear ? parseInt(block.filters.endYear, 10) : undefined;

          let items: any[] = [];
          if (block.type === "publications") {
            items = await queryPublications(
              {
                memberIds,
                types: block.filters.types,
                year: "all", // always filter strictly by year range
                style: block.filters.style || "apa",
                startYear: startY,
                endYear: endY,
              },
              block.sort
            );
          } else if (block.type === "projects") {
            items = await queryProjects(
              {
                memberIds,
                startYear: startY,
                endYear: endY,
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
              },
              block.sort
            );
          }

          return { ...block, compiledItems: items };
        })
      );
      setBlocks(compiled);
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
      content: type === "markdown" ? "### Heading\nType your markdown content here." : undefined,
      filters: {
        memberIds: [],
        types: [],
        year: "all",
        startYear: "",
        endYear: "",
        style: "apa",
        showSummary: true,
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
    const updated = blocks.filter((b) => b.id !== id);
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
    if (changedBlock && changedBlock.type !== "markdown") {
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
    if (changedBlock && changedBlock.type !== "markdown") {
      compileReport(updated);
    }
  };

  // Exporters
  const exportMarkdown = () => {
    let md = "";
    blocks.forEach((block) => {
      if (block.type === "markdown") {
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
            if (block.type === "markdown") {
              return (
                <Box key={block.id} sx={{ color: "text.primary" }}>
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
            background: (theme) =>
              theme.palette.mode === "dark"
                ? "linear-gradient(135deg, #052438 0%, #093A54 100%)"
                : "linear-gradient(135deg, #093A54 0%, #0d4b6e 100%)",
            color: "white",
            py: 5,
            px: 4,
            borderRadius: 4,
            boxShadow: "inset 0 -2px 10px rgba(0,0,0,0.1)",
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { xs: "flex-start", md: "center" },
            justifyContent: "space-between",
            gap: 3,
          }}
        >
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 1 }}>
              Saved Reports
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)", maxWidth: 500 }}>
              View, edit, print, or download configurations of your custom research summaries.
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={handleCreateNewReport}
            sx={{
              bgcolor: "white",
              color: "primary.main",
              fontWeight: "bold",
              textTransform: "none",
              "&:hover": { bgcolor: "grey.100" },
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
              ].map((item) => (
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

                    {block.type !== "markdown" && block.type !== "publications" && (
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

                    {block.type !== "markdown" && (
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, borderTop: "1px solid", borderColor: "divider", pt: 2 }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.05em", mb: 1, display: "block" }}>
                            Member relation filter
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

                    {block.type !== "markdown" && block.type !== "publications" && (
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

                  {block.type !== "markdown" && (
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

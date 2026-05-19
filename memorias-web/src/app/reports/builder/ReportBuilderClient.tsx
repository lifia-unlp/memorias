"use client";

import React, { useState, useEffect } from "react";
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
          `• Click OK to OVERWRITE the existing report.\n` +
          `• Click CANCEL to save it as a new separate report (renamed automatically to avoid name collisions).`
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
    return `${startStr} – ${endStr}`;
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
          <h1 key={index} className="text-3xl font-extrabold mt-6 mb-3 border-b border-slate-200 pb-1 text-slate-900 font-sans">
            {formattedLine.replace("# ", "")}
          </h1>
        );
      } else if (formattedLine.startsWith("## ")) {
        return (
          <h2 key={index} className="text-2xl font-bold mt-5 mb-2 border-b border-slate-200 pb-1 text-slate-800 font-sans">
            {formattedLine.replace("## ", "")}
          </h2>
        );
      } else if (formattedLine.startsWith("### ")) {
        return (
          <h3 key={index} className="text-xl font-semibold mt-4 mb-2 text-slate-800 font-sans">
            {formattedLine.replace("### ", "")}
          </h3>
        );
      } else if (formattedLine.startsWith("- ") || formattedLine.startsWith("* ")) {
        return (
          <li
            key={index}
            className="ml-6 list-disc mb-1 text-slate-800"
            dangerouslySetInnerHTML={{ __html: formattedLine.substring(2) }}
          />
        );
      }
      return formattedLine.trim() ? (
        <p
          key={index}
          className="mb-4 text-slate-800 font-sans text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: formattedLine }}
        />
      ) : (
        <div key={index} className="h-2" />
      );
    });
  };

  const renderA4Canvas = (hidePaperHeaders = false) => {
    return (
      <div className="relative bg-white border border-slate-200/80 shadow-xl rounded-2xl p-8 min-h-[600px] overflow-y-auto text-black dark:text-black print-content font-sans w-full max-w-4xl">
        {/* Decorative paper headers - no print */}
        {!hidePaperHeaders && (
          <div className="border-b-2 border-slate-300 pb-4 mb-6 flex justify-between items-center no-print">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Report Preview</span>
              <span className="text-xs font-semibold text-slate-500">{reportTitle || "Untitled Report"}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-mono block">
                Date: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
              </span>
            </div>
          </div>
        )}

        {/* Loader placeholder when compiling */}
        {isCompiling && (
          <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center space-y-3 z-30 no-print rounded-2xl">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <span className="text-xs font-bold text-slate-800">Compiling Report Preview...</span>
          </div>
        )}

        {/* The Actual Plain Page Render */}
        <div className="space-y-8 max-w-full">
          {blocks.map((block) => {
            if (block.type === "markdown") {
              return (
                <div key={block.id} className="markdown-preview mb-4 text-black">
                  {renderMarkdownText(block.content || "")}
                </div>
              );
            }

            if (block.type === "publications") {
              return (
                <div key={block.id} className="publications-preview space-y-3 mb-6">
                  {block.compiledItems.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No publications matched your filters.</p>
                  ) : (
                    <div className="space-y-2">
                      {block.compiledItems.map((pub, i) => (
                        <p
                          key={pub.id || i}
                          className="text-xs text-slate-800 leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: pub.citationHtml }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            if (block.type === "projects") {
              return (
                <div key={block.id} className="projects-preview space-y-4 mb-6">
                  {block.compiledItems.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No projects matched your filters.</p>
                  ) : (
                    block.compiledItems.map((proj, i) => (
                      <div key={proj.id || i} className="text-sm space-y-1 text-slate-800">
                        <p className="font-bold text-slate-900">
                          {proj.title} {proj.code ? `(Code: ${proj.code})` : ""}
                        </p>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          {buildProjectSentence(proj)}
                        </p>
                        {block.filters.showSummary && proj.summary && (
                          <p className="text-xs text-slate-500 leading-relaxed italic mt-1">
                            Summary: {proj.summary}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              );
            }

            if (block.type === "scholarships") {
              return (
                <div key={block.id} className="scholarships-preview space-y-4 mb-6">
                  {block.compiledItems.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No scholarships matched your filters.</p>
                  ) : (
                    block.compiledItems.map((schol, i) => (
                      <div key={schol.id || i} className="text-sm space-y-1 text-slate-800">
                        <p className="font-bold text-slate-900">
                          {schol.title} {schol.type ? `(${schol.type})` : ""}
                        </p>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          {buildScholarshipSentence(schol)}
                        </p>
                        {block.filters.showSummary && schol.summary && (
                          <p className="text-xs text-slate-500 leading-relaxed italic mt-1">
                            Summary: {schol.summary}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              );
            }

            if (block.type === "theses") {
              return (
                <div key={block.id} className="theses-preview space-y-4 mb-6">
                  {block.compiledItems.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No theses matched your filters.</p>
                  ) : (
                    block.compiledItems.map((thesis, i) => (
                      <div key={thesis.id || i} className="text-sm space-y-1 text-slate-800">
                        <p className="font-bold text-slate-900">
                          {thesis.title} {thesis.level ? `(${thesis.level})` : ""}
                        </p>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          {buildThesisSentence(thesis)}
                        </p>
                        {block.filters.showSummary && thesis.summary && (
                          <p className="text-xs text-slate-500 leading-relaxed italic mt-1">
                            Summary: {thesis.summary}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              );
            }

            return null;
          })}
        </div>
      </div>
    );
  };

  // 1. DASHBOARD LIST MODE
  if (viewState === "list") {
    return (
      <div className="flex-1 flex flex-col space-y-8">
        <section className="bg-gradient-to-br from-primary to-primary-hover text-white py-8 px-6 rounded-2xl shadow-md relative overflow-hidden border border-primary/10">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0,50 Q25,30 50,50 T100,50 L100,100 L0,100 Z" fill="currentColor" />
            </svg>
          </div>
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold tracking-tight">Saved Reports</h1>
              <p className="text-blue-100 max-w-xl text-xs leading-relaxed">
                View, edit, print, or download configurations of your custom research summaries.
              </p>
            </div>
            <button
              type="button"
              onClick={handleCreateNewReport}
              className="bg-white hover:bg-slate-100 text-primary font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              Create New Report
            </button>
          </div>
        </section>

        {isLoadingReports ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <span className="text-xs text-slate-500 font-bold">Loading reports...</span>
          </div>
        ) : savedReports.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm max-w-2xl mx-auto space-y-6">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto border border-border">
              <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">No reports found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                You have no saved report configurations yet. Click below to compose your first custom research summary.
              </p>
            </div>
            <button
              type="button"
              onClick={handleCreateNewReport}
              className="bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-xl shadow-md transition-all cursor-pointer"
            >
              Compose Report
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedReports.map((report) => (
              <div
                key={report.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 hover:text-primary transition-colors cursor-pointer" onClick={() => handleViewReport(report)}>
                    {report.title}
                  </h3>
                  <div className="text-[10px] text-slate-500 font-mono space-y-1">
                    <p>Created: {new Date(report.createdAt).toLocaleDateString()}</p>
                    <p>Modified: {new Date(report.updatedAt).toLocaleDateString()}</p>
                    <p>Blocks: {Array.isArray(report.blocks) ? report.blocks.length : 0}</p>
                  </div>
                </div>
                <div className="flex gap-2 pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => handleViewReport(report)}
                    className="flex-1 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white border border-border text-xs font-bold py-2 rounded-lg cursor-pointer text-center"
                  >
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEditReport(report)}
                    className="flex-1 bg-primary hover:bg-primary-hover text-white text-xs font-bold py-2 rounded-lg cursor-pointer text-center"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteReport(report.id)}
                    className="bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-bold px-3 py-2 rounded-lg cursor-pointer text-center"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // 2. FULL SCREEN VIEW MODE
  if (viewState === "view") {
    return (
      <div className="flex-1 flex flex-col space-y-6">
        {/* Sticky top reader menu */}
        <div className="sticky top-0 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl shadow-sm z-50 flex flex-col sm:flex-row items-center justify-between gap-4 no-print">
          <div>
            <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">{reportTitle}</h1>
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Distraction-Free View Mode</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setViewState("list")}
              className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-border cursor-pointer transition-all"
            >
              Back to List
            </button>
            <button
              type="button"
              onClick={() => handleEditReport({ id: reportId, title: reportTitle, blocks })}
              className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-border cursor-pointer transition-all"
            >
              Edit Config
            </button>
            <button
              type="button"
              onClick={exportMarkdown}
              className="bg-white hover:bg-slate-100 text-primary border border-primary/20 text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm cursor-pointer transition-all"
            >
              Export Markdown
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="bg-secondary hover:bg-secondary-hover text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm cursor-pointer transition-all"
            >
              Print to PDF
            </button>
          </div>
        </div>

        {/* Centered Document Sheet */}
        <div className="flex justify-center py-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-border">
          {renderA4Canvas(true)}
        </div>
      </div>
    );
  }

  // 3. EDITOR CANVA MODE
  return (
    <div className="flex-1 flex flex-col space-y-6">
      {/* Dynamic Title Input & Actions Panel */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 no-print">
        <div className="flex-1 w-full space-y-1">
          <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
            Report Title Configuration
          </label>
          <input
            type="text"
            value={reportTitle}
            onChange={(e) => setReportTitle(e.target.value)}
            className="w-full text-sm font-bold text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-950 border border-slate-200 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 px-3 py-2 rounded-xl"
            placeholder="Report Title"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={() => setViewState("list")}
            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-border cursor-pointer transition-all"
          >
            Back to List
          </button>
          <button
            type="button"
            onClick={handleSaveReport}
            className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
          >
            Save Report
          </button>
          {reportId && (
            <button
              type="button"
              onClick={() => handleViewReport({ id: reportId, title: reportTitle, blocks })}
              className="bg-secondary hover:bg-secondary-hover text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
            >
              View Full Screen
            </button>
          )}
        </div>
      </section>

      {/* Builder Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT: Builder & Editor (7 Columns) */}
        <div className="lg:col-span-7 space-y-6 no-print">
          
          {/* Element Palette */}
          <div className="bg-white dark:bg-slate-900 border border-border rounded-2xl p-5 shadow-sm sidebar-palette space-y-4">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-500">
              Add Elements to Report
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => addBlock("markdown")}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-bold px-3 py-2 rounded-xl border border-border cursor-pointer transition-all hover:-translate-y-0.5"
              >
                Markdown Block
              </button>
              <button
                type="button"
                onClick={() => addBlock("publications")}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-bold px-3 py-2 rounded-xl border border-border cursor-pointer transition-all hover:-translate-y-0.5"
              >
                Publications Block
              </button>
              <button
                type="button"
                onClick={() => addBlock("projects")}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-bold px-3 py-2 rounded-xl border border-border cursor-pointer transition-all hover:-translate-y-0.5"
              >
                Projects Block
              </button>
              <button
                type="button"
                onClick={() => addBlock("scholarships")}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-bold px-3 py-2 rounded-xl border border-border cursor-pointer transition-all hover:-translate-y-0.5"
              >
                Scholarships Block
              </button>
              <button
                type="button"
                onClick={() => addBlock("theses")}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-bold px-3 py-2 rounded-xl border border-border cursor-pointer transition-all hover:-translate-y-0.5"
              >
                Thesis Block
              </button>
            </div>
          </div>

          {/* Blocks Configuration Panel */}
          <div className="space-y-4">
            {blocks.length === 0 ? (
              <div className="bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-8 text-center text-slate-400">
                <p className="text-xs font-medium">Your report has no elements. Add an element from the palette above to build your report.</p>
              </div>
            ) : (
              blocks.map((block, index) => (
                <div
                  key={block.id}
                  className="bg-white dark:bg-slate-900 border border-border rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow relative"
                >
                  {/* Block Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Block {index + 1}
                      </span>
                      <span className="bg-primary/10 text-primary text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {block.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Move block ordering buttons */}
                      <button
                        type="button"
                        onClick={() => moveBlock(index, "up")}
                        disabled={index === 0}
                        className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-500 disabled:opacity-30 cursor-pointer"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={() => moveBlock(index, "down")}
                        disabled={index === blocks.length - 1}
                        className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-500 disabled:opacity-30 cursor-pointer"
                      >
                        ▼
                      </button>
                      <button
                        type="button"
                        onClick={() => removeBlock(block.id)}
                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 rounded-lg cursor-pointer ml-1"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Block Specific Editors */}
                  <div className="space-y-4">
                    {block.type === "markdown" && (
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">
                          Markdown text content
                        </label>
                        <textarea
                          rows={6}
                          value={block.content || ""}
                          onChange={(e) => updateBlockContent(block.id, e.target.value)}
                          className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-200 leading-relaxed"
                          placeholder="Type markdown syntax here..."
                        />
                      </div>
                    )}

                    {block.type === "publications" && (
                      <div className="space-y-3.5">
                        {/* Publications top horizontal grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">
                              Citation format
                            </label>
                            <select
                              value={block.filters.style}
                              onChange={(e) => updateBlockFilter(block.id, "style", e.target.value)}
                              className="text-xs px-2.5 py-1.5 rounded-lg border border-border bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 w-full"
                            >
                              <option value="apa">APA Style Guide</option>
                              <option value="vancouver">Vancouver Reference List</option>
                              <option value="harvard">Harvard Style Manual</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">
                              Start Year
                            </label>
                            <input
                              type="number"
                              value={block.filters.startYear || ""}
                              onChange={(e) => updateBlockFilter(block.id, "startYear", e.target.value)}
                              className="text-xs px-2.5 py-1.5 rounded-lg border border-border bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 w-full"
                              placeholder="Min Year (e.g. 2018)"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">
                              End Year
                            </label>
                            <input
                              type="number"
                              value={block.filters.endYear || ""}
                              onChange={(e) => updateBlockFilter(block.id, "endYear", e.target.value)}
                              className="text-xs px-2.5 py-1.5 rounded-lg border border-border bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 w-full"
                              placeholder="Max Year (e.g. 2024)"
                            />
                          </div>
                        </div>

                        {/* Types filter selection */}
                        <div className="space-y-1.5 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                          <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">
                            Filter by publication types
                          </label>
                          <div className="flex flex-wrap gap-1 p-1.5 bg-slate-50 dark:bg-slate-950 border border-border rounded-lg max-h-24 overflow-y-auto">
                            {initData?.publicationTypes.map((type) => (
                              <button
                                key={type}
                                type="button"
                                onClick={() => {
                                  const curr = block.filters.types || [];
                                  const next = curr.includes(type)
                                    ? curr.filter((t) => t !== type)
                                    : [...curr, type];
                                  updateBlockFilter(block.id, "types", next);
                                }}
                                className={`text-[10px] font-semibold px-2 py-1 rounded-md border transition-all cursor-pointer ${
                                  block.filters.types.includes(type)
                                    ? "bg-primary text-white border-primary"
                                    : "bg-white dark:bg-slate-900 border-border text-slate-600 dark:text-slate-400"
                                }`}
                              >
                                {type}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {block.type !== "markdown" && block.type !== "publications" && (
                      <div className="space-y-3.5">
                        {/* Timeline horizontal range */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">
                              Timeline range (from)
                            </label>
                            <input
                              type="number"
                              value={block.filters.startYear || ""}
                              onChange={(e) => updateBlockFilter(block.id, "startYear", e.target.value)}
                              className="text-xs px-2.5 py-1.5 rounded-lg border border-border bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 w-full"
                              placeholder="Start year filter (e.g. 2020)"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">
                              Timeline range (to)
                            </label>
                            <input
                              type="number"
                              value={block.filters.endYear || ""}
                              onChange={(e) => updateBlockFilter(block.id, "endYear", e.target.value)}
                              className="text-xs px-2.5 py-1.5 rounded-lg border border-border bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 w-full"
                              placeholder="End year filter (e.g. 2025)"
                            />
                          </div>
                        </div>

                        {/* Level types selector (for scholarship & thesis) */}
                        {block.type === "scholarships" && (
                          <div className="space-y-1.5 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                            <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">
                              Scholarship level types
                            </label>
                            <div className="flex flex-wrap gap-1 p-1.5 bg-slate-50 dark:bg-slate-950 border border-border rounded-lg max-h-24 overflow-y-auto">
                              {initData?.scholarshipTypes.map((type) => (
                                <button
                                  key={type}
                                  type="button"
                                  onClick={() => {
                                    const curr = block.filters.types || [];
                                    const next = curr.includes(type)
                                      ? curr.filter((t) => t !== type)
                                      : [...curr, type];
                                    updateBlockFilter(block.id, "types", next);
                                  }}
                                  className={`text-[10px] font-semibold px-2 py-1 rounded-md border transition-all cursor-pointer ${
                                    block.filters.types.includes(type)
                                      ? "bg-primary text-white border-primary"
                                      : "bg-white dark:bg-slate-900 border-border text-slate-600 dark:text-slate-400"
                                  }`}
                                >
                                  {type}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {block.type === "theses" && (
                          <div className="space-y-1.5 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                            <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">
                              Thesis academic level filters
                            </label>
                            <div className="flex flex-wrap gap-1 p-1.5 bg-slate-50 dark:bg-slate-950 border border-border rounded-lg max-h-24 overflow-y-auto">
                              {initData?.thesisLevels.map((lvl) => (
                                <button
                                  key={lvl}
                                  type="button"
                                  onClick={() => {
                                    const curr = block.filters.types || [];
                                    const next = curr.includes(lvl)
                                      ? curr.filter((t) => t !== lvl)
                                      : [...curr, lvl];
                                    updateBlockFilter(block.id, "types", next);
                                  }}
                                  className={`text-[10px] font-semibold px-2 py-1 rounded-md border transition-all cursor-pointer ${
                                    block.filters.types.includes(lvl)
                                      ? "bg-primary text-white border-primary"
                                      : "bg-white dark:bg-slate-900 border-border text-slate-600 dark:text-slate-400"
                                  }`}
                                >
                                  {lvl}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Member selection and sort configurations */}
                    {block.type !== "markdown" && (
                      <div className="space-y-3.5 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                        {/* Member filtering */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">
                            Member relation filter
                          </label>
                          <div className="flex flex-wrap gap-1 p-1.5 bg-slate-50 dark:bg-slate-950 border border-border rounded-lg max-h-24 overflow-y-auto">
                            {initData?.members.map((member) => (
                              <button
                                key={member.id}
                                type="button"
                                onClick={() => {
                                  const curr = block.filters.memberIds || [];
                                  const next = curr.includes(member.id)
                                    ? curr.filter((id) => id !== member.id)
                                    : [...curr, member.id];
                                  updateBlockFilter(block.id, "memberIds", next);
                                }}
                                className={`text-[10px] font-semibold px-2 py-1 rounded-md border transition-all cursor-pointer ${
                                  block.filters.memberIds.includes(member.id)
                                    ? "bg-primary text-white border-primary"
                                    : "bg-white dark:bg-slate-900 border-border text-slate-600 dark:text-slate-400"
                                }`}
                              >
                                {member.lastName}, {member.firstName}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Sort Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">
                              Sort By
                            </label>
                            <select
                              value={block.sort.field}
                              onChange={(e) => updateBlockSort(block.id, "field", e.target.value as any)}
                              className="text-xs px-2.5 py-1.5 rounded-lg border border-border bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 w-full"
                            >
                              <option value="year">Timeline / Year</option>
                              <option value="title">Title</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">
                              Direction
                            </label>
                            <select
                              value={block.sort.direction}
                              onChange={(e) => updateBlockSort(block.id, "direction", e.target.value as any)}
                              className="text-xs px-2.5 py-1.5 rounded-lg border border-border bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 w-full"
                            >
                              <option value="desc">Descending</option>
                              <option value="asc">Ascending</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Block Summary text option toggler */}
                    {block.type !== "markdown" && block.type !== "publications" && (
                      <div className="flex items-center gap-2 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                        <input
                          id={`summary-toggle-${block.id}`}
                          type="checkbox"
                          checked={block.filters.showSummary}
                          onChange={(e) => updateBlockFilter(block.id, "showSummary", e.target.checked)}
                          className="w-3.5 h-3.5 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                        />
                        <label
                          htmlFor={`summary-toggle-${block.id}`}
                          className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
                        >
                          Show Summary Text (if available)
                        </label>
                      </div>
                    )}

                  </div>

                  {/* Compiled items summary counter */}
                  {block.type !== "markdown" && (
                    <div className="bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-lg border border-border text-[10px] text-slate-500 font-medium">
                      Items in preview: {block.compiledItems.length}
                    </div>
                  )}

                </div>
              ))
            )}
          </div>

        </div>

        {/* RIGHT: Live Preview (5 Columns) */}
        <div className="lg:col-span-5 space-y-6">
          {renderA4Canvas()}
        </div>

      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { getReports, saveReport, deleteReport } from "../../actions";
import { Block } from "../useReportCompiler";

export function useSavedReports() {
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

  const handleSaveReport = async (blocks: Block[], setIsCompiling: (val: boolean) => void) => {
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

  const handleEditReport = async (
    report: any,
    setBlocks: (blocks: Block[]) => void,
    compileFn: (blocks: Block[]) => Promise<void>
  ) => {
    setReportId(report.id);
    setReportTitle(report.title);
    const parsedBlocks = (report.blocks as any[]).map((block) => ({
      ...block,
      filters: {
        ...block.filters,
        tags: block.filters?.tags ?? [],
        prompt: block.type === "genai" ? (block.filters?.prompt ?? "Summarize the major highlights.") : undefined,
        maxLength: block.type === "genai" ? (block.filters?.maxLength ?? 300) : undefined,
        inputBlockIds: block.type === "genai" ? (block.filters?.inputBlockIds ?? []) : undefined,
      },
      lastGeneratedConfig: block.lastGeneratedConfig,
      compiledItems: [],
    }));
    setBlocks(parsedBlocks);
    setViewState("editor");
    await compileFn(parsedBlocks);
  };

  const handleCreateNewReport = (
    setBlocks: (blocks: Block[]) => void,
    compileFn: (blocks: Block[]) => Promise<void>
  ) => {
    setReportId(null);
    setReportTitle("New Research Report");
    const defaultBlocks: Block[] = [
      {
        id: "welcome-md",
        type: "markdown",
        content:
          "# Research Report\nThis report has been compiled dynamically using the MEMORIAS Research Portal.\n\nUse the builder tools to configure elements, sort criteria, and filter by members or years.",
        filters: { memberIds: [], types: [], year: "all", startYear: "", endYear: "", style: "apa", showSummary: true },
        sort: { field: "year", direction: "desc" },
        compiledItems: [],
      },
    ];
    setBlocks(defaultBlocks);
    setViewState("editor");
    compileFn(defaultBlocks);
  };

  const handleViewReport = async (
    report: any,
    setBlocks: (blocks: Block[]) => void,
    compileFn: (blocks: Block[]) => Promise<void>
  ) => {
    setReportId(report.id);
    setReportTitle(report.title);
    const parsedBlocks = (report.blocks as any[]).map((block) => ({
      ...block,
      filters: {
        ...block.filters,
        tags: block.filters?.tags ?? [],
        prompt: block.type === "genai" ? (block.filters?.prompt ?? "Summarize the major highlights.") : undefined,
        maxLength: block.type === "genai" ? (block.filters?.maxLength ?? 300) : undefined,
        inputBlockIds: block.type === "genai" ? (block.filters?.inputBlockIds ?? []) : undefined,
      },
      lastGeneratedConfig: block.lastGeneratedConfig,
      compiledItems: [],
    }));
    setBlocks(parsedBlocks);
    setViewState("view");
    await compileFn(parsedBlocks);
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

  return {
    viewState,
    setViewState,
    savedReports,
    reportId,
    setReportId,
    reportTitle,
    setReportTitle,
    isLoadingReports,
    fetchSavedReports,
    handleSaveReport,
    handleEditReport,
    handleCreateNewReport,
    handleViewReport,
    handleDeleteReport,
  };
}

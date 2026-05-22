"use client";

import React, { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import {
  deleteTagGlobally,
  mergeTags,
  isOpenAIConfigured,
  getAutoTaggerQueueAction,
  executeAutoTagBatchAction,
  getTagsWithCountsAdmin,
  addSystemTag,
} from "./actions";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Snackbar,
  Alert,
  Checkbox,
  Chip,
  FormControlLabel,
  RadioGroup,
  Radio,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
} from "@mui/material";

interface TagInfo {
  tag: string;
  count: number;
}

interface TagsCurationClientProps {
  initialTags: TagInfo[];
}

export function TagsCurationClient({ initialTags }: TagsCurationClientProps) {
  const [tags, setTags] = useState<TagInfo[]>(initialTags);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  // AI Auto-Tagger States
  const [isOpenAIEnabled, setIsOpenAIEnabled] = useState(false);
  const [checkingConfig, setCheckingConfig] = useState(true);
  const [selectedModel, setSelectedModel] = useState("gpt-4o-mini");
  const [selectedTargets, setSelectedTargets] = useState<string[]>(["publication"]);
  const [selectedMode, setSelectedMode] = useState<"skip" | "merge" | "replace">("skip");
  const [isAutoTagging, setIsAutoTagging] = useState(false);
  const [taggingProgress, setTaggingProgress] = useState<{ current: number; total: number } | null>(null);

  // Check if OpenAI is configured in the environment on mount
  useEffect(() => {
    async function checkOpenAI() {
      try {
        const configured = await isOpenAIConfigured();
        setIsOpenAIEnabled(configured);
      } catch (err) {
        console.error("Failed to check OpenAI key configuration:", err);
      } finally {
        setCheckingConfig(false);
      }
    }
    checkOpenAI();
  }, []);

  // Active modal / action states
  const [activeRenameTag, setActiveRenameTag] = useState<TagInfo | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const [activeMergeTag, setActiveMergeTag] = useState<TagInfo | null>(null);
  const [mergeTargetValue, setMergeTargetValue] = useState("");

  const [activeDeleteTag, setActiveDeleteTag] = useState<TagInfo | null>(null);

  const [activeAddTag, setActiveAddTag] = useState(false);
  const [addTagValue, setAddTagValue] = useState("");

  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
  };

  // Filtered tags based on search
  const filteredTags = tags.filter((t) =>
    t.tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 1. Delete Action Handler
  const handleDelete = (tagToDelete: string) => {
    startTransition(async () => {
      try {
        const res = await deleteTagGlobally(tagToDelete);
        if (res.success) {
          setTags((prev) => prev.filter((t) => t.tag !== tagToDelete));
          showNotification("success", `Successfully deleted tag "${tagToDelete}" globally.`);
          setActiveDeleteTag(null);
        }
      } catch (err: any) {
        showNotification("error", err?.message || "Failed to delete tag.");
      }
    });
  };

  // 1.5 Add Tag Handler
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTag = addTagValue.trim().toLowerCase();
    if (!newTag) return;

    startTransition(async () => {
      try {
        const res = await addSystemTag(newTag);
        if (res.success) {
          setTags((prev) => {
            const exists = prev.find((t) => t.tag === newTag);
            if (exists) return prev;
            return [...prev, { tag: newTag, count: 0 }].sort(
              (a, b) => b.count - a.count || a.tag.localeCompare(b.tag)
            );
          });
          showNotification("success", `Successfully added tag "${newTag}".`);
          setActiveAddTag(false);
          setAddTagValue("");
        }
      } catch (err: any) {
        showNotification("error", err?.message || "Failed to add tag.");
      }
    });
  };

  // 2. Rename / Edit Action Handler (Rename is technically merging the old tag name into the new one!)
  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRenameTag) return;
    const target = renameValue.trim().toLowerCase();
    if (!target) return;

    startTransition(async () => {
      try {
        const res = await mergeTags(activeRenameTag.tag, target);
        if (res.success) {
          // Re-update internal state local list
          setTags((prev) => {
            const next = [...prev];
            const sourceIdx = next.findIndex((t) => t.tag === activeRenameTag.tag);
            const targetIdx = next.findIndex((t) => t.tag === target);

            if (targetIdx !== -1) {
              // Target already exists, aggregate count
              next[targetIdx].count += activeRenameTag.count;
              next.splice(sourceIdx, 1);
            } else {
              // Just rename the existing element
              next[sourceIdx].tag = target;
            }
            return next.sort((a, b) => b.count - a.count);
          });

          showNotification(
            "success",
            `Successfully renamed "${activeRenameTag.tag}" to "${target}" globally.`
          );
          setActiveRenameTag(null);
          setRenameValue("");
        }
      } catch (err: any) {
        showNotification("error", err?.message || "Failed to rename tag.");
      }
    });
  };

  // 3. Merge Action Handler
  const handleMergeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMergeTag) return;
    const target = mergeTargetValue.trim().toLowerCase();
    if (!target || target === activeMergeTag.tag) return;

    startTransition(async () => {
      try {
        const res = await mergeTags(activeMergeTag.tag, target);
        if (res.success) {
          setTags((prev) => {
            const next = [...prev];
            const sourceIdx = next.findIndex((t) => t.tag === activeMergeTag.tag);
            const targetIdx = next.findIndex((t) => t.tag === target);

            if (targetIdx !== -1) {
              next[targetIdx].count += activeMergeTag.count;
            } else {
              next.push({ tag: target, count: activeMergeTag.count });
            }
            next.splice(sourceIdx, 1);
            return next.sort((a, b) => b.count - a.count);
          });

          showNotification(
            "success",
            `Successfully merged "${activeMergeTag.tag}" into "${target}" globally.`
          );
          setActiveMergeTag(null);
          setMergeTargetValue("");
        }
      } catch (err: any) {
        showNotification("error", err?.message || "Failed to merge tags.");
      }
    });
  };

  // 4. Batch Auto-Tagger Handler
  const handleRunAutoTagger = async () => {
    if (selectedTargets.length === 0) {
      showNotification("error", "Please select at least one target collection to auto-tag.");
      return;
    }

    setIsAutoTagging(true);
    setTaggingProgress(null);
    showNotification("success", "Constructing the queue of items to tag...");

    try {
      // 1. Fetch queue items
      const queue = await getAutoTaggerQueueAction({
        targets: selectedTargets,
        mode: selectedMode,
      });

      if (queue.length === 0) {
        showNotification("success", "No matching items found to auto-tag.");
        setIsAutoTagging(false);
        return;
      }

      setTaggingProgress({ current: 0, total: queue.length });
      showNotification("success", `AI Auto-Tagger running. Processing ${queue.length} elements...`);

      // 2. Loop and process in batches of 15
      const batchSize = 15;
      let processed = 0;

      for (let i = 0; i < queue.length; i += batchSize) {
        const batch = queue.slice(i, i + batchSize);

        const res = await executeAutoTagBatchAction({
          model: selectedModel,
          mode: selectedMode,
          tasks: batch,
        });

        if (res.success) {
          processed += batch.length;
          setTaggingProgress({ current: Math.min(processed, queue.length), total: queue.length });
        } else {
          throw new Error("Failed to process tag batch.");
        }
      }

      showNotification(
        "success",
        `AI Auto-Tagger finished successfully! Processed and updated: ${queue.length} elements.`
      );

      // Refresh local curation list
      const updatedTags = await getTagsWithCountsAdmin();
      setTags(updatedTags);
    } catch (err: any) {
      showNotification("error", err?.message || "An unexpected error occurred during execution.");
    } finally {
      setIsAutoTagging(false);
      setTaggingProgress(null);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {/* Notifications */}
      <Snackbar
        open={!!notification}
        autoHideDuration={5000}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        {notification ? (
          <Alert
            onClose={() => setNotification(null)}
            severity={notification.type}
            icon={false}
            sx={{ width: "100%", borderRadius: 3, fontWeight: "bold" }}
          >
            {notification.message}
          </Alert>
        ) : undefined}
      </Snackbar>

      {/* Header Info */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "center" },
          gap: 2,
          pb: 3,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box sx={{ spaceY: 1 }}>
          <Typography variant="h1" sx={{ fontSize: "1.75rem", fontWeight: 800, color: "text.primary" }}>
            Taxonomy Curation Tools
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Global management portal to rename, merge synonyms, or remove classification tags.
          </Typography>
        </Box>
        <Button
          component={Link}
          href="/"
          variant="outlined"
          color="inherit"
          sx={{
            textTransform: "none",
            borderRadius: 3,
            fontWeight: "bold",
            fontSize: "0.8125rem",
          }}
        >
          Home Dashboard
        </Button>
      </Box>

      {/* Stats Counter Cards */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card variant="outlined" sx={{ borderRadius: 4 }}>
            <CardContent>
              <Typography variant="caption" sx={{ fontWeight: "extrabold", color: "text.secondary", textTransform: "uppercase", tracking: "wider" }}>
                Unique Keywords
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, color: "primary.main", mt: 1 }}>
                {tags.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card variant="outlined" sx={{ borderRadius: 4 }}>
            <CardContent>
              <Typography variant="caption" sx={{ fontWeight: "extrabold", color: "text.secondary", textTransform: "uppercase", tracking: "wider" }}>
                Total Classifications
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, color: "text.primary", mt: 1 }}>
                {tags.reduce((sum, t) => sum + t.count, 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card variant="outlined" sx={{ borderRadius: 4 }}>
            <CardContent>
              <Typography variant="caption" sx={{ fontWeight: "extrabold", color: "text.secondary", textTransform: "uppercase", tracking: "wider" }}>
                Highly Popular (5+ uses)
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, color: "success.main", mt: 1 }}>
                {tags.filter((t) => t.count >= 5).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* OpenAI Auto-Tagger Control Card */}
      <Paper variant="outlined" sx={{ borderRadius: 5, p: 4 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", md: "center" },
            gap: 2,
            pb: 3,
            mb: 3,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: "extrabold", color: "text.primary" }}>
              Global AI Auto-Tagger Suite
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
              Batch seed or update taxonomy classifications across the entire laboratory database.
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              px: 2,
              py: 0.5,
              borderRadius: 3,
              bgcolor: "action.hover",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: isAutoTagging
                  ? "warning.main"
                  : checkingConfig
                  ? "text.disabled"
                  : isOpenAIEnabled
                  ? "success.main"
                  : "error.main",
              }}
            />
            <Typography variant="caption" sx={{ fontWeight: "black", textTransform: "uppercase", tracking: "wider" }}>
              {isAutoTagging
                ? "Processing..."
                : checkingConfig
                ? "Checking Status..."
                : isOpenAIEnabled
                ? "OpenAI Connected"
                : "OpenAI Offline"}
            </Typography>
          </Box>
        </Box>

        {checkingConfig ? (
          <Box sx={{ py: 4, display: "flex", justifyContent: "center", alignItems: "center" }}>
            <CircularProgress size={24} sx={{ mr: 2 }} />
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: "bold" }}>
              Checking taxonomy tagger configuration...
            </Typography>
          </Box>
        ) : !isOpenAIEnabled && selectedTargets.some((t) => t !== "member") ? (
          <Alert severity="warning" icon={false} sx={{ borderRadius: 4, mb: 4 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: "black", textTransform: "uppercase", tracking: "wider", mb: 0.5 }}>
              AI Classification Disabled
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              To unlock database-wide OpenAI semantic tagging for Publications, Projects, Theses, and Scholarships, please configure the <strong>OPENAI_API_KEY</strong> environment variable in your local <code>.env</code> file and restart the development server.
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Note: You can still run local mathematical derivation for Members without an API key.
            </Typography>
          </Alert>
        ) : null}

        <Grid container spacing={4} sx={{ opacity: isAutoTagging ? 0.5 : 1, pointerEvents: isAutoTagging ? "none" : "auto" }}>
          {/* Column 1: Targets Choice */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="caption" sx={{ fontWeight: "extrabold", textTransform: "uppercase", color: "text.secondary", mb: 2, display: "block" }}>
              1. Target Collections
            </Typography>
            <Box
              sx={{
                bgcolor: "action.hover",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 4,
                p: 2.5,
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              {[
                { key: "publication", label: "Publications", desc: "Scientific abstract taxonomy" },
                { key: "project", label: "Projects", desc: "Grant summary fields" },
                { key: "thesis", label: "Theses", desc: "Dissertation summaries" },
                { key: "scholarship", label: "Scholarships", desc: "Research proposals" },
                { key: "member", label: "Members", desc: "Derives top 3 tags from outputs (Free!)" },
              ].map((item) => {
                const isSelected = selectedTargets.includes(item.key);
                return (
                  <FormControlLabel
                    key={item.key}
                    control={
                      <Checkbox
                        size="small"
                        checked={isSelected}
                        disabled={isAutoTagging}
                        onChange={() => {
                          setSelectedTargets((prev) =>
                            isSelected ? prev.filter((t) => t !== item.key) : [...prev, item.key]
                          );
                        }}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                          {item.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", lineHeight: 1.1 }}>
                          {item.desc}
                        </Typography>
                      </Box>
                    }
                    sx={{ alignItems: "flex-start", m: 0 }}
                  />
                );
              })}
            </Box>
          </Grid>

          {/* Column 2: Parameters Choice */}
          <Grid size={{ xs: 12, md: 4 }} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Box>
              <Typography variant="caption" sx={{ fontWeight: "extrabold", textTransform: "uppercase", color: "text.secondary", mb: 1, display: "block" }}>
                2. OpenAI Model
              </Typography>
              <FormControl size="small" fullWidth>
                <Select
                  value={selectedModel}
                  disabled={isAutoTagging || (!isOpenAIEnabled && selectedTargets.some((t) => t !== "member"))}
                  onChange={(e) => setSelectedModel(e.target.value as string)}
                  sx={{ borderRadius: 3 }}
                >
                  <MenuItem value="gpt-4o-mini">gpt-4o-mini (Fast & Cheap)</MenuItem>
                  <MenuItem value="gpt-4o">gpt-4o (High Quality)</MenuItem>
                  <MenuItem value="gpt-3.5-turbo">gpt-3.5-turbo (Legacy)</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ fontWeight: "extrabold", textTransform: "uppercase", color: "text.secondary", mb: 1, display: "block" }}>
                3. Update Strategy
              </Typography>
              <Box
                sx={{
                  bgcolor: "action.hover",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 4,
                  p: 2.5,
                }}
              >
                <RadioGroup value={selectedMode} onChange={(e) => setSelectedMode(e.target.value as any)}>
                  {[
                    { key: "skip", label: "Skip existing", desc: "Only tag records currently without tags." },
                    { key: "merge", label: "Merge recommendations", desc: "Keep current tags and append suggestions." },
                    { key: "replace", label: "Clean & Replace", desc: "Discard current tags and rewrite." },
                  ].map((item) => (
                    <FormControlLabel
                      key={item.key}
                      value={item.key}
                      control={<Radio size="small" />}
                      label={
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                            {item.label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: "block", lineHeight: 1.1 }}>
                            {item.desc}
                          </Typography>
                        </Box>
                      }
                      sx={{ alignItems: "flex-start", m: 0, mb: 1.5, "&:last-child": { mb: 0 } }}
                    />
                  ))}
                </RadioGroup>
              </Box>
            </Box>
          </Grid>

          {/* Column 3: Summary / Trigger */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box
              sx={{
                bgcolor: "action.hover",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 5,
                p: 3,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography variant="caption" sx={{ fontWeight: "extrabold", textTransform: "uppercase", color: "text.secondary", display: "block" }}>
                  Tagger Summary
                </Typography>
                <Typography variant="body2">
                  Model: <strong>{selectedModel}</strong>
                </Typography>
                <Typography variant="body2">
                  Collections: <strong>{selectedTargets.length} selected</strong>
                </Typography>
                <Typography variant="body2">
                  Strategy: <strong>{selectedMode === "skip" ? "Skip tagged items" : selectedMode === "merge" ? "Merge suggestions" : "Rewrite all"}</strong>
                </Typography>

                <Alert severity="info" icon={false} sx={{ borderRadius: 3, mt: 1 }}>
                  OpenAI requests are batched in groups of 15 items to minimize API calls, prompt tokens, and costs.
                </Alert>
              </Box>

              <Box>
                {taggingProgress && (
                  <Box sx={{ mt: 3, mb: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                        Progress
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                        {taggingProgress.current} / {taggingProgress.total}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(taggingProgress.current / taggingProgress.total) * 100}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                )}

                <Button
                  fullWidth
                  variant="contained"
                  disabled={
                    isAutoTagging ||
                    selectedTargets.length === 0 ||
                    (!isOpenAIEnabled && selectedTargets.some((t) => t !== "member"))
                  }
                  onClick={handleRunAutoTagger}
                  sx={{
                    mt: 3,
                    py: 1.5,
                    borderRadius: 3,
                    fontWeight: "black",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  {isAutoTagging ? (
                    <>
                      <CircularProgress size={16} color="inherit" sx={{ mr: 1 }} />
                      Running AI Tagger...
                    </>
                  ) : (
                    "Execute Auto-Tagger"
                  )}
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Grid: Control Table */}
      <Paper variant="outlined" sx={{ borderRadius: 5, p: 4 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: 2,
            pb: 3,
            mb: 3,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: "extrabold", color: "text.primary" }}>
            Active Taxonomy Register
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: { xs: "100%", sm: "auto" } }}>
            <TextField
              size="small"
              placeholder="Search tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                width: { xs: "100%", sm: 240 },
                "& .MuiOutlinedInput-root": { borderRadius: 3 },
              }}
            />
            <Button
              variant="contained"
              onClick={() => {
                setActiveAddTag(true);
                setAddTagValue("");
              }}
              sx={{ borderRadius: 3, fontWeight: "bold", textTransform: "none", whitespace: "nowrap" }}
            >
              Add Tag
            </Button>
          </Box>
        </Box>

        {filteredTags.length === 0 ? (
          <Box sx={{ py: 8, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: "medium" }}>
              No classifications found matching search filter.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "extrabold", textTransform: "uppercase", fontSize: "0.6875rem", color: "text.secondary" }}>
                    Tag Reference
                  </TableCell>
                  <TableCell sx={{ fontWeight: "extrabold", textTransform: "uppercase", fontSize: "0.6875rem", color: "text.secondary" }}>
                    Frequency
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: "extrabold", textTransform: "uppercase", fontSize: "0.6875rem", color: "text.secondary" }}>
                    Curation Operations
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTags.map((tagInfo) => (
                  <TableRow key={tagInfo.tag} hover>
                    <TableCell sx={{ py: 1.5 }}>
                      <Chip
                        label={tagInfo.tag}
                        variant="outlined"
                        sx={{
                          borderRadius: 2,
                          fontFamily: "monospace",
                          fontSize: "0.8125rem",
                          fontWeight: "bold",
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Chip
                        label={`${tagInfo.count} times`}
                        color="primary"
                        variant="filled"
                        size="small"
                        sx={{
                          fontWeight: "black",
                          fontSize: "0.75rem",
                          bgcolor: "primary.light",
                          color: "primary.contrastText",
                        }}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ py: 1.5 }}>
                      <Box sx={{ display: "inline-flex", gap: 1 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          disabled={isPending}
                          onClick={() => {
                            setActiveRenameTag(tagInfo);
                            setRenameValue(tagInfo.tag);
                          }}
                          sx={{ textTransform: "none", borderRadius: 2, fontWeight: "bold" }}
                        >
                          Rename
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          color="info"
                          disabled={isPending}
                          onClick={() => {
                            setActiveMergeTag(tagInfo);
                            setMergeTargetValue("");
                          }}
                          sx={{ textTransform: "none", borderRadius: 2, fontWeight: "bold" }}
                        >
                          Merge
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          color="error"
                          disabled={isPending}
                          onClick={() => setActiveDeleteTag(tagInfo)}
                          sx={{ textTransform: "none", borderRadius: 2, fontWeight: "bold" }}
                        >
                          Delete
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* ========================================================== */}
      {/* Curative Action Overlays (Modals) */}
      {/* ========================================================== */}

      {/* 1. Rename Dialog */}
      <Dialog
        open={!!activeRenameTag}
        onClose={() => {
          setActiveRenameTag(null);
          setRenameValue("");
        }}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 4, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: "black" }}>Rename Classification Tag</DialogTitle>
        <DialogContent>
          <DialogContentText variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            This renames <code>{activeRenameTag?.tag}</code> globally across all models.
          </DialogContentText>
          <TextField
            fullWidth
            required
            label="New Identifier"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            placeholder="e.g. artificial intelligence"
            variant="outlined"
            size="small"
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
          />
          <Typography variant="caption" color="warning.main" sx={{ display: "block", mt: 2, fontWeight: "bold" }}>
            Note: If the target name already exists, the tags will be merged and counts aggregated automatically.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => {
              setActiveRenameTag(null);
              setRenameValue("");
            }}
            disabled={isPending}
            sx={{ textTransform: "none", fontWeight: "bold" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={isPending || !renameValue.trim() || renameValue.trim().toLowerCase() === activeRenameTag?.tag}
            onClick={handleRenameSubmit}
            sx={{ textTransform: "none", borderRadius: 3, fontWeight: "bold" }}
          >
            {isPending ? "Renaming..." : "Save Rename"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 2. Merge Dialog */}
      <Dialog
        open={!!activeMergeTag}
        onClose={() => {
          setActiveMergeTag(null);
          setMergeTargetValue("");
        }}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 4, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: "black" }}>Merge Taxonomy Tag</DialogTitle>
        <DialogContent>
          <DialogContentText variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            This collapses all instances of <code>{activeMergeTag?.tag}</code> into another existing tag globally.
          </DialogContentText>
          <FormControl size="small" fullWidth required>
            <InputLabel id="merge-target-label">Target Tag Name</InputLabel>
            <Select
              labelId="merge-target-label"
              value={mergeTargetValue}
              onChange={(e) => setMergeTargetValue(e.target.value as string)}
              label="Target Tag Name"
              sx={{ borderRadius: 3 }}
            >
              <MenuItem value="">
                <em>Select Merge Destination...</em>
              </MenuItem>
              {tags
                .filter((t) => t.tag !== activeMergeTag?.tag)
                .map((t) => (
                  <MenuItem key={t.tag} value={t.tag}>
                    {t.tag} ({t.count} items)
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2 }}>
            All records matching &ldquo;{activeMergeTag?.tag}&rdquo; will be updated to point to the selected tag instead. Duplicate allocations will be cleaned automatically.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => {
              setActiveMergeTag(null);
              setMergeTargetValue("");
            }}
            disabled={isPending}
            sx={{ textTransform: "none", fontWeight: "bold" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="info"
            disabled={isPending || !mergeTargetValue}
            onClick={handleMergeSubmit}
            sx={{ textTransform: "none", borderRadius: 3, fontWeight: "bold" }}
          >
            {isPending ? "Merging..." : "Complete Merge"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 3. Delete Confirmation Dialog */}
      <Dialog
        open={!!activeDeleteTag}
        onClose={() => setActiveDeleteTag(null)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 4, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: "black" }}>Delete Tag Globally?</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <DialogContentText variant="body2" color="text.secondary">
            Are you sure you want to delete <strong>{activeDeleteTag?.tag}</strong>?
          </DialogContentText>
          <Alert severity="error" icon={false} sx={{ borderRadius: 3 }}>
            This tag will be stripped from all <strong>{activeDeleteTag?.count}</strong> record(s) where it is currently used. <strong>This action is permanent and cannot be undone.</strong>
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setActiveDeleteTag(null)} disabled={isPending} sx={{ textTransform: "none", fontWeight: "bold" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={isPending}
            onClick={() => activeDeleteTag && handleDelete(activeDeleteTag.tag)}
            sx={{ textTransform: "none", borderRadius: 3, fontWeight: "bold" }}
          >
            {isPending ? "Deleting..." : "Permanently Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 4. Add Dialog */}
      <Dialog
        open={activeAddTag}
        onClose={() => {
          setActiveAddTag(false);
          setAddTagValue("");
        }}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 4, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: "black" }}>Add New Tag</DialogTitle>
        <DialogContent>
          <DialogContentText variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Create a new empty tag in the system taxonomy.
          </DialogContentText>
          <TextField
            fullWidth
            required
            label="Tag Name"
            value={addTagValue}
            onChange={(e) => setAddTagValue(e.target.value)}
            placeholder="e.g. quantum computing"
            variant="outlined"
            size="small"
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => {
              setActiveAddTag(false);
              setAddTagValue("");
            }}
            disabled={isPending}
            sx={{ textTransform: "none", fontWeight: "bold" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={isPending || !addTagValue.trim()}
            onClick={handleAddSubmit}
            sx={{ textTransform: "none", borderRadius: 3, fontWeight: "bold" }}
          >
            {isPending ? "Adding..." : "Add Tag"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

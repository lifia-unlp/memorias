"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  deleteTagGlobally,
  mergeTags,
  addSystemTag,
} from "./actions";
import { useAutoTagger } from "./useAutoTagger";
import { TagActionDialogs } from "./TagActionDialogs";
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
  Select,
  MenuItem,
  LinearProgress,
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

  // AI Auto-Tagger Hook
  const {
    isOpenAIEnabled,
    checkingConfig,
    selectedModel,
    setSelectedModel,
    selectedTargets,
    setSelectedTargets,
    selectedMode,
    setSelectedMode,
    isAutoTagging,
    taggingProgress,
    handleRunAutoTagger,
  } = useAutoTagger({ setTags, showNotification });

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

  // 2. Rename / Edit Action Handler
  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRenameTag) return;
    const target = renameValue.trim().toLowerCase();
    if (!target) return;

    startTransition(async () => {
      try {
        const res = await mergeTags(activeRenameTag.tag, target);
        if (res.success) {
          setTags((prev) => {
            const next = [...prev];
            const sourceIdx = next.findIndex((t) => t.tag === activeRenameTag.tag);
            const targetIdx = next.findIndex((t) => t.tag === target);

            if (targetIdx !== -1) {
              next[targetIdx].count += activeRenameTag.count;
              next.splice(sourceIdx, 1);
            } else {
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

      {/* Curative Action Overlays (Modals) */}
      <TagActionDialogs
        activeRenameTag={activeRenameTag}
        setActiveRenameTag={setActiveRenameTag}
        renameValue={renameValue}
        setRenameValue={setRenameValue}
        handleRenameSubmit={handleRenameSubmit}
        activeMergeTag={activeMergeTag}
        setActiveMergeTag={setActiveMergeTag}
        mergeTargetValue={mergeTargetValue}
        setMergeTargetValue={setMergeTargetValue}
        handleMergeSubmit={handleMergeSubmit}
        activeDeleteTag={activeDeleteTag}
        setActiveDeleteTag={setActiveDeleteTag}
        handleDelete={handleDelete}
        activeAddTag={activeAddTag}
        setActiveAddTag={setActiveAddTag}
        addTagValue={addTagValue}
        setAddTagValue={setAddTagValue}
        handleAddSubmit={handleAddSubmit}
        tags={tags}
        isPending={isPending}
      />
    </Box>
  );
}

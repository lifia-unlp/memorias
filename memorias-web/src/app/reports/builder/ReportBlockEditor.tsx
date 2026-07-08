"use client";

import React from "react";
import {
  Box,
  Card,
  Typography,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Chip,
} from "@mui/material";
import { Block, InitData } from "./useReportCompiler";

interface ReportBlockEditorProps {
  block: Block;
  index: number;
  totalBlocks: number;
  initData: InitData | null;
  blocks: Block[];
  userRole?: string;
  moveBlock: (index: number, direction: "up" | "down") => void;
  removeBlock: (id: string) => void;
  updateBlockContent: (id: string, text: string) => void;
  updateBlockFilter: (id: string, key: keyof Block["filters"], value: any) => void;
  updateBlockSort: (id: string, key: keyof Block["sort"], value: any) => void;
  compileReport: (currentBlocks?: Block[], forceGenAIBlockId?: string) => Promise<void>;
  cancelGenAIUpdate: (id: string) => void;
  isGenAIDirty: (block: Block, allBlocks: Block[]) => boolean;
  getSelectedContextLength: (block: Block) => number;
}

export function ReportBlockEditor({
  block,
  index,
  totalBlocks,
  initData,
  blocks,
  userRole,
  moveBlock,
  removeBlock,
  updateBlockContent,
  updateBlockFilter,
  updateBlockSort,
  compileReport,
  cancelGenAIUpdate,
  isGenAIDirty,
  getSelectedContextLength,
}: ReportBlockEditorProps) {
  return (
    <Card sx={{ p: 3, borderRadius: 3, display: "flex", flexDirection: "column", gap: 2, bgcolor: "background.paper", borderColor: "divider" }} variant="outlined">
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
            disabled={index === totalBlocks - 1}
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

        {block.type !== "markdown" && block.type !== "genai" && (
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
  );
}

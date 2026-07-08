import React from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Checkbox,
  FormControlLabel,
  FormControl,
  Select,
  MenuItem,
  RadioGroup,
  Radio,
  Alert,
  LinearProgress,
  Button,
  CircularProgress,
} from "@mui/material";

interface TagsCurationAutoTaggerPanelProps {
  isOpenAIEnabled: boolean;
  checkingConfig: boolean;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  selectedTargets: string[];
  setSelectedTargets: React.Dispatch<React.SetStateAction<string[]>>;
  selectedMode: "skip" | "merge" | "replace";
  setSelectedMode: (mode: "skip" | "merge" | "replace") => void;
  isAutoTagging: boolean;
  taggingProgress: { current: number; total: number } | null;
  handleRunAutoTagger: () => void;
}

export function TagsCurationAutoTaggerPanel({
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
}: TagsCurationAutoTaggerPanelProps) {
  return (
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
  );
}

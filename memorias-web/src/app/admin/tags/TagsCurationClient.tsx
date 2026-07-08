"use client";

import React from "react";
import { Box, Snackbar, Alert } from "@mui/material";
import { TagActionDialogs } from "./TagActionDialogs";
import { useTagsCuration, TagInfo } from "./useTagsCuration";
import { TagsCurationHeader } from "./components/TagsCurationHeader";
import { TagsCurationStats } from "./components/TagsCurationStats";
import { TagsCurationAutoTaggerPanel } from "./components/TagsCurationAutoTaggerPanel";
import { TagsCurationTable } from "./components/TagsCurationTable";

interface TagsCurationClientProps {
  initialTags: TagInfo[];
}

export function TagsCurationClient({ initialTags }: TagsCurationClientProps) {
  const c = useTagsCuration({ initialTags });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {/* Notifications */}
      <Snackbar
        open={!!c.notification}
        autoHideDuration={5000}
        onClose={() => c.setNotification(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        {c.notification ? (
          <Alert
            onClose={() => c.setNotification(null)}
            severity={c.notification.type}
            icon={false}
            sx={{ width: "100%", borderRadius: 3, fontWeight: "bold" }}
          >
            {c.notification.message}
          </Alert>
        ) : undefined}
      </Snackbar>

      {/* Header Info */}
      <TagsCurationHeader />

      {/* Stats Counter Cards */}
      <TagsCurationStats tags={c.tags} />

      {/* OpenAI Auto-Tagger Control Card */}
      <TagsCurationAutoTaggerPanel
        isOpenAIEnabled={c.isOpenAIEnabled}
        checkingConfig={c.checkingConfig}
        selectedModel={c.selectedModel}
        setSelectedModel={c.setSelectedModel}
        selectedTargets={c.selectedTargets}
        setSelectedTargets={c.setSelectedTargets}
        selectedMode={c.selectedMode}
        setSelectedMode={c.setSelectedMode}
        isAutoTagging={c.isAutoTagging}
        taggingProgress={c.taggingProgress}
        handleRunAutoTagger={c.handleRunAutoTagger}
      />

      {/* Main Grid: Control Table */}
      <TagsCurationTable
        filteredTags={c.filteredTags}
        searchQuery={c.searchQuery}
        setSearchQuery={c.setSearchQuery}
        setActiveAddTag={c.setActiveAddTag}
        setAddTagValue={c.setAddTagValue}
        setActiveRenameTag={c.setActiveRenameTag}
        setRenameValue={c.setRenameValue}
        setActiveMergeTag={c.setActiveMergeTag}
        setMergeTargetValue={c.setMergeTargetValue}
        setActiveDeleteTag={c.setActiveDeleteTag}
        isPending={c.isPending}
      />

      {/* Curative Action Overlays (Modals) */}
      <TagActionDialogs
        activeRenameTag={c.activeRenameTag}
        setActiveRenameTag={c.setActiveRenameTag}
        renameValue={c.renameValue}
        setRenameValue={c.setRenameValue}
        handleRenameSubmit={c.handleRenameSubmit}
        activeMergeTag={c.activeMergeTag}
        setActiveMergeTag={c.setActiveMergeTag}
        mergeTargetValue={c.mergeTargetValue}
        setMergeTargetValue={c.setMergeTargetValue}
        handleMergeSubmit={c.handleMergeSubmit}
        activeDeleteTag={c.activeDeleteTag}
        setActiveDeleteTag={c.setActiveDeleteTag}
        handleDelete={c.handleDelete}
        activeAddTag={c.activeAddTag}
        setActiveAddTag={c.setActiveAddTag}
        addTagValue={c.addTagValue}
        setAddTagValue={c.setAddTagValue}
        handleAddSubmit={c.handleAddSubmit}
        tags={c.tags}
        isPending={c.isPending}
      />
    </Box>
  );
}

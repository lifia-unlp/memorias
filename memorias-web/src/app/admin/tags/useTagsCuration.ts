import React, { useState, useTransition } from "react";
import { deleteTagGlobally, mergeTags, addSystemTag } from "./actions";
import { useAutoTagger } from "./useAutoTagger";

export interface TagInfo {
  tag: string;
  count: number;
}

interface UseTagsCurationProps {
  initialTags: TagInfo[];
}

export function useTagsCuration({ initialTags }: UseTagsCurationProps) {
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

  return {
    tags,
    setTags,
    searchQuery,
    setSearchQuery,
    filteredTags,
    isPending,
    activeRenameTag,
    setActiveRenameTag,
    renameValue,
    setRenameValue,
    activeMergeTag,
    setActiveMergeTag,
    mergeTargetValue,
    setMergeTargetValue,
    activeDeleteTag,
    setActiveDeleteTag,
    activeAddTag,
    setActiveAddTag,
    addTagValue,
    setAddTagValue,
    notification,
    setNotification,
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
    handleDelete,
    handleAddSubmit,
    handleRenameSubmit,
    handleMergeSubmit,
  };
}

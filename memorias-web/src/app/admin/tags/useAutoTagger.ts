import { useState, useEffect } from "react";
import {
  isOpenAIConfigured,
  getAutoTaggerQueueAction,
  executeAutoTagBatchAction,
  getTagsWithCountsAdmin,
} from "./actions";

interface TagInfo {
  tag: string;
  count: number;
}

interface UseAutoTaggerProps {
  setTags: React.Dispatch<React.SetStateAction<TagInfo[]>>;
  showNotification: (type: "success" | "error", message: string) => void;
}

export function useAutoTagger({ setTags, showNotification }: UseAutoTaggerProps) {
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

  return {
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
  };
}

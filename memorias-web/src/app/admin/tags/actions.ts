"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function ensureAdmin() {
  const session = await auth();
  if (!session || !session.user?.active || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized. Administrator role required.");
  }
}
import { tagService } from "@/lib/services/tagService";

/**
 * Public action to retrieve general tag statistics for autocomplete and popular suggestion pills.
 */
export async function getTagsMetadata() {
  try {
    const [popular, distinct] = await Promise.all([
      tagService.getPopularTags(10),
      tagService.getDistinctTags(),
    ]);
    return {
      popular: popular.map((p) => p.tag),
      distinct,
    };
  } catch (error) {
    console.error("Failed to load tags metadata:", error);
    return { popular: [], distinct: [] };
  }
}

/**
 * Admin action to fetch all unique tags and their count values.
 */
export async function getTagsWithCountsAdmin() {
  await ensureAdmin();
  return tagService.getAllTagsWithCounts();
}

/**
 * Admin action to globally delete a tag across all tables.
 */
export async function deleteTagGlobally(tagToDelete: string) {
  await ensureAdmin();
  return tagService.deleteTagGlobally(tagToDelete);
}

/**
 * Admin action to merge sourceTag into targetTag globally.
 */
export async function mergeTags(sourceTag: string, targetTag: string) {
  await ensureAdmin();
  return tagService.mergeTags(sourceTag, targetTag);
}

/**
 * Check if the OpenAI API Key is configured in the environment variables.
 */
export async function isOpenAIConfigured() {
  return !!process.env.OPENAI_API_KEY;
}


/**
 * Invokes the OpenAI API in batch mode (up to 15 items per request) to suggest tags.
 */
async function callOpenAIBatch(
  model: string,
  items: { id: string; title: string; summary: string }[],
  existingTags: string[]
): Promise<{ id: string; tags: string[] }[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OpenAI API key is missing.");
  }

  const systemPrompt = `You are an expert academic taxonomy tagger for a scientific laboratory.
Analyze the provided list of academic items (each with an 'id', 'title', and optional 'summary').
For each item, recommend 1 to 5 highly relevant, lowercase research tags or keywords representing the scientific fields, methodologies, or technologies.

CRITICAL INSTRUCTION:
You may ONLY recommend tags that are in the following list of approved taxonomy tags. DO NOT generate new tags under any circumstances. If an item cannot be mapped to any of the approved tags, return an empty array [] for it.

Approved taxonomy tags:
${JSON.stringify(existingTags)}

Return your response ONLY as a JSON object matching this schema:
{
  "classifications": [
    { "id": "item_id", "tags": ["tag1", "tag2"] }
  ]
}`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: JSON.stringify({ items }) }
      ],
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("OpenAI API call failed:", errText);
    throw new Error(`OpenAI API failed: ${response.statusText}`);
  }

  const data = await response.json();
  const rawText = data.choices?.[0]?.message?.content;
  if (!rawText) return [];

  try {
    const parsed = JSON.parse(rawText);
    return parsed.classifications || [];
  } catch (err) {
    console.error("Failed to parse OpenAI JSON response:", err);
    return [];
  }
}

/**
 * Admin action to fetch the entire queue of items to tag based on targets and mode.
 */
export async function getAutoTaggerQueueAction(params: {
  targets: string[];
  mode: "skip" | "merge" | "replace";
}) {
  await ensureAdmin();
  const { targets, mode } = params;
  const queue: { id: string; target: string; title: string; summary: string; currentTags: string[] }[] = [];

  for (const target of targets) {
    if (target === "publication") {
      let pubs = await prisma.publication.findMany({ select: { id: true, title: true, bibtexData: true, tags: true } });
      if (mode === "skip") {
        pubs = pubs.filter((p) => p.tags.length === 0);
      }
      queue.push(...pubs.map(p => {
        const bibtex = p.bibtexData as Record<string, unknown> | null;
        const entryTags = bibtex?.entryTags as Record<string, unknown> | undefined;
        const abstract = (entryTags?.abstract as string) || (bibtex?.abstract as string) || "";
        return {
          id: p.id,
          target,
          title: p.title,
          summary: abstract,
          currentTags: p.tags,
        };
      }));
    }

    if (target === "project") {
      let projs = await prisma.project.findMany({ select: { id: true, title: true, summary: true, tags: true } });
      if (mode === "skip") {
        projs = projs.filter((p) => p.tags.length === 0);
      }
      queue.push(...projs.map(p => ({
        id: p.id,
        target,
        title: p.title,
        summary: p.summary || "",
        currentTags: p.tags,
      })));
    }

    if (target === "thesis") {
      let theses = await prisma.thesis.findMany({ select: { id: true, title: true, summary: true, tags: true } });
      if (mode === "skip") {
        theses = theses.filter((t) => t.tags.length === 0);
      }
      queue.push(...theses.map(t => ({
        id: t.id,
        target,
        title: t.title,
        summary: t.summary || "",
        currentTags: t.tags,
      })));
    }

    if (target === "scholarship") {
      let schs = await prisma.scholarship.findMany({ select: { id: true, title: true, summary: true, tags: true } });
      if (mode === "skip") {
        schs = schs.filter((s) => s.tags.length === 0);
      }
      queue.push(...schs.map(s => ({
        id: s.id,
        target,
        title: s.title,
        summary: s.summary || "",
        currentTags: s.tags,
      })));
    }

    if (target === "member") {
      let members = await prisma.member.findMany({ select: { id: true, firstName: true, lastName: true, tags: true } });
      if (mode === "skip") {
        members = members.filter((m) => m.tags.length === 0);
      }
      queue.push(...members.map(m => ({
        id: m.id,
        target,
        title: `${m.firstName} ${m.lastName}`,
        summary: "",
        currentTags: m.tags,
      })));
    }
  }

  return queue;
}

/**
 * Process a small batch of auto-tag tasks.
 */
export async function executeAutoTagBatchAction(params: {
  model: string;
  mode: "skip" | "merge" | "replace";
  tasks: { id: string; target: string; title: string; summary: string; currentTags: string[] }[];
}) {
  await ensureAdmin();
  const { model, mode, tasks } = params;

  const aiTasks = tasks.filter(t => t.target !== "member");
  const localTasks = tasks.filter(t => t.target === "member");

  const newTagsSet = new Set<string>();

  // 1. Process AI Tasks
  if (aiTasks.length > 0) {
    const existingTags = await tagService.getDistinctTags();
    
    try {
      const suggestions = await callOpenAIBatch(
        model,
        aiTasks.map(t => ({ id: t.id, title: t.title, summary: t.summary })),
        existingTags
      );

      for (const sug of suggestions) {
        const task = aiTasks.find(t => t.id === sug.id);
        if (!task) continue;

        // Strict taxonomy guard
        const allowedSug = sug.tags
          .map((t) => t.trim().toLowerCase())
          .filter((t) => existingTags.includes(t));

        const finalTags =
          mode === "replace"
            ? allowedSug
            : Array.from(new Set([...task.currentTags, ...allowedSug]));

        if (task.target === "project") {
          await prisma.project.update({ where: { id: task.id }, data: { tags: finalTags } });
        } else if (task.target === "publication") {
          await prisma.publication.update({ where: { id: task.id }, data: { tags: finalTags } });
        } else if (task.target === "thesis") {
          await prisma.thesis.update({ where: { id: task.id }, data: { tags: finalTags } });
        } else if (task.target === "scholarship") {
          await prisma.scholarship.update({ where: { id: task.id }, data: { tags: finalTags } });
        }

        allowedSug.forEach(t => newTagsSet.add(t));
      }
    } catch (err) {
      console.error("Failed to run OpenAI batch tagging:", err);
      throw err;
    }
  }

  // 2. Process Member derivation tasks
  for (const task of localTasks) {
    try {
      const derived = await tagService.deriveMemberTags(task.id);
      const finalTags =
        mode === "replace"
          ? derived
          : Array.from(new Set([...task.currentTags, ...derived]));

      await prisma.member.update({ where: { id: task.id }, data: { tags: finalTags } });
      derived.forEach(t => newTagsSet.add(t));
    } catch (err) {
      console.error("Failed to derive member tags:", err);
    }
  }

  // Revalidate routes
  revalidatePath("/");
  revalidatePath("/members");
  revalidatePath("/projects");
  revalidatePath("/theses");
  revalidatePath("/scholarships");
  revalidatePath("/publications");

  return {
    success: true,
    newTags: Array.from(newTagsSet),
  };
}

export async function addSystemTag(tag: string) {
  await ensureAdmin();
  return tagService.addSystemTag(tag);
}

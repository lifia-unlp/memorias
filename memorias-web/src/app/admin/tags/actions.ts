"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ensureEditorOrAdmin } from "@/app/members/actions";
import { logAction } from "@/lib/audit";
import { sanitizeTag, getDistinctTags, getPopularTags, getAllTagsWithCounts } from "@/lib/tags";

/**
 * Public action to retrieve general tag statistics for autocomplete and popular suggestion pills.
 */
export async function getTagsMetadata() {
  try {
    const [popular, distinct] = await Promise.all([
      getPopularTags(10),
      getDistinctTags(),
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
  await ensureEditorOrAdmin();
  return getAllTagsWithCounts();
}

/**
 * Admin action to globally delete a tag across all tables.
 */
export async function deleteTagGlobally(tagToDelete: string) {
  await ensureEditorOrAdmin();
  const sanitized = sanitizeTag(tagToDelete);
  if (!sanitized) throw new Error("Invalid tag name specified.");

  // Sequential updates across all five models
  
  // 1. Members
  const members = await prisma.member.findMany({ where: { tags: { has: sanitized } } });
  for (const m of members) {
    await prisma.member.update({
      where: { id: m.id },
      data: { tags: m.tags.filter((t) => sanitizeTag(t) !== sanitized) },
    });
  }

  // 2. Projects
  const projects = await prisma.project.findMany({ where: { tags: { has: sanitized } } });
  for (const p of projects) {
    await prisma.project.update({
      where: { id: p.id },
      data: { tags: p.tags.filter((t) => sanitizeTag(t) !== sanitized) },
    });
  }

  // 3. Theses
  const theses = await prisma.thesis.findMany({ where: { tags: { has: sanitized } } });
  for (const t of theses) {
    await prisma.thesis.update({
      where: { id: t.id },
      data: { tags: t.tags.filter((t) => sanitizeTag(t) !== sanitized) },
    });
  }

  // 4. Scholarships
  const scholarships = await prisma.scholarship.findMany({ where: { tags: { has: sanitized } } });
  for (const s of scholarships) {
    await prisma.scholarship.update({
      where: { id: s.id },
      data: { tags: s.tags.filter((t) => sanitizeTag(t) !== sanitized) },
    });
  }

  // 5. Publications
  const publications = await prisma.publication.findMany({ where: { tags: { has: sanitized } } });
  for (const p of publications) {
    await prisma.publication.update({
      where: { id: p.id },
      data: { tags: p.tags.filter((t) => sanitizeTag(t) !== sanitized) },
    });
  }

  await logAction(
    "DELETE",
    "Tag",
    sanitized,
    sanitized,
    `Globally deleted tag: "${sanitized}"`
  );

  // Clear caches
  revalidatePath("/");
  revalidatePath("/members");
  revalidatePath("/projects");
  revalidatePath("/theses");
  revalidatePath("/scholarships");
  revalidatePath("/publications");

  return { success: true };
}

/**
 * Admin action to merge sourceTag into targetTag globally.
 */
export async function mergeTags(sourceTag: string, targetTag: string) {
  await ensureEditorOrAdmin();
  const source = sanitizeTag(sourceTag);
  const target = sanitizeTag(targetTag);

  if (!source || !target) throw new Error("Invalid tag specifications.");
  if (source === target) return { success: true };

  // Sequential updates across all five models
  
  // 1. Members
  const members = await prisma.member.findMany({ where: { tags: { has: source } } });
  for (const m of members) {
    const updated = m.tags.map((t) => (sanitizeTag(t) === source ? target : sanitizeTag(t)));
    await prisma.member.update({
      where: { id: m.id },
      data: { tags: Array.from(new Set(updated)) },
    });
  }

  // 2. Projects
  const projects = await prisma.project.findMany({ where: { tags: { has: source } } });
  for (const p of projects) {
    const updated = p.tags.map((t) => (sanitizeTag(t) === source ? target : sanitizeTag(t)));
    await prisma.project.update({
      where: { id: p.id },
      data: { tags: Array.from(new Set(updated)) },
    });
  }

  // 3. Theses
  const theses = await prisma.thesis.findMany({ where: { tags: { has: source } } });
  for (const t of theses) {
    const updated = t.tags.map((t) => (sanitizeTag(t) === source ? target : sanitizeTag(t)));
    await prisma.thesis.update({
      where: { id: t.id },
      data: { tags: Array.from(new Set(updated)) },
    });
  }

  // 4. Scholarships
  const scholarships = await prisma.scholarship.findMany({ where: { tags: { has: source } } });
  for (const s of scholarships) {
    const updated = s.tags.map((t) => (sanitizeTag(t) === source ? target : sanitizeTag(t)));
    await prisma.scholarship.update({
      where: { id: s.id },
      data: { tags: Array.from(new Set(updated)) },
    });
  }

  // 5. Publications
  const publications = await prisma.publication.findMany({ where: { tags: { has: source } } });
  for (const p of publications) {
    const updated = p.tags.map((t) => (sanitizeTag(t) === source ? target : sanitizeTag(t)));
    await prisma.publication.update({
      where: { id: p.id },
      data: { tags: Array.from(new Set(updated)) },
    });
  }

  await logAction(
    "UPDATE",
    "Tag",
    source,
    target,
    `Merged tag "${source}" into target tag "${target}"`
  );

  // Clear caches
  revalidatePath("/");
  revalidatePath("/members");
  revalidatePath("/projects");
  revalidatePath("/theses");
  revalidatePath("/scholarships");
  revalidatePath("/publications");

  return { success: true };
}

/**
 * Check if the OpenAI API Key is configured in the environment variables.
 */
export async function isOpenAIConfigured() {
  return !!process.env.OPENAI_API_KEY;
}

/**
 * Derive the top 3 most frequent research tags for a member based on their connected objects.
 */
export async function deriveMemberTags(memberId: string) {
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    include: {
      projects: { select: { tags: true } },
      theses: { select: { tags: true } },
      scholarships: { select: { tags: true } },
      publications: { select: { tags: true } },
    },
  });
  if (!member) return [];

  const allTags: string[] = [
    ...member.projects.flatMap((p) => p.tags),
    ...member.theses.flatMap((t) => t.tags),
    ...member.scholarships.flatMap((s) => s.tags),
    ...member.publications.flatMap((pb) => pb.tags),
  ].map((t) => t.trim().toLowerCase()).filter(Boolean);

  // Count frequency of each tag
  const counts: { [tag: string]: number } = {};
  for (const tag of allTags) {
    counts[tag] = (counts[tag] || 0) + 1;
  }

  // Sort by frequency and take top 3
  const top3 = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map((entry) => entry[0]);

  return top3;
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

Here is the list of active research tags already established in the laboratory database:
${JSON.stringify(existingTags)}

CRITICAL INSTRUCTIONS:
1. Prioritize matching and reusing existing tags from the list above.
2. Only generate a brand new tag if none of the established tags are suitable.
3. Keep all tags strictly lowercase, trimmed of whitespace, and concise (e.g. 'nlp' or 'semantic web').
4. If the title and summary are too brief, vague, generic, or if you lack confidence to classify the item, do not generate tags. Return an empty array [] for that item.
5. Return your response ONLY as a JSON object matching this schema:
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
 * Global administrative action to execute database-wide batch AI auto-tagging.
 */
export async function runGlobalAutoTaggerAction(params: {
  model: string;
  targets: string[];
  mode: "skip" | "merge" | "replace";
}) {
  await ensureEditorOrAdmin();
  const { model, targets, mode } = params;

  if (targets.length === 0) {
    return { success: false, error: "No target collections selected." };
  }

  // If using OpenAI (i.e. targets has non-member entities), check key
  const hasAITarget = targets.some((t) => t !== "member");
  if (hasAITarget && !process.env.OPENAI_API_KEY) {
    return { success: false, error: "OpenAI API Key is missing in the environment." };
  }

  const existingTags = await getDistinctTags();
  let totalProcessed = 0;
  const newTagsSet = new Set<string>();

  // Process sequentially to keep it stable
  for (const target of targets) {
    if (target === "publication") {
      let pubs = await prisma.publication.findMany();
      if (mode === "skip") {
        pubs = pubs.filter((p) => p.tags.length === 0);
      }

      // Batch in chunks of 15
      const batchSize = 15;
      for (let i = 0; i < pubs.length; i += batchSize) {
        const chunk = pubs.slice(i, i + batchSize);
        const items = chunk.map((p) => ({
          id: p.id,
          title: p.title,
          summary: (p.bibtexData as any)?.abstract || "",
        }));

        try {
          const suggestions = await callOpenAIBatch(model, items, existingTags);
          for (const sug of suggestions) {
            const pub = chunk.find((c) => c.id === sug.id);
            if (!pub) continue;

            const sanitizedSug = sug.tags.map((t) => t.trim().toLowerCase()).filter(Boolean);
            const finalTags =
              mode === "replace"
                ? sanitizedSug
                : Array.from(new Set([...pub.tags, ...sanitizedSug]));

            await prisma.publication.update({
              where: { id: pub.id },
              data: { tags: finalTags },
            });

            sanitizedSug.forEach((t) => newTagsSet.add(t));
            totalProcessed++;
          }
        } catch (err) {
          console.error("Error processing publications batch:", err);
        }
      }
    }

    if (target === "project") {
      let projs = await prisma.project.findMany();
      if (mode === "skip") {
        projs = projs.filter((p) => p.tags.length === 0);
      }

      const batchSize = 15;
      for (let i = 0; i < projs.length; i += batchSize) {
        const chunk = projs.slice(i, i + batchSize);
        const items = chunk.map((p) => ({
          id: p.id,
          title: p.title,
          summary: p.summary || "",
        }));

        try {
          const suggestions = await callOpenAIBatch(model, items, existingTags);
          for (const sug of suggestions) {
            const proj = chunk.find((c) => c.id === sug.id);
            if (!proj) continue;

            const sanitizedSug = sug.tags.map((t) => t.trim().toLowerCase()).filter(Boolean);
            const finalTags =
              mode === "replace"
                ? sanitizedSug
                : Array.from(new Set([...proj.tags, ...sanitizedSug]));

            await prisma.project.update({
              where: { id: proj.id },
              data: { tags: finalTags },
            });

            sanitizedSug.forEach((t) => newTagsSet.add(t));
            totalProcessed++;
          }
        } catch (err) {
          console.error("Error processing projects batch:", err);
        }
      }
    }

    if (target === "thesis") {
      let theses = await prisma.thesis.findMany();
      if (mode === "skip") {
        theses = theses.filter((t) => t.tags.length === 0);
      }

      const batchSize = 15;
      for (let i = 0; i < theses.length; i += batchSize) {
        const chunk = theses.slice(i, i + batchSize);
        const items = chunk.map((t) => ({
          id: t.id,
          title: t.title,
          summary: t.summary || "",
        }));

        try {
          const suggestions = await callOpenAIBatch(model, items, existingTags);
          for (const sug of suggestions) {
            const thesis = chunk.find((c) => c.id === sug.id);
            if (!thesis) continue;

            const sanitizedSug = sug.tags.map((t) => t.trim().toLowerCase()).filter(Boolean);
            const finalTags =
              mode === "replace"
                ? sanitizedSug
                : Array.from(new Set([...thesis.tags, ...sanitizedSug]));

            await prisma.thesis.update({
              where: { id: thesis.id },
              data: { tags: finalTags },
            });

            sanitizedSug.forEach((t) => newTagsSet.add(t));
            totalProcessed++;
          }
        } catch (err) {
          console.error("Error processing theses batch:", err);
        }
      }
    }

    if (target === "scholarship") {
      let schs = await prisma.scholarship.findMany();
      if (mode === "skip") {
        schs = schs.filter((s) => s.tags.length === 0);
      }

      const batchSize = 15;
      for (let i = 0; i < schs.length; i += batchSize) {
        const chunk = schs.slice(i, i + batchSize);
        const items = chunk.map((s) => ({
          id: s.id,
          title: s.title,
          summary: s.summary || "",
        }));

        try {
          const suggestions = await callOpenAIBatch(model, items, existingTags);
          for (const sug of suggestions) {
            const sch = chunk.find((c) => c.id === sug.id);
            if (!sch) continue;

            const sanitizedSug = sug.tags.map((t) => t.trim().toLowerCase()).filter(Boolean);
            const finalTags =
              mode === "replace"
                ? sanitizedSug
                : Array.from(new Set([...sch.tags, ...sanitizedSug]));

            await prisma.scholarship.update({
              where: { id: sch.id },
              data: { tags: finalTags },
            });

            sanitizedSug.forEach((t) => newTagsSet.add(t));
            totalProcessed++;
          }
        } catch (err) {
          console.error("Error processing scholarships batch:", err);
        }
      }
    }

    if (target === "member") {
      // In-memory member tag derivation
      let members = await prisma.member.findMany();
      if (mode === "skip") {
        members = members.filter((m) => m.tags.length === 0);
      }

      for (const m of members) {
        const top3 = await deriveMemberTags(m.id);
        const finalTags =
          mode === "replace"
            ? top3
            : Array.from(new Set([...m.tags, ...top3]));

        await prisma.member.update({
          where: { id: m.id },
          data: { tags: finalTags },
        });

        top3.forEach((t) => newTagsSet.add(t));
        totalProcessed++;
      }
    }
  }

  await logAction(
    "UPDATE",
    "Tag",
    "AI_TAGGER",
    model,
    `Ran global database-wide AI Auto-Tagger using model: ${model} on targets: ${targets.join(
      ", "
    )} (Mode: ${mode}). Processed and updated: ${totalProcessed} elements.`
  );

  // Clear caches
  revalidatePath("/");
  revalidatePath("/members");
  revalidatePath("/projects");
  revalidatePath("/theses");
  revalidatePath("/scholarships");
  revalidatePath("/publications");
  revalidatePath("/admin/tags");

  return {
    success: true,
    processedCount: totalProcessed,
    newTags: Array.from(newTagsSet),
  };
}

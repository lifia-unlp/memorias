import { prisma } from "./prisma";

/**
 * Standardizes a tag string by lowercasing, trimming, and collapsing double spaces.
 */
export function sanitizeTag(tag: string): string {
  if (!tag) return "";
  return tag
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/**
 * Aggregates all tags across all models (Member, Project, Thesis, Scholarship, Publication)
 * and returns them along with their frequency counts, ordered by popular use first.
 */
export async function getAllTagsWithCounts(): Promise<{ tag: string; count: number }[]> {
  try {
    const [members, projects, theses, scholarships, publications] = await Promise.all([
      prisma.member.findMany({ select: { tags: true } }),
      prisma.project.findMany({ select: { tags: true } }),
      prisma.thesis.findMany({ select: { tags: true } }),
      prisma.scholarship.findMany({ select: { tags: true } }),
      prisma.publication.findMany({ select: { tags: true } }),
    ]);

    const counts: Record<string, number> = {};

    const allEntries = [
      ...members,
      ...projects,
      ...theses,
      ...scholarships,
      ...publications,
    ];

    for (const entry of allEntries) {
      if (!entry.tags) continue;
      for (const rawTag of entry.tags) {
        const tag = sanitizeTag(rawTag);
        if (tag) {
          counts[tag] = (counts[tag] || 0) + 1;
        }
      }
    }

    return Object.entries(counts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
  } catch (error) {
    console.error("Error aggregating tags:", error);
    return [];
  }
}

/**
 * Retrieves the Top N most popular tags currently used in the system.
 */
export async function getPopularTags(limit = 10): Promise<{ tag: string; count: number }[]> {
  const allTags = await getAllTagsWithCounts();
  return allTags.slice(0, limit);
}

/**
 * Retrieves all distinct tags sorted alphabetically.
 */
export async function getDistinctTags(): Promise<string[]> {
  const allTags = await getAllTagsWithCounts();
  return allTags.map((t) => t.tag).sort((a, b) => a.localeCompare(b));
}

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { logAction } from "@/lib/audit";
import { sanitizeTag } from "@/lib/tags-sanitize";


export const tagService = {
  /**
   * Aggregates all tags across all models (Member, Project, Thesis, Scholarship, Publication)
   * and returns them along with their frequency counts, ordered by popular use first.
   */
  getAllTagsWithCounts: async (): Promise<{ tag: string; count: number }[]> => {
    try {
      const [members, projects, theses, scholarships, publications, systemTags] = await Promise.all([
        prisma.member.findMany({ select: { tags: true } }),
        prisma.project.findMany({ select: { tags: true } }),
        prisma.thesis.findMany({ select: { tags: true } }),
        prisma.scholarship.findMany({ select: { tags: true } }),
        prisma.publication.findMany({ select: { tags: true } }),
        prisma.systemOption.findMany({ where: { listName: "taxonomy_tag" }, select: { value: true } }),
      ]);

      const counts: Record<string, number> = {};

      // Seed approved tags with count 0
      for (const sysTag of systemTags) {
        const tag = sanitizeTag(sysTag.value);
        if (tag) counts[tag] = 0;
      }

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
  },

  /**
   * Retrieves the Top N most popular tags currently used in the system.
   */
  getPopularTags: async (limit = 10): Promise<{ tag: string; count: number }[]> => {
    const allTags = await tagService.getAllTagsWithCounts();
    return allTags.slice(0, limit);
  },

  /**
   * Retrieves all distinct tags sorted alphabetically.
   */
  getDistinctTags: async (): Promise<string[]> => {
    const allTags = await tagService.getAllTagsWithCounts();
    return allTags.map((t) => t.tag).sort((a, b) => a.localeCompare(b));
  },

  /**
   * Fetches all related entities for a given tag.
   */
  getItemsByTag: async (tag: string) => {
    const decodedTag = decodeURIComponent(tag).trim().toLowerCase();
    if (!decodedTag) {
      return {
        members: [],
        projects: [],
        theses: [],
        scholarships: [],
        publications: [],
        totalMatches: 0,
      };
    }

    const [members, projects, theses, scholarships, publications] = await Promise.all([
      prisma.member.findMany({
        where: { tags: { has: decodedTag } },
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      }),
      prisma.project.findMany({
        where: { tags: { has: decodedTag } },
        orderBy: { title: "asc" },
      }),
      prisma.thesis.findMany({
        where: { tags: { has: decodedTag } },
        orderBy: { title: "asc" },
      }),
      prisma.scholarship.findMany({
        where: { tags: { has: decodedTag } },
        orderBy: { title: "asc" },
      }),
      prisma.publication.findMany({
        where: { tags: { has: decodedTag } },
        orderBy: { year: "desc" },
      }),
    ]);

    const totalMatches =
      members.length +
      projects.length +
      theses.length +
      scholarships.length +
      publications.length;

    return {
      members,
      projects,
      theses,
      scholarships,
      publications,
      totalMatches,
    };
  },

  /**
   * Globally deletes a tag across all tables.
   */
  deleteTagGlobally: async (tagToDelete: string) => {
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
  },

  /**
   * Merge sourceTag into targetTag globally.
   */
  mergeTags: async (sourceTag: string, targetTag: string) => {
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
  },

  /**
   * Add a new tag to the system taxonomy manually.
   */
  addSystemTag: async (tag: string) => {
    const sanitized = sanitizeTag(tag);
    if (!sanitized) throw new Error("Invalid tag name specified.");

    // Check if it already exists in SystemOption
    const existing = await prisma.systemOption.findFirst({
      where: { listName: "taxonomy_tag", value: sanitized },
    });

    if (!existing) {
      await prisma.systemOption.create({
        data: {
          listName: "taxonomy_tag",
          value: sanitized,
        },
      });

      await logAction(
        "CREATE",
        "Tag",
        sanitized,
        sanitized,
        `Manually created system taxonomy tag: "${sanitized}"`
      );

      // Clear caches
      revalidatePath("/admin/tags");
    }

    return { success: true };
  },

  /**
   * Derive the top 3 most frequent research tags for a member based on their connected objects.
   */
  deriveMemberTags: async (memberId: string): Promise<string[]> => {
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
  },

  /**
   * Admin helper to fetch the entire queue of items to tag based on targets and mode.
   */
  getAutoTaggerQueue: async (params: {
    targets: string[];
    mode: "skip" | "merge" | "replace";
  }): Promise<{ id: string; target: string; title: string; summary: string; currentTags: string[] }[]> => {
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
  },

  /**
   * Update the tags of a specific target entity by its ID.
   */
  updateEntityTags: async (target: string, id: string, tags: string[]): Promise<void> => {
    if (target === "project") {
      await prisma.project.update({ where: { id }, data: { tags } });
    } else if (target === "publication") {
      await prisma.publication.update({ where: { id }, data: { tags } });
    } else if (target === "thesis") {
      await prisma.thesis.update({ where: { id }, data: { tags } });
    } else if (target === "scholarship") {
      await prisma.scholarship.update({ where: { id }, data: { tags } });
    } else if (target === "member") {
      await prisma.member.update({ where: { id }, data: { tags } });
    }
  },
};

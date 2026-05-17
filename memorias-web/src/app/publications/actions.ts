"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// ---------------------------------------------------------
// Helper: Clean and format individual BibTeX tag value
// ---------------------------------------------------------
function cleanBibtexValue(val: string): string {
  if (!val) return "";
  let clean = val.trim();
  // Strip outer matching braces if present (e.g. {My Title} -> My Title)
  if (clean.startsWith("{") && clean.endsWith("}")) {
    clean = clean.substring(1, clean.length - 1);
  }
  // Strip outer matching double quotes if present
  if (clean.startsWith('"') && clean.endsWith('"')) {
    clean = clean.substring(1, clean.length - 1);
  }
  // Strip extra inner double curly braces
  clean = clean.replace(/[\{\}]/g, "");
  // Normalize whitespace
  return clean.trim().replace(/\s+/g, " ");
}

// ---------------------------------------------------------
// Helper: Local Robust BibTeX Parser
// ---------------------------------------------------------
export async function parseBibtex(raw: string) {
  try {
    const clean = raw.trim();
    // Match entry type and citation key
    const typeMatch = clean.match(/^@(\w+)\s*\{\s*([^,\s]+),/);
    if (!typeMatch) {
      return { success: false, error: "Invalid BibTeX format: Could not find @type{citation_key," };
    }

    const rawType = typeMatch[1].toLowerCase();
    const citationKey = typeMatch[2].trim();

    // Map BibTeX type to the standard categories
    let type = rawType;
    if (rawType === "journal") type = "article";
    else if (rawType === "conference") type = "inproceedings";
    else if (rawType === "booklet") type = "book";
    else if (rawType === "patent") type = "misc";

    // Find body start (after the first comma following the citation key)
    const firstBraceIdx = clean.indexOf("{");
    if (firstBraceIdx === -1) {
      return { success: false, error: "Malformed BibTeX: Missing opening bracket" };
    }
    
    // Find the end of the citation key plus its comma
    const headerEndIdx = clean.indexOf(",", firstBraceIdx);
    if (headerEndIdx === -1) {
      return { success: false, error: "Malformed BibTeX: Missing comma after citation key" };
    }

    const body = clean.substring(headerEndIdx + 1).trim();

    const tags: Record<string, string> = {};
    
    // Character-by-character parsing of the key-value body
    let i = 0;
    while (i < body.length) {
      // Skip whitespace/commas
      while (i < body.length && /[\s,]/ .test(body[i])) {
        i++;
      }
      if (i >= body.length || body[i] === "}") {
        break; // Reached end of body or closing brace
      }

      // Read key
      let key = "";
      while (i < body.length && body[i] !== "=" && !/[\s]/.test(body[i])) {
        key += body[i];
        i++;
      }

      // Skip to '='
      while (i < body.length && body[i] !== "=") {
        i++;
      }
      if (i >= body.length) break;
      i++; // Skip '='

      // Skip whitespace
      while (i < body.length && /[\s]/.test(body[i])) {
        i++;
      }
      if (i >= body.length) break;

      // Read value based on its starting delimiter
      let val = "";
      if (body[i] === "{") {
        // Parse brace-enclosed value (handling nesting!)
        let braceCount = 1;
        i++; // skip opening brace
        while (i < body.length && braceCount > 0) {
          if (body[i] === "{") {
            braceCount++;
          } else if (body[i] === "}") {
            braceCount--;
          }
          if (braceCount > 0) {
            val += body[i];
          }
          i++;
        }
      } else if (body[i] === '"') {
        // Parse quote-enclosed value
        i++; // skip opening quote
        while (i < body.length && body[i] !== '"') {
          if (body[i] === "\\" && body[i+1] === '"') {
            val += '"';
            i += 2;
          } else {
            val += body[i];
            i++;
          }
        }
        if (i < body.length) i++; // skip closing quote
      } else {
        // Parse unquoted value (word or number until next comma, whitespace, or closing brace)
        while (i < body.length && body[i] !== "," && body[i] !== "}" && !/[\s]/.test(body[i])) {
          val += body[i];
          i++;
        }
      }

      const cleanKey = key.trim().toLowerCase();
      if (cleanKey) {
        tags[cleanKey] = cleanBibtexValue(val);
      }
    }

    const title = tags.title || "";
    const authors = tags.author || tags.authors || "";
    const yearVal = tags.year ? parseInt(tags.year, 10) : new Date().getFullYear();

    return {
      success: true,
      data: {
        type,
        title,
        authors,
        year: isNaN(yearVal) ? new Date().getFullYear() : yearVal,
        citationKey,
        ranking: tags.ranking || "",
        selfArchivingUrl: tags.url || tags.selfarchivingurl || "",
        entryTags: tags,
      },
    };
  } catch (err: any) {
    return { success: false, error: err?.message || "An unexpected error occurred during BibTeX parsing" };
  }
}

// ---------------------------------------------------------
// Server Action: Resolve DOI to BibTeX
// ---------------------------------------------------------
export async function resolveDoiAction(doiInput: string) {
  try {
    let doi = doiInput.trim();
    // Trim leading doi resolver URLs if the user pasted a full link
    if (doi.includes("doi.org/")) {
      doi = doi.substring(doi.indexOf("doi.org/") + 8);
    }
    doi = doi.replace(/^(doi:|https?:\/\/)/i, "").trim();

    if (!doi) {
      return { success: false, error: "DOI cannot be empty" };
    }

    // Call standard global DOI Content Negotiation endpoint
    const res = await fetch(`https://doi.org/${encodeURIComponent(doi)}`, {
      headers: {
        Accept: "application/x-bibtex",
      },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      return {
        success: false,
        error: `Could not resolve DOI. Server returned status code: ${res.status}`,
      };
    }

    const bibtexText = await res.text();
    if (!bibtexText || !bibtexText.trim().startsWith("@")) {
      return {
        success: false,
        error: "DOI resolved, but returned invalid bibliography structure",
      };
    }

    // Parse the resolved BibTeX directly
    const parsed = await parseBibtex(bibtexText);
    return parsed;
  } catch (err: any) {
    return { success: false, error: `Network or resolver error: ${err.message}` };
  }
}

// ---------------------------------------------------------
// Helper: Role Check Utility
// ---------------------------------------------------------
async function verifyEditorOrAdmin() {
  const session = await auth();
  if (
    !session?.user?.active ||
    (session.user.role !== "EDITOR" && session.user.role !== "ADMIN")
  ) {
    throw new Error("Unauthorized: Insufficient administrative privileges");
  }
}

// Helper: Clean slug format
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ---------------------------------------------------------
// Server Actions: CRUD Operations
// ---------------------------------------------------------

export async function createPublication(data: {
  title: string;
  authors: string;
  year: number;
  type: string;
  ranking?: string;
  selfArchivingUrl?: string;
  tags?: string[];
  members?: string[];
  projects?: string[];
  theses?: string[];
  citationKey?: string;
  customEntryTags?: Record<string, string>;
}) {
  await verifyEditorOrAdmin();

  const title = data.title.trim();
  const authors = data.authors.trim();
  const year = Number(data.year);
  const type = data.type.trim();

  if (!title || !authors || !year || !type) {
    return { success: false, error: "Title, Authors, Year, and Type are mandatory fields" };
  }

  // Construct auto-slug
  const baseSlug = slugify(data.citationKey || title);
  let slug = baseSlug;
  let counter = 1;
  while (true) {
    const existing = await prisma.publication.findUnique({
      where: { slug },
    });
    if (!existing) break;
    slug = `${baseSlug}-${counter++}`;
  }

  // Build robust BibTeX JSON
  const citationKey = data.citationKey?.trim() || slug;
  const entryTags: Record<string, string> = {
    ...(data.customEntryTags || {}),
    title,
    author: authors,
    year: String(year),
  };
  if (data.ranking) entryTags.ranking = data.ranking;
  if (data.selfArchivingUrl) entryTags.url = data.selfArchivingUrl;

  const bibtexData = {
    citationKey,
    entryType: type,
    entryTags,
  };

  try {
    const pub = await prisma.publication.create({
      data: {
        slug,
        title,
        authors,
        year,
        type,
        ranking: data.ranking?.trim() || null,
        selfArchivingUrl: data.selfArchivingUrl?.trim() || null,
        tags: data.tags || [],
        bibtexData: bibtexData as any,
        members: data.members ? { connect: data.members.map((id) => ({ id })) } : undefined,
        projects: data.projects ? { connect: data.projects.map((id) => ({ id })) } : undefined,
        theses: data.theses ? { connect: data.theses.map((id) => ({ id })) } : undefined,
      },
    });

    revalidatePath("/publications");
    return { success: true, slug: pub.slug };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to create publication" };
  }
}

export async function updatePublication(
  slug: string,
  data: {
    title: string;
    authors: string;
    year: number;
    type: string;
    ranking?: string;
    selfArchivingUrl?: string;
    tags?: string[];
    members?: string[];
    projects?: string[];
    theses?: string[];
    citationKey?: string;
    customEntryTags?: Record<string, string>;
  }
) {
  await verifyEditorOrAdmin();

  const title = data.title.trim();
  const authors = data.authors.trim();
  const year = Number(data.year);
  const type = data.type.trim();

  if (!title || !authors || !year || !type) {
    return { success: false, error: "Title, Authors, Year, and Type are mandatory fields" };
  }

  const existingPub = await prisma.publication.findUnique({
    where: { slug },
  });

  if (!existingPub) {
    return { success: false, error: "Publication not found" };
  }

  // Re-build/Update BibTeX JSON object
  const citationKey = data.citationKey?.trim() || slug;
  
  // Override custom tags from form to drop discarded fields
  const entryTags: Record<string, string> = {
    ...(data.customEntryTags || {}),
    title,
    author: authors,
    year: String(year),
  };
  if (data.ranking) entryTags.ranking = data.ranking;
  if (data.selfArchivingUrl) entryTags.url = data.selfArchivingUrl;

  const bibtexData = {
    citationKey,
    entryType: type,
    entryTags,
  };

  try {
    await prisma.publication.update({
      where: { slug },
      data: {
        title,
        authors,
        year,
        type,
        ranking: data.ranking?.trim() || null,
        selfArchivingUrl: data.selfArchivingUrl?.trim() || null,
        tags: data.tags || [],
        bibtexData: bibtexData as any,
        members: {
          set: data.members ? data.members.map((id) => ({ id })) : [],
        },
        projects: {
          set: data.projects ? data.projects.map((id) => ({ id })) : [],
        },
        theses: {
          set: data.theses ? data.theses.map((id) => ({ id })) : [],
        },
      },
    });

    revalidatePath("/publications");
    revalidatePath(`/publications/${slug}`);
    return { success: true, slug };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to update publication" };
  }
}

export async function deletePublication(id: string) {
  await verifyEditorOrAdmin();

  try {
    await prisma.publication.delete({
      where: { id },
    });

    revalidatePath("/publications");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to delete publication" };
  }
}

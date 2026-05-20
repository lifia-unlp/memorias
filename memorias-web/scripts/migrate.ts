import "dotenv/config";
import { MongoClient } from "mongodb";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import Cite from "citation-js";


// Re-initialize Prisma to bypass global cache during scripting
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Slugify helper function
function slugify(text: string): string {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

// Global set to ensure unique generated slugs across tables
const generatedSlugs = new Set<string>();

function generateUniqueSlug(text: string): string {
  const base = slugify(text) || "untitled";
  let slug = base;
  let counter = 1;
  while (generatedSlugs.has(slug)) {
    slug = `${base}-${counter}`;
    counter++;
  }
  generatedSlugs.add(slug);
  return slug;
}

function parseDate(value: any): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function parseProgress(value: any): number | null {
  if (value === undefined || value === null) return null;
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = parseInt(value.replace("%", "").trim());
    return isNaN(parsed) ? null : parsed;
  }
  return null;
}

// Resolve DOI metadata using citation-js
async function resolveDoiMetadata(doi: string): Promise<{
  journal?: string;
  booktitle?: string;
  volume?: string;
  publisher?: string;
  pages?: string;
  isbn?: string;
  issn?: string;
  url?: string;
  year?: string;
  author?: string;
  editor?: string;
} | null> {
  try {
    let cleanDoi = doi.replace(/\\_/g, "_").replace(/\\/g, "").trim();
    cleanDoi = cleanDoi.replace(/^https?:\/\/(dx\.)?doi\.org\//i, "");
    if (!cleanDoi) return null;

    const maxRetries = 3;
    let delay = 1000;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const data = await Cite.async(cleanDoi);
        const obj = data.format("data", { format: "object" })?.[0];
        if (!obj) return null;

        const yearParts = obj.issued?.["date-parts"]?.[0] || obj.created?.["date-parts"]?.[0];
        const year = yearParts?.[0] ? String(yearParts[0]) : undefined;

        const formatAuthorsList = (list: any[]) => {
          if (!Array.isArray(list) || list.length === 0) return undefined;
          return list
            .map(a => {
              const family = a.family || "";
              const given = a.given || "";
              if (family && given) return `${given} ${family}`;
              return family || given;
            })
            .filter(Boolean)
            .join(" and ");
        };

        return {
          journal: obj["container-title"],
          booktitle: obj["container-title"],
          volume: obj["volume"] ? String(obj["volume"]) : undefined,
          publisher: obj["publisher"],
          pages: obj["page"] ? String(obj["page"]).replace("-", "--") : undefined,
          isbn: obj["ISBN"] ? String(obj["ISBN"]) : undefined,
          issn: obj["ISSN"] ? String(obj["ISSN"]) : undefined,
          url: obj["URL"] || `https://doi.org/${cleanDoi}`,
          year,
          author: formatAuthorsList(obj.author),
          editor: formatAuthorsList(obj.editor),
        };
      } catch (err: any) {
        const errMsg = err.message || String(err);
        const shouldRetry = errMsg.includes("502") || errMsg.includes("503") || errMsg.includes("504") || errMsg.toLowerCase().includes("fetch");
        if (attempt < maxRetries && shouldRetry) {
          console.warn(`[Warning] DOI resolution for ${cleanDoi} failed (Attempt ${attempt}/${maxRetries}): ${errMsg}. Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2;
        } else {
          throw err;
        }
      }
    }
    return null;
  } catch (err: any) {
    console.warn(`[Warning] Could not resolve DOI ${doi}:`, err.message || err);
    return null;
  }
}

// Validate mandatory fields based on bibtex-fields.md
function getMissingMandatoryFields(entryType: string, tags: any): string[] {
  const missing: string[] = [];
  const type = entryType.toLowerCase();

  const getVal = (name: string): string => {
    const t = tags[name];
    return (t && typeof t === "object" ? t.value || "" : "").trim();
  };

  const hasField = (name: string): boolean => {
    return getVal(name).length > 0;
  };

  switch (type) {
    case "article":
      if (!hasField("author")) missing.push("author");
      if (!hasField("title")) missing.push("title");
      if (!hasField("journal")) missing.push("journal");
      if (!hasField("year")) missing.push("year");
      if (!hasField("volume")) missing.push("volume");
      break;
    case "book":
      if (!hasField("author") && !hasField("editor")) missing.push("author/editor");
      if (!hasField("title")) missing.push("title");
      if (!hasField("publisher")) missing.push("publisher");
      if (!hasField("year")) missing.push("year");
      break;
    case "inbook":
      if (!hasField("author") && !hasField("editor")) missing.push("author/editor");
      if (!hasField("title")) missing.push("title");
      if (!hasField("chapter") && !hasField("pages")) missing.push("chapter/pages");
      if (!hasField("publisher")) missing.push("publisher");
      if (!hasField("year")) missing.push("year");
      break;
    case "incollection":
      if (!hasField("author")) missing.push("author");
      if (!hasField("title")) missing.push("title");
      if (!hasField("booktitle")) missing.push("booktitle");
      if (!hasField("publisher")) missing.push("publisher");
      if (!hasField("year")) missing.push("year");
      break;
    case "inproceedings":
    case "conference":
      if (!hasField("author")) missing.push("author");
      if (!hasField("title")) missing.push("title");
      if (!hasField("booktitle")) missing.push("booktitle");
      if (!hasField("year")) missing.push("year");
      break;
    case "manual":
      if (!hasField("title")) missing.push("title");
      break;
    case "mastersthesis":
      if (!hasField("author")) missing.push("author");
      if (!hasField("title")) missing.push("title");
      if (!hasField("school")) missing.push("school");
      if (!hasField("year")) missing.push("year");
      break;
    case "phdthesis":
      if (!hasField("author")) missing.push("author");
      if (!hasField("title")) missing.push("title");
      if (!hasField("school")) missing.push("school");
      if (!hasField("year")) missing.push("year");
      break;
    case "proceedings":
      if (!hasField("title")) missing.push("title");
      if (!hasField("year")) missing.push("year");
      break;
    case "techreport":
      if (!hasField("author")) missing.push("author");
      if (!hasField("title")) missing.push("title");
      if (!hasField("institution")) missing.push("institution");
      if (!hasField("year")) missing.push("year");
      break;
    case "unpublished":
      if (!hasField("author")) missing.push("author");
      if (!hasField("title")) missing.push("title");
      if (!hasField("note")) missing.push("note");
      break;
    default:
      break;
  }
  return missing;
}


async function main() {
  const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
  const client = new MongoClient(mongoUri);

  try {
    await client.connect();
    console.log("Connected successfully to MongoDB");
    const mongoDb = client.db("lifiometro");

    console.log("Cleaning up target PostgreSQL database...");
    await prisma.account.deleteMany();
    await prisma.session.deleteMany();
    await prisma.verificationToken.deleteMany();
    await prisma.publication.deleteMany();
    await prisma.scholarship.deleteMany();
    await prisma.thesis.deleteMany();
    await prisma.project.deleteMany();
    await prisma.member.deleteMany();
    await prisma.user.deleteMany();
    console.log("Database clean!");

    // Map to keep track of MongoDB Hex IDs to PostgreSQL UUID IDs
    const memberMap = new Map<string, string>();
    const projectMap = new Map<string, string>();
    const thesisMap = new Map<string, string>();
    const scholarshipMap = new Map<string, string>();
    const publicationMap = new Map<string, string>();

    // ==========================================
    // 1. SKIP USERS MIGRATION (OAuth-based auto-registration)
    // ==========================================
    console.log("\nSkipping Users migration (to be registered automatically via OAuth)...");

    // ==========================================
    // 2. MIGRATE MEMBERS (Lifian -> Member)
    // ==========================================
    console.log("\nMigrating Members...");
    const mongoMembers = await mongoDb.collection("Lifian").find({ trashed: { $ne: true } }).toArray();
    for (const mMember of mongoMembers) {
      const slugBase = `${mMember.firstName} ${mMember.lastName}`;
      const slug = generateUniqueSlug(slugBase);

      const pgMember = await prisma.member.create({
        data: {
          firstName: mMember.firstName || "",
          lastName: mMember.lastName || "",
          slug,
          startDate: parseDate(mMember.startDate),
          endDate: parseDate(mMember.endDate),
          highestDegree: mMember.highestDegree || null,
          coursesAtUNLP: mMember.coursesAtUNLP || null,
          positionAtLab: mMember.positionAtLIFIA || null, // Renamed from positionAtLIFIA
          positionAtUnlp: mMember.positionAtUnlp || null,
          category: mMember.category || null,
          sicadiCategory: mMember.sicadiCategory || null,
          positionAtCIC: mMember.positionAtCIC || null,
          positionAtCONICET: mMember.positionAtCONICET || null,
          personalEmail: mMember.personalEmail || null,
          institutionalEmail: mMember.institutionalEmail || null,
          phone: mMember.phone || null,
          webPage: mMember.webPage || null,
          orcid: mMember.orcid || null,
          dblpProfile: mMember.dblpProfile || null,
          googleResearchProfile: mMember.googleResearchProfile || null,
          researchGateProfile: mMember.researchGateProfile || null,
          shortCvInSpanish: mMember.shortCvInSpanish || null,
          shortCvInEnglish: mMember.shortCvInEnglish || null,
          interestsInEnglish: mMember.interestsInEnglish || null,
          interestsInSpanish: mMember.interestsInSpanish || null,
          affiliations: mMember.affiliations || null,
          notes: mMember.notes || null,
          avatarUrl: mMember.avatarUrl || null,
          tags: Array.isArray(mMember.tags) ? mMember.tags : [],
        },
      });
      memberMap.set(mMember._id.toString(), pgMember.id);
    }
    console.log(`Migrated ${mongoMembers.length} Members.`);

    // ==========================================
    // 3. MIGRATE PROJECTS (Project -> Project)
    // ==========================================
    console.log("\nMigrating Projects...");
    const mongoProjects = await mongoDb.collection("Project").find({ trashed: { $ne: true } }).toArray();
    for (const mProj of mongoProjects) {
      const slug = generateUniqueSlug(mProj.title);

      const pgProj = await prisma.project.create({
        data: {
          title: mProj.title || "",
          code: mProj.code || null,
          slug,
          startDate: parseDate(mProj.startDate),
          endDate: parseDate(mProj.endDate),
          director: mProj.director || null,
          coDirector: mProj.coDirector || null,
          responsibleGroup: mProj.responsibleGroup || null,
          fundingAgency: mProj.fundingAgency || null,
          amount: mProj.amount ? String(mProj.amount) : null,
          summary: mProj.summary || null,
          website: mProj.website || null,
          tags: Array.isArray(mProj.tags) ? mProj.tags : [],
        },
      });
      projectMap.set(mProj._id.toString(), pgProj.id);
    }
    console.log(`Migrated ${mongoProjects.length} Projects.`);

    // ==========================================
    // 4. MIGRATE THESES (Thesis -> Thesis)
    // ==========================================
    console.log("\nMigrating Theses...");
    const mongoTheses = await mongoDb.collection("Thesis").find({ trashed: { $ne: true } }).toArray();
    for (const mThesis of mongoTheses) {
      const slug = generateUniqueSlug(mThesis.title);

      const pgThesis = await prisma.thesis.create({
        data: {
          title: mThesis.title || "",
          slug,
          career: mThesis.career || null,
          level: mThesis.level || null,
          student: mThesis.student || null,
          director: mThesis.director || null,
          coDirector: mThesis.coDirector || null,
          otherAdvisors: mThesis.otherAdvisors || null,
          startDate: parseDate(mThesis.startDate),
          endDate: parseDate(mThesis.endDate),
          summary: mThesis.summary || null,
          reportUrl: mThesis.selfArchivingUrl || null, // Renamed from selfArchivingUrl
          progress: parseProgress(mThesis.progress),
          keywords: mThesis.keywords || null,
          website: mThesis.website || null,
          tags: Array.isArray(mThesis.tags) ? mThesis.tags : [],
        },
      });
      thesisMap.set(mThesis._id.toString(), pgThesis.id);
    }
    console.log(`Migrated ${mongoTheses.length} Theses.`);

    // ==========================================
    // 5. MIGRATE SCHOLARSHIPS (Scholarship -> Scholarship)
    // ==========================================
    console.log("\nMigrating Scholarships...");
    const mongoScholarships = await mongoDb.collection("Scholarship").find({ trashed: { $ne: true } }).toArray();
    for (const mSch of mongoScholarships) {
      const slug = generateUniqueSlug(mSch.title);

      const pgSch = await prisma.scholarship.create({
        data: {
          title: mSch.title || "",
          slug,
          type: mSch.type || null,
          student: mSch.student || null,
          director: mSch.director || null,
          coDirector: mSch.coDirector || null,
          fundingAgency: mSch.fundingAgency || null,
          startDate: parseDate(mSch.startDate),
          endDate: parseDate(mSch.endDate),
          summary: mSch.summary || null,
          tags: Array.isArray(mSch.tags) ? mSch.tags : [],
        },
      });
      scholarshipMap.set(mSch._id.toString(), pgSch.id);
    }
    console.log(`Migrated ${mongoScholarships.length} Scholarships.`);

    // ==========================================
    // 6. MIGRATE PUBLICATIONS (BibtexReference & RawReference -> Publication)
    // ==========================================
    console.log("\nMigrating Publications...");
    const mongoPubs = await mongoDb.collection("BibtexReference").find({ trashed: { $ne: true } }).toArray();
    const mongoRawRefs = await mongoDb.collection("RawReference").find({ trashed: { $ne: true } }).toArray();
    let migratedPubsCount = 0;
    
    // Ingest BibtexReference
    const bibtexTypeCounts: Record<string, number> = {};
    const bibtexMissingMandatoryCounts: Record<string, number> = {};
    const missingFieldsDetail: any[] = [];

    for (const mPub of mongoPubs) {
      const entry = mPub.bibtexEntry;
      if (!entry) continue;

      const citationKey = entry.citationKey || `pub-${Date.now()}`;
      const type = entry.type || "article";
      const tagsObj = entry.tags || {};

      const getTagValue = (tagName: string): string => {
        const tag = tagsObj[tagName];
        return tag && typeof tag === "object" ? tag.value || "" : "";
      };

      // Fix missing mandatory properties using DOI resolution or tag fallbacks before validation and DB write
      const doiVal = getTagValue("doi") || getTagValue("DOI");
      const lowerType = type.toLowerCase();

      // 1. Article-specific Fallback: Copy journaltitle to journal if journal is empty
      if (lowerType === "article") {
        const journalVal = getTagValue("journal");
        if (!journalVal) {
          const journaltitleVal = getTagValue("journaltitle");
          if (journaltitleVal) {
            tagsObj["journal"] = {
              "#instanceOf": "BibtexTag",
              name: "journal",
              value: journaltitleVal,
            };
            console.log(`[Journal Fallback] Copied journaltitle to journal for "${citationKey}"`);
          }
        }
      }

      // 2. Generic DOI Fallback for all types:
      // If there's a DOI and the record has missing mandatory fields, resolve it!
      const missingBeforeDoi = getMissingMandatoryFields(type, tagsObj);
      if (doiVal && missingBeforeDoi.length > 0) {
        console.log(`[DOI Resolution] "${citationKey}" (${type}) is missing: ${missingBeforeDoi.join(", ")}. Resolving DOI: ${doiVal}`);
        const resolved = await resolveDoiMetadata(doiVal);
        if (resolved) {
          // Map resolved fields back to the tagsObj if they are currently missing/empty
          if (resolved.journal && (lowerType === "article") && !getTagValue("journal")) {
            tagsObj["journal"] = { "#instanceOf": "BibtexTag", name: "journal", value: resolved.journal };
            console.log(`  -> Resolved journal: "${resolved.journal}"`);
          }
          if (resolved.booktitle && (lowerType === "inproceedings" || lowerType === "conference" || lowerType === "incollection") && !getTagValue("booktitle")) {
            tagsObj["booktitle"] = { "#instanceOf": "BibtexTag", name: "booktitle", value: resolved.booktitle };
            console.log(`  -> Resolved booktitle: "${resolved.booktitle}"`);
          }
          if (resolved.publisher && (lowerType === "book" || lowerType === "inbook" || lowerType === "incollection") && !getTagValue("publisher")) {
            tagsObj["publisher"] = { "#instanceOf": "BibtexTag", name: "publisher", value: resolved.publisher };
            console.log(`  -> Resolved publisher: "${resolved.publisher}"`);
          }
          if (resolved.volume && !getTagValue("volume")) {
            tagsObj["volume"] = { "#instanceOf": "BibtexTag", name: "volume", value: resolved.volume };
            console.log(`  -> Resolved volume: "${resolved.volume}"`);
          }
          if (resolved.pages && !getTagValue("pages")) {
            tagsObj["pages"] = { "#instanceOf": "BibtexTag", name: "pages", value: resolved.pages };
            console.log(`  -> Resolved pages: "${resolved.pages}"`);
          }
          if (resolved.isbn && !getTagValue("isbn")) {
            tagsObj["isbn"] = { "#instanceOf": "BibtexTag", name: "isbn", value: resolved.isbn };
            console.log(`  -> Resolved isbn: "${resolved.isbn}"`);
          }
          if (resolved.issn && !getTagValue("issn")) {
            tagsObj["issn"] = { "#instanceOf": "BibtexTag", name: "issn", value: resolved.issn };
            console.log(`  -> Resolved issn: "${resolved.issn}"`);
          }
          if (resolved.year && !getTagValue("year")) {
            tagsObj["year"] = { "#instanceOf": "BibtexTag", name: "year", value: resolved.year };
            console.log(`  -> Resolved year: "${resolved.year}"`);
          }
          if (resolved.author && !getTagValue("author") && !getTagValue("editor")) {
            tagsObj["author"] = { "#instanceOf": "BibtexTag", name: "author", value: resolved.author };
            console.log(`  -> Resolved author: "${resolved.author}"`);
          }
          if (resolved.editor && !getTagValue("editor") && !getTagValue("author")) {
            tagsObj["editor"] = { "#instanceOf": "BibtexTag", name: "editor", value: resolved.editor };
            console.log(`  -> Resolved editor: "${resolved.editor}"`);
          }
          if (resolved.publisher && lowerType === "techreport" && !getTagValue("institution")) {
            tagsObj["institution"] = { "#instanceOf": "BibtexTag", name: "institution", value: resolved.publisher };
            console.log(`  -> Resolved institution (from publisher): "${resolved.publisher}"`);
          }
          if (resolved.publisher && (lowerType === "mastersthesis" || lowerType === "phdthesis") && !getTagValue("school")) {
            tagsObj["school"] = { "#instanceOf": "BibtexTag", name: "school", value: resolved.publisher };
            console.log(`  -> Resolved school (from publisher): "${resolved.publisher}"`);
          }
        }
      }

      // Track statistics
      bibtexTypeCounts[lowerType] = (bibtexTypeCounts[lowerType] || 0) + 1;

      const missingFields = getMissingMandatoryFields(type, tagsObj);
      if (missingFields.length > 0) {
        bibtexMissingMandatoryCounts[lowerType] = (bibtexMissingMandatoryCounts[lowerType] || 0) + 1;
        missingFieldsDetail.push({
          citationKey,
          type: lowerType,
          title: getTagValue("title") || getTagValue("booktitle") || "Untitled",
          missingFields,
        });
      }

      const title = getTagValue("title") || getTagValue("booktitle") || "Untitled";
      const authors = getTagValue("author") || getTagValue("editor") || "Unknown";
      const yearStr = getTagValue("year");
      const year = yearStr ? parseInt(yearStr) : 0;

      const slug = generateUniqueSlug(citationKey);


      // Transform legacy bibtex tags into the modern flat entryTags structure expected by the new web application
      const entryTags: Record<string, string> = {};
      for (const [key, tag] of Object.entries(tagsObj)) {
        if (tag && typeof tag === "object") {
          const val = (tag as any).value || "";
          entryTags[key] = val;
        }
      }

      const modernBibtexData = {
        citationKey,
        entryType: type,
        entryTags,
      };

      const pgPub = await prisma.publication.create({
        data: {
          slug,
          type,
          title,
          authors,
          year: isNaN(year) ? 0 : year,
          selfArchivingUrl: mPub.selfArchivingUrl || null,
          bibtexData: modernBibtexData as any,
          tags: Array.isArray(mPub.tags) ? mPub.tags : [],
        },
      });
      publicationMap.set(mPub._id.toString(), pgPub.id);
      migratedPubsCount++;
    }

    // Ingest RawReference
    let migratedRawCount = 0;
    for (const mRaw of mongoRawRefs) {
      if (!mRaw.reference) continue;

      const year = mRaw.year ? parseInt(mRaw.year) : 0;
      const type = mRaw.type || "article";
      const slugBase = `raw-${mRaw.year || "unknown"}-${(mRaw.reference || "").slice(0, 50)}`;
      const slug = generateUniqueSlug(slugBase);

      const pgPub = await prisma.publication.create({
        data: {
          slug,
          type,
          title: mRaw.reference,
          authors: "Raw Reference", // Marker for raw references
          year: isNaN(year) ? 0 : year,
          selfArchivingUrl: mRaw.selfArchivingUrl || null,
          bibtexData: {
            raw: true,
            reference: mRaw.reference,
          } as any,
          tags: Array.isArray(mRaw.tags) ? mRaw.tags : [],
        },
      });
      publicationMap.set(mRaw._id.toString(), pgPub.id);
      migratedRawCount++;
      migratedPubsCount++;
    }
    console.log(`Migrated ${migratedPubsCount} Publications (${mongoPubs.length} BibTex, ${migratedRawCount} Raw).`);

    // ==========================================
    // 7. PASS 2: CONNECTING RELATIONSHIPS
    // ==========================================
    console.log("\n=========================================");
    console.log("PASS 2: CONNECTING ENTITY RELATIONSHIPS");
    console.log("=========================================");

    // Resolve helper for Voyager arrays of references
    const getTargetIds = (refArray: any[], map: Map<string, string>): string[] => {
      if (!Array.isArray(refArray)) return [];
      return refArray
        .map(ref => ref && (ref["__id"] || ref["_id"]))
        .filter(mongoId => mongoId && map.has(mongoId.toString()))
        .map(mongoId => map.get(mongoId.toString()) as string);
    };

    // Connect Member <-> Projects (via Project.relatedLifians in Mongo)
    console.log("Connecting Members and Projects...");
    for (const mProj of mongoProjects) {
      const pgProjectId = projectMap.get(mProj._id.toString());
      if (!pgProjectId) continue;

      const memberIds = getTargetIds(mProj.relatedLifians, memberMap);
      if (memberIds.length > 0) {
        await prisma.project.update({
          where: { id: pgProjectId },
          data: {
            members: {
              connect: memberIds.map(id => ({ id })),
            },
          },
        });
      }
    }

    // Connect Thesis relations (Thesis -> Member, Thesis -> Project)
    console.log("Connecting Theses relations...");
    for (const mThesis of mongoTheses) {
      const pgThesisId = thesisMap.get(mThesis._id.toString());
      if (!pgThesisId) continue;

      const memberIds = getTargetIds(mThesis.relatedLifians, memberMap);
      const projectIds = getTargetIds(mThesis.relatedProjects, projectMap);

      if (memberIds.length > 0 || projectIds.length > 0) {
        await prisma.thesis.update({
          where: { id: pgThesisId },
          data: {
            members: {
              connect: memberIds.map(id => ({ id })),
            },
            projects: {
              connect: projectIds.map(id => ({ id })),
            },
          },
        });
      }
    }

    // Connect Scholarship relations (Scholarship -> Member, Scholarship -> Project)
    console.log("Connecting Scholarships relations...");
    for (const mSch of mongoScholarships) {
      const pgSchId = scholarshipMap.get(mSch._id.toString());
      if (!pgSchId) continue;

      const memberIds = getTargetIds(mSch.relatedLifians, memberMap);
      const projectIds = getTargetIds(mSch.relatedProjects, projectMap);

      if (memberIds.length > 0 || projectIds.length > 0) {
        await prisma.scholarship.update({
          where: { id: pgSchId },
          data: {
            members: {
              connect: memberIds.map(id => ({ id })),
            },
            projects: {
              connect: projectIds.map(id => ({ id })),
            },
          },
        });
      }
    }

    // Connect Publication relations (Publication -> Member, Publication -> Project, Publication -> Thesis)
    console.log("Connecting Publications relations...");
    const allPubs = [...mongoPubs, ...mongoRawRefs];
    for (const mPub of allPubs) {
      const pgPubId = publicationMap.get(mPub._id.toString());
      if (!pgPubId) continue;

      const memberIds = getTargetIds(mPub.relatedLifians, memberMap);
      const projectIds = getTargetIds(mPub.relatedProjects, projectMap);
      const thesisIds = getTargetIds(mPub.relatedThesis, thesisMap);

      if (memberIds.length > 0 || projectIds.length > 0 || thesisIds.length > 0) {
        await prisma.publication.update({
          where: { id: pgPubId },
          data: {
            members: {
              connect: memberIds.map(id => ({ id })),
            },
            projects: {
              connect: projectIds.map(id => ({ id })),
            },
            theses: {
              connect: thesisIds.map(id => ({ id })),
            },
          },
        });
      }
    }

    console.log("\n=========================================");
    console.log("MIGRATION QUALITY REPORT & QUALITY ASSURANCE");
    console.log("=========================================");
    console.log(`Total publications migrated: ${migratedPubsCount}`);
    console.log(`  - From BibtexReference: ${mongoPubs.length}`);
    console.log(`  - From RawReference   : ${migratedRawCount}`);
    console.log("\nDetailed BibtexReference Counts by Type:");
    for (const [t, count] of Object.entries(bibtexTypeCounts)) {
      const missingCount = bibtexMissingMandatoryCounts[t] || 0;
      console.log(`  - ${t.padEnd(15)}: ${String(count).padStart(3)} records (${missingCount} had missing mandatory fields)`);
    }

    if (missingFieldsDetail.length > 0) {
      console.log("\nRecords with Missing Mandatory Fields (Prioritized Review):");
      for (const item of missingFieldsDetail) {
        console.log(`  - [${item.type}] Key: ${item.citationKey}`);
        console.log(`    Title: "${item.title.slice(0, 80)}"`);
        console.log(`    Missing mandatory fields: ${item.missingFields.join(", ")}`);
      }
    } else {
      console.log("\nAll migrated BibTeX records fully conform to mandatory field requirements! 🎉");
    }

    console.log("\n🎉 DATA MIGRATION COMPLETED SUCCESSFULLY! 🎉\n");

  } catch (error) {
    console.error("Migration failed with error:", error);
  } finally {
    await client.close();
    await prisma.$disconnect();
  }
}

main();

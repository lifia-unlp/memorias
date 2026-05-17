import "dotenv/config";
import { MongoClient } from "mongodb";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

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

async function main() {
  const mongoUri = "mongodb://127.0.0.1:27017";
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
    // 1. MIGRATE USERS (LifiaUser -> User)
    // ==========================================
    console.log("\nMigrating Users...");
    const mongoUsers = await mongoDb.collection("LifiaUser").find({}).toArray();
    const insertedEmails = new Set<string>();
    let migratedUsersCount = 0;
    
    for (const mUser of mongoUsers) {
      if (!mUser.email) {
        console.log(`Skipping user with missing email: ${mUser._id}`);
        continue;
      }
      
      const email = mUser.email.trim().toLowerCase();
      if (insertedEmails.has(email)) {
        console.log(`Skipping duplicate user email: ${email}`);
        continue;
      }
      insertedEmails.add(email);

      // Split full name if present
      let firstName = "";
      let lastName = "";
      if (mUser.fullname) {
        const parts = mUser.fullname.trim().split(/\s+/);
        firstName = parts[0] || "";
        lastName = parts.slice(1).join(" ") || "";
      }

      await prisma.user.create({
        data: {
          id: mUser._id.toString(), // Keep ID consistent
          email: email,
          firstName: firstName || null,
          lastName: lastName || null,
          role: mUser.isAdmin ? "ADMIN" : "USER",
          active: mUser.enabled === true,
        },
      });
      migratedUsersCount++;
    }
    console.log(`Migrated ${migratedUsersCount} Users.`);

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

      const title = getTagValue("title") || getTagValue("booktitle") || "Untitled";
      const authors = getTagValue("author") || getTagValue("editor") || "Unknown";
      const yearStr = getTagValue("year");
      const year = yearStr ? parseInt(yearStr) : 0;

      const slug = generateUniqueSlug(citationKey);

      const pgPub = await prisma.publication.create({
        data: {
          slug,
          type,
          title,
          authors,
          year: isNaN(year) ? 0 : year,
          selfArchivingUrl: mPub.selfArchivingUrl || null,
          bibtexData: entry as any,
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

    // Connect Publication relations (Publication -> Member, Publication -> Project)
    console.log("Connecting Publications relations...");
    const allPubs = [...mongoPubs, ...mongoRawRefs];
    for (const mPub of allPubs) {
      const pgPubId = publicationMap.get(mPub._id.toString());
      if (!pgPubId) continue;

      const memberIds = getTargetIds(mPub.relatedLifians, memberMap);
      const projectIds = getTargetIds(mPub.relatedProjects, projectMap);

      if (memberIds.length > 0 || projectIds.length > 0) {
        await prisma.publication.update({
          where: { id: pgPubId },
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

    console.log("\n🎉 DATA MIGRATION COMPLETED SUCCESSFULLY! 🎉\n");
  } catch (error) {
    console.error("Migration failed with error:", error);
  } finally {
    await client.close();
    await prisma.$disconnect();
  }
}

main();

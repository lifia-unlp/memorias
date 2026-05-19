import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { sanitizeTag } from "../src/lib/tags";

// A set of high-quality research tags to populate empty records for visual demonstration
const TEST_TAGS = [
  "semantic web",
  "artificial intelligence",
  "machine learning",
  "human-computer interaction",
  "collaborative systems",
  "knowledge graphs",
  "ontology engineering",
  "agentic workflows",
  "natural language processing",
  "software engineering"
];

// Helper to assign 2-3 random tags from our curated list
function getRandomTestTags(): string[] {
  const shuffled = [...TEST_TAGS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.floor(Math.random() * 2) + 2); // 2 to 3 tags
}

async function main() {
  console.log("Starting lowercase tags standardization and seeding script (no transaction mode)...");

  try {
    // 1. Standardize Members
    console.log("Normalizing Members tags...");
    const members = await prisma.member.findMany();
    for (const m of members) {
      let tags = (m.tags || []).map(sanitizeTag).filter(Boolean);
      if (tags.length === 0) {
        tags = getRandomTestTags();
      } else {
        tags = Array.from(new Set(tags));
      }
      await prisma.member.update({
        where: { id: m.id },
        data: { tags }
      });
    }
    console.log(`Updated ${members.length} Members.`);

    // 2. Standardize Projects
    console.log("Normalizing Projects tags...");
    const projects = await prisma.project.findMany();
    for (const p of projects) {
      let tags = (p.tags || []).map(sanitizeTag).filter(Boolean);
      if (tags.length === 0) {
        tags = getRandomTestTags();
      } else {
        tags = Array.from(new Set(tags));
      }
      await prisma.project.update({
        where: { id: p.id },
        data: { tags }
      });
    }
    console.log(`Updated ${projects.length} Projects.`);

    // 3. Standardize Theses
    console.log("Normalizing Theses tags...");
    const theses = await prisma.thesis.findMany();
    for (const t of theses) {
      let tags = (t.tags || []).map(sanitizeTag).filter(Boolean);
      if (tags.length === 0) {
        tags = getRandomTestTags();
      } else {
        tags = Array.from(new Set(tags));
      }
      await prisma.thesis.update({
        where: { id: t.id },
        data: { tags }
      });
    }
    console.log(`Updated ${theses.length} Theses.`);

    // 4. Standardize Scholarships
    console.log("Normalizing Scholarships tags...");
    const scholarships = await prisma.scholarship.findMany();
    for (const s of scholarships) {
      let tags = (s.tags || []).map(sanitizeTag).filter(Boolean);
      if (tags.length === 0) {
        tags = getRandomTestTags();
      } else {
        tags = Array.from(new Set(tags));
      }
      await prisma.scholarship.update({
        where: { id: s.id },
        data: { tags }
      });
    }
    console.log(`Updated ${scholarships.length} Scholarships.`);

    // 5. Standardize Publications
    console.log("Normalizing Publications tags...");
    const publications = await prisma.publication.findMany();
    let updatedPubs = 0;
    for (const pub of publications) {
      let tags = (pub.tags || []).map(sanitizeTag).filter(Boolean);
      if (tags.length === 0) {
        tags = getRandomTestTags();
      } else {
        tags = Array.from(new Set(tags));
      }
      await prisma.publication.update({
        where: { id: pub.id },
        data: { tags }
      });
      updatedPubs++;
    }
    console.log(`Updated ${updatedPubs} / ${publications.length} Publications.`);

    console.log("\n🎉 Database tags successfully lowercased, deduplicated, and seeded! 🎉\n");
  } catch (error) {
    console.error("Failed to normalize database tags:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

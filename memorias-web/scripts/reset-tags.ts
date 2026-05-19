import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Clearing existing tags from all entities...");
  await prisma.member.updateMany({ data: { tags: [] } });
  await prisma.project.updateMany({ data: { tags: [] } });
  await prisma.thesis.updateMany({ data: { tags: [] } });
  await prisma.scholarship.updateMany({ data: { tags: [] } });
  await prisma.publication.updateMany({ data: { tags: [] } });

  console.log("Resetting taxonomy tags...");
  await prisma.systemOption.deleteMany({ where: { listName: "taxonomy_tag" } });

  const initialTags = [
    "artificial intelligence",
    "machine learning",
    "deep learning",
    "natural language processing",
    "computer vision",
    "robotics",
    "data science",
    "big data",
    "semantic web",
    "software engineering",
    "human-computer interaction",
    "distributed systems",
    "cloud computing",
    "internet of things",
    "cybersecurity",
    "bioinformatics",
    "computational biology",
    "information retrieval",
    "data mining",
    "knowledge representation",
    "ontology",
    "smart cities",
    "blockchains",
    "edge computing"
  ];

  await prisma.systemOption.createMany({
    data: initialTags.map(tag => ({
      listName: "taxonomy_tag",
      value: tag
    }))
  });

  console.log("Successfully seeded taxonomy_tag options.");
}

main().catch(console.error).finally(() => prisma.$disconnect());

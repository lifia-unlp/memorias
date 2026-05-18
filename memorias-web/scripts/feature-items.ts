import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env") });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Selecting items to mark as featured...");

  // 1. Feature 3 Projects
  const projects = await prisma.project.findMany({ take: 3 });
  if (projects.length > 0) {
    console.log("\nMarking 3 Projects as featured:");
    for (const proj of projects) {
      await prisma.project.update({
        where: { id: proj.id },
        data: { featured: true },
      });
      console.log(`- Project: "${proj.title}" (slug: ${proj.slug})`);
    }
  } else {
    console.log("No projects found in database.");
  }

  // 2. Feature 3 Theses
  const theses = await prisma.thesis.findMany({ take: 3 });
  if (theses.length > 0) {
    console.log("\nMarking 3 Theses as featured:");
    for (const thesis of theses) {
      await prisma.thesis.update({
        where: { id: thesis.id },
        data: { featured: true },
      });
      console.log(`- Thesis: "${thesis.title}" (slug: ${thesis.slug})`);
    }
  } else {
    console.log("No theses found in database.");
  }

  // 3. Feature 3 Publications
  const publications = await prisma.publication.findMany({ take: 3 });
  if (publications.length > 0) {
    console.log("\nMarking 3 Publications as featured:");
    for (const pub of publications) {
      await prisma.publication.update({
        where: { id: pub.id },
        data: { featured: true },
      });
      console.log(`- Publication: "${pub.title}" (slug: ${pub.slug})`);
    }
  } else {
    console.log("No publications found in database.");
  }

  console.log("\nFeatured items selected and updated successfully!");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

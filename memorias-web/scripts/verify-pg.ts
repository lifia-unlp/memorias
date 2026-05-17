import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    console.log("=========================================");
    console.log("POSTGRESQL SEED SANITY CHECK");
    console.log("=========================================");

    const users = await prisma.user.count();
    const members = await prisma.member.count();
    const projects = await prisma.project.count();
    const theses = await prisma.thesis.count();
    const scholarships = await prisma.scholarship.count();
    const publications = await prisma.publication.count();

    console.log(`- Users: ${users}`);
    console.log(`- Members: ${members}`);
    console.log(`- Projects: ${projects}`);
    console.log(`- Theses: ${theses}`);
    console.log(`- Scholarships: ${scholarships}`);
    console.log(`- Publications: ${publications}`);

    // Verify a few sample relations
    const membersWithProjects = await prisma.member.count({
      where: { projects: { some: {} } }
    });
    const thesesWithProjects = await prisma.thesis.count({
      where: { projects: { some: {} } }
    });
    const publicationsWithMembers = await prisma.publication.count({
      where: { members: { some: {} } }
    });

    console.log("\n--- Relations verification ---");
    console.log(`- Members linked to at least one Project: ${membersWithProjects} / ${members}`);
    console.log(`- Theses linked to at least one Project: ${thesesWithProjects} / ${theses}`);
    console.log(`- Publications linked to at least one Member: ${publicationsWithMembers} / ${publications}`);

    console.log("\nSanity check completed successfully!");
  } catch (error) {
    console.error("Sanity check failed:", error);
  } finally {
    await pool.end();
    await prisma.$disconnect();
  }
}

main();

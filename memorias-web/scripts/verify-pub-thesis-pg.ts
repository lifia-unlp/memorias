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
    console.log("POSTGRESQL PUBLICATION-THESIS RELATION VERIFICATION");
    console.log("=========================================");

    const totalPubs = await prisma.publication.count();
    const pubsWithTheses = await prisma.publication.findMany({
      where: {
        theses: {
          some: {}
        }
      },
      include: {
        theses: true
      }
    });

    console.log(`Total publications: ${totalPubs}`);
    console.log(`Publications linked to at least one Thesis in PostgreSQL: ${pubsWithTheses.length}`);

    for (const pub of pubsWithTheses) {
      console.log(`- Slug: ${pub.slug}`);
      console.log(`  Title: "${pub.title.slice(0, 80)}"`);
      console.log(`  Linked Thesis Title(s):`);
      for (const th of pub.theses) {
        console.log(`    -> "${th.title}" (ID: ${th.id})`);
      }
    }

    console.log("\nRelationship verification completed successfully!");
  } catch (error) {
    console.error("Verification failed:", error);
  } finally {
    await pool.end();
    await prisma.$disconnect();
  }
}

main();

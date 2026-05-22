import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const citationKeys = [
      "rodriguez_modeling_2023",
      "Loza_Bonora_2025",
      "10.1145/3706599.3706698",
      "10.1145/3471391.3471431"
    ];

    console.log("=== VERIFYING COMPLEX CASES IN POSTGRESQL ===");

    for (const key of citationKeys) {
      console.log(`\n-----------------------------------------`);
      console.log(`Searching for CitationKey: "${key}"`);
      console.log(`-----------------------------------------`);

      const pub = await prisma.publication.findFirst({
        where: {
          bibtexData: {
            path: ["citationKey"],
            equals: key
          }
        }
      });

      if (!pub) {
        console.log(`❌ FAILED: Publication with CitationKey "${key}" was NOT found in PostgreSQL.`);
        continue;
      }

      console.log(`✅ FOUND: Publication ID ${pub.id}`);
      console.log(`- Slug: ${pub.slug}`);
      console.log(`- Title: "${pub.title}"`);
      console.log(`- Authors: "${pub.authors}"`);
      console.log(`- Type: "${pub.type}"`);
      console.log(`- Year: ${pub.year}`);
      console.log(`- Ranking: ${pub.ranking}`);
      console.log(`- Tags:`, JSON.stringify(pub.tags));
      console.log(`- bibtexData:`, JSON.stringify(pub.bibtexData, null, 2));
    }

  } catch (error) {
    console.error("Error verifying complex cases:", error);
  } finally {
    await pool.end();
    await prisma.$disconnect();
  }
}

main();

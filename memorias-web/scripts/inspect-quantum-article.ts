import "dotenv/config";
import { MongoClient } from "mongodb";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

async function main() {
  const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
  const client = new MongoClient(mongoUri);

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    await client.connect();
    const mongoDb = client.db("lifiometro");

    console.log("=== SEARCHING IN MONGODB ===");
    const query = {
      $or: [
        { "bibtexEntry.tags.title.value": { $regex: "A Functional Contribution Framework for Quantum Software Engineering", $options: "i" } },
        { "bibtexEntry.citationKey": { $regex: "Quantum", $options: "i" } }
      ]
    };

    const mongoResults = await mongoDb.collection("BibtexReference").find(query).toArray();
    console.log(`Found ${mongoResults.length} matching records in MongoDB.`);

    for (const res of mongoResults) {
      console.log(`\n- MongoDB _id: ${res._id}`);
      console.log(`  CitationKey: ${res.bibtexEntry?.citationKey}`);
      console.log(`  Title: "${res.bibtexEntry?.tags?.title?.value}"`);
      console.log(`  Entry Type: "${res.bibtexEntry?.type}"`);
      console.log(`  Trashed: ${res.trashed}`);
      console.log(`  All tags:`, JSON.stringify(res.bibtexEntry?.tags, null, 2));
    }

    console.log("\n=== SEARCHING IN POSTGRESQL ===");
    const pgResults = await prisma.publication.findMany({
      where: {
        title: {
          contains: "A Functional Contribution Framework for Quantum Software Engineering",
          mode: "insensitive"
        }
      }
    });

    console.log(`Found ${pgResults.length} matching records in PostgreSQL.`);
    for (const pg of pgResults) {
      console.log(`\n- PostgreSQL ID: ${pg.id}`);
      console.log(`  Slug: ${pg.slug}`);
      console.log(`  Title: "${pg.title}"`);
      console.log(`  Authors: "${pg.authors}"`);
      console.log(`  Year: ${pg.year}`);
      console.log(`  bibtexData:`, JSON.stringify(pg.bibtexData, null, 2));
    }

  } catch (error) {
    console.error("Error inspecting:", error);
  } finally {
    await client.close();
    await pool.end();
    await prisma.$disconnect();
  }
}

main();

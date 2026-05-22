import "dotenv/config";
import { MongoClient } from "mongodb";

async function main() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("lifiometro");
    const collection = db.collection("BibtexReference");

    const activeArticles = await collection.find({ 
      "bibtexEntry.type": "article",
      trashed: { $ne: true }
    }).toArray();

    console.log(`Active articles (not trashed): ${activeArticles.length}`);
    console.log("=========================================\n");

    const mandatoryFields = ["author", "title", "journal", "year", "volume"];
    const missingCounts: Record<string, number> = {
      author: 0,
      title: 0,
      journal: 0,
      year: 0,
      volume: 0,
    };

    const missingRecords: any[] = [];

    // Let's keep track of all unique tag names in the imported active articles
    const allTagNames = new Set<string>();

    for (const art of activeArticles) {
      const entry = art.bibtexEntry;
      const tags = entry?.tags || {};
      const citationKey = entry?.citationKey;
      
      const recordMissing: string[] = [];

      for (const field of mandatoryFields) {
        allTagNames.add(field);
        const tag = tags[field];
        const val = tag?.value;
        if (!val || val.trim() === "") {
          missingCounts[field]++;
          recordMissing.push(field);
        }
      }

      for (const tagName of Object.keys(tags)) {
        allTagNames.add(tagName);
      }

      if (recordMissing.length > 0) {
        missingRecords.push({
          id: art._id,
          citationKey,
          title: tags.title?.value || "(No title)",
          missingFields: recordMissing,
          doi: tags.doi?.value,
        });
      }
    }

    console.log("MISSING MANDATORY FIELDS BY FIELD:");
    console.log(JSON.stringify(missingCounts, null, 2));
    console.log("\n-----------------------------------------\n");

    console.log(`RECORDS WITH MISSING MANDATORY FIELDS (${missingRecords.length} records):`);
    for (const rec of missingRecords) {
      console.log(`\nID: ${rec.id}`);
      console.log(`CitationKey: ${rec.citationKey}`);
      console.log(`Title: ${rec.title}`);
      console.log(`Missing Fields: ${rec.missingFields.join(", ")}`);
      if (rec.doi) console.log(`DOI: ${rec.doi}`);
    }

    console.log("\n-----------------------------------------\n");
    console.log("ALL UNIQUE TAGS PRESENT IN ACTIVE ARTICLES:");
    console.log(Array.from(allTagNames).sort().join(", "));

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

main();

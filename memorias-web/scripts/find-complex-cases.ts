import "dotenv/config";
import { MongoClient } from "mongodb";

async function main() {
  const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
  const client = new MongoClient(mongoUri);

  try {
    await client.connect();
    const db = client.db("lifiometro");
    const collection = db.collection("BibtexReference");

    const activePubs = await collection.find({ trashed: { $ne: true } }).toArray();
    console.log(`Found ${activePubs.length} active publications in MongoDB.`);

    const ranked = activePubs.map(pub => {
      const entry = pub.bibtexEntry || {};
      const type = entry.type || "unknown";
      const citationKey = entry.citationKey || "unknown";
      const tags = entry.tags || {};

      let score = 0;
      const tagKeys = Object.keys(tags);
      score += tagKeys.length * 2; // more tags = more complex

      // Add points for specific complex or non-standard tags
      if (tags.journaltitle) score += 5;
      if (tags.shortjournal) score += 3;
      if (tags.doi && tags.doi.value) score += 4;
      if (tags.url && tags.url.value) score += 4;
      if (tags.abstract && tags.abstract.value) score += 5;
      if (tags.keywords && tags.keywords.value) score += 3;
      if (tags.urldate && tags.urldate.value) score += 4;
      if (tags.isbn && tags.isbn.value) score += 4;
      if (tags.issn && tags.issn.value) score += 4;

      return {
        id: pub._id,
        citationKey,
        type,
        title: tags.title?.value || tags.booktitle?.value || "Untitled",
        score,
        tagKeys,
        tags
      };
    });

    // Sort by complexity score descending
    ranked.sort((a, b) => b.score - a.score);

    console.log("\n=== TOP 5 MOST COMPLEX BIBTEX CASES IN MONGODB ===");
    const topCases = ranked.slice(0, 5);

    topCases.forEach((item, index) => {
      console.log(`\n[Test Case #${index + 1}]`);
      console.log(`- Score: ${item.score}`);
      console.log(`- MongoDB _id: ${item.id}`);
      console.log(`- Citation Key: ${item.citationKey}`);
      console.log(`- Type: ${item.type}`);
      console.log(`- Title: "${item.title}"`);
      console.log(`- Tags Present (${item.tagKeys.length}): ${item.tagKeys.join(", ")}`);
      
      // Print detailed tags
      const cleanTags: Record<string, string> = {};
      for (const [k, v] of Object.entries(item.tags)) {
        if (v && typeof v === "object") {
          cleanTags[k] = (v as any).value || "";
        }
      }
      console.log(`- Detailed Tags:`, JSON.stringify(cleanTags, null, 2));
    });

  } catch (error) {
    console.error("Error finding complex cases:", error);
  } finally {
    await client.close();
  }
}

main();

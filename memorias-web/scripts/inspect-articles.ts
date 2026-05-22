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
    for (const art of activeArticles) {
      const entry = art.bibtexEntry;
      const tags = entry?.tags || {};
      const journalTag = tags.journal;
      const journalVal = journalTag?.value;

      if (!journalVal) {
        console.log(`\nID: ${art._id}`);
        console.log(`CitationKey: ${entry?.citationKey}`);
        console.log(`Title: ${tags.title?.value}`);
        console.log(`journalTag:`, journalTag);
        console.log(`journaltitleTag:`, tags.journaltitle);
        console.log(`shortjournalTag:`, tags.shortjournal);
        console.log(`doi:`, tags.doi?.value);
      }
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

main();

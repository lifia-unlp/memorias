import "dotenv/config";
import { MongoClient } from "mongodb";

async function main() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("lifiometro");
    const collection = db.collection("BibtexReference");

    const pubsWithTheses = await collection.find({
      relatedThesis: { $exists: true, $not: { $size: 0 } },
      trashed: { $ne: true }
    }).toArray();

    console.log(`Found ${pubsWithTheses.length} active publications with related theses in MongoDB:`);
    for (const pub of pubsWithTheses) {
      console.log(`- ID: ${pub._id}, CitationKey: ${pub.bibtexEntry?.citationKey}, Title: ${pub.bibtexEntry?.tags?.title?.value || pub.bibtexEntry?.tags?.booktitle?.value}`);
      console.log(`  Thesis IDs:`, JSON.stringify(pub.relatedThesis));
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

main();

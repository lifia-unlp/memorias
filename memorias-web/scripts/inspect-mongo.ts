import "dotenv/config";
import { MongoClient } from "mongodb";

async function main() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected successfully to MongoDB server");

    const db = client.db("lifiometro");
    const collections = await db.listCollections().toArray();
    console.log("\n--- Collections found ---");
    for (const col of collections) {
      console.log(`- ${col.name}`);
    }

    for (const col of collections) {
      console.log(`\n=========================================`);
      console.log(`Collection: ${col.name}`);
      console.log(`=========================================`);
      
      const sample = await db.collection(col.name).findOne({});
      if (sample) {
        console.log(JSON.stringify(sample, null, 2));
      } else {
        console.log("(No documents found)");
      }
    }
  } catch (error) {
    console.error("Error inspecting MongoDB:", error);
  } finally {
    await client.close();
  }
}

main();

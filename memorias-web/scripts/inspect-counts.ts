import { MongoClient } from "mongodb";

async function main() {
  const uri = "mongodb://127.0.0.1:27017";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("lifiometro");
    const collections = await db.listCollections().toArray();

    console.log("\n=========================================");
    console.log("COLLECTION DOCUMENT COUNTS");
    console.log("=========================================");
    
    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments({});
      const doc = await db.collection(col.name).findOne({});
      console.log(`- ${col.name}: ${count} documents`);
      if (doc) {
        console.log(`  Keys: ${Object.keys(doc).join(", ")}`);
        // If there are relation-like fields, print them
        const relFields = Object.keys(doc).filter(k => {
          const val = doc[k];
          return typeof val === 'object' && val !== null && 
            (val["__id"] || val["#collection"] || Array.isArray(val));
        });
        if (relFields.length > 0) {
          console.log(`  Potential relations: ${relFields.join(", ")}`);
        }
      }
    }
  } catch (error) {
    console.error("Error inspecting counts:", error);
  } finally {
    await client.close();
  }
}

main();

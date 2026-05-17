import { MongoClient } from "mongodb";

async function main() {
  const uri = "mongodb://127.0.0.1:27017";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("lifiometro");

    const collections = ["Lifian", "Project", "Thesis", "Scholarship", "BibtexReference"];
    
    for (const colName of collections) {
      console.log(`\n=========================================`);
      console.log(`DETAILS FOR COLLECTION: ${colName}`);
      console.log(`=========================================`);
      
      // Find a document that has non-empty relation-like fields if possible
      const cursor = db.collection(colName).find({});
      let doc = null;
      
      while (await cursor.hasNext()) {
        const d = await cursor.next();
        // Check if there are related items in standard fields
        const hasRelations = d && Object.keys(d).some(k => 
          (k.startsWith("related") || k === "projects" || k === "publications" || k === "adviced") && 
          Array.isArray(d[k]) && d[k].length > 0
        );
        if (hasRelations) {
          doc = d;
          break;
        }
      }
      
      // Fallback to first document
      if (!doc) {
        doc = await db.collection(colName).findOne({});
      }
      
      console.log(JSON.stringify(doc, null, 2));
    }
  } catch (error) {
    console.error("Error inspecting details:", error);
  } finally {
    await client.close();
  }
}

main();

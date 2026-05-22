import Cite from "citation-js";

const dois = [
  "10.1007/978-1-4471-7440-0\\_29", // DBLP:series/hci/FirmenichGPR19
  "10.24215/18509959.28.e53", // Casali_2021
  "10.17660/actahortic.2021.1311.24", // Liu_2021
  "10.1007/s11042-020-09803-8", // 2020 Sketching enactive interactions
  "10.1016/j.csi.2022.103633", // Bosetti_2022
  "10.22163/fteval.2022.574", // Arancio_2022
  "10.36561/ing.27.2", // Garcia_Alonso_2024
  "10.36561/ing.27.19", // Bibbo_2024
  "10.1007/s11128-024-04586-5", // Aparicio_Morales_2024
  "10.24215/18509959.28.e14", // Lliteras_2021
  "10.35537/10915/158339", // 2023 Decisioning 2022
  "10.35537/10915/179170", // 2025 LACLO 2024
  "10.35537/10915/172755", // 2024 CACIC 2024
  "10.24215/18509959.42.e20", // De_Benedetto_2025
  "10.15847/cct.40914" // Torres_2026
];

async function main() {
  for (const rawDoi of dois) {
    const cleanDoi = rawDoi.replace(/\\_/g, "_").replace(/\\/g, "").trim();
    console.log(`\n-----------------------------------------`);
    console.log(`Resolving Cleaned DOI: "${cleanDoi}" (Original: "${rawDoi}")`);
    try {
      const data = await (Cite as any).async(cleanDoi);
      const obj = data.format("data", { format: "object" })?.[0];
      if (!obj) {
        console.log(`❌ No object returned by citation-js`);
        continue;
      }
      console.log(`✅ Success:`);
      console.log(`- type: ${obj.type}`);
      console.log(`- title: "${obj.title}"`);
      console.log(`- container-title: "${obj["container-title"]}"`);
      console.log(`- volume: "${obj.volume}"`);
      console.log(`- publisher: "${obj.publisher}"`);
      console.log(`- page: "${obj.page}"`);
      console.log(`- ISBN: "${obj.ISBN}"`);
      console.log(`- ISSN: "${obj.ISSN}"`);
      console.log(`- author count: ${obj.author?.length}`);
    } catch (err: any) {
      console.log(`❌ Error: ${err.message || err}`);
    }
  }
}

main();

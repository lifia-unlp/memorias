import Cite from "citation-js";

async function testDoi(doi: string) {
  try {
    console.log(`Resolving DOI: ${doi}`);
    const data = await Cite.async(doi);
    const output = data.format("data", { format: "object" });
    console.log("Resolved structure:", JSON.stringify(output, null, 2));
  } catch (error) {
    console.error(`Failed to resolve ${doi}:`, error);
  }
}

async function main() {
  await testDoi("10.1007/s11042-020-09803-8");
  console.log("\n-----------------------------------\n");
  await testDoi("10.24215/16666038.20.e13");
}

main();

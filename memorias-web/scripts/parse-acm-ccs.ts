import * as fs from "fs";
import * as path from "path";
import { JSDOM } from "jsdom";

async function parseAcmCcs() {
  const contentPath = path.join(__dirname, "acm_ccs2012.xml");
  const fileContent = fs.readFileSync(contentPath, "utf-8");
  
  // Parse with JSDOM
  const dom = new JSDOM(fileContent, { contentType: "text/xml" });
  const document = dom.window.document;
  
  const conceptElements = document.getElementsByTagName("skos:Concept");
  console.log(`Found ${conceptElements.length} concepts in XML.`);
  
  interface ConceptNode {
    id: string;
    label: string;
    broader: string | null;
    narrower: string[];
  }
  
  const conceptMap = new Map<string, ConceptNode>();
  const flatLookup: { [id: string]: string } = {};
  
  for (let i = 0; i < conceptElements.length; i++) {
    const el = conceptElements[i];
    const aboutAttr = el.getAttribute("rdf:about");
    if (!aboutAttr) continue;
    
    // Find prefLabel for English
    let label = "";
    const prefLabels = el.getElementsByTagName("skos:prefLabel");
    for (let j = 0; j < prefLabels.length; j++) {
      if (prefLabels[j].getAttribute("lang") === "en") {
        label = prefLabels[j].textContent || "";
        break;
      }
    }
    
    // Find broader
    let broader: string | null = null;
    const broaderEls = el.getElementsByTagName("skos:broader");
    if (broaderEls.length > 0) {
      const res = broaderEls[0].getAttribute("rdf:resource");
      if (res) broader = res;
    }
    
    // Find narrower
    const narrower: string[] = [];
    const narrowerEls = el.getElementsByTagName("skos:narrower");
    for (let j = 0; j < narrowerEls.length; j++) {
      const res = narrowerEls[j].getAttribute("rdf:resource");
      if (res) narrower.push(res);
    }
    
    conceptMap.set(aboutAttr, {
      id: aboutAttr,
      label,
      broader,
      narrower
    });
    
    flatLookup[aboutAttr] = label;
  }
  
  // Find top concepts in Scheme
  const topConcepts: string[] = [];
  const schemeElements = document.getElementsByTagName("skos:ConceptScheme");
  if (schemeElements.length > 0) {
    const hasTopConcepts = schemeElements[0].getElementsByTagName("skos:hasTopConcept");
    for (let j = 0; j < hasTopConcepts.length; j++) {
      const res = hasTopConcepts[j].getAttribute("rdf:resource");
      if (res) topConcepts.push(res);
    }
  }
  
  // If topConcepts was not parsed correctly, fallback to finding nodes with no broader or where broader is ccs2012
  if (topConcepts.length === 0) {
    for (const [id, node] of conceptMap.entries()) {
      if (!node.broader || node.broader === "ccs2012") {
        topConcepts.push(id);
      }
    }
  }
  
  console.log(`Found ${topConcepts.length} top concepts.`);
  
  // Recursive function to build tree
  interface TreeNode {
    id: string;
    label: string;
    children?: TreeNode[];
  }
  
  function buildSubtree(conceptId: string): TreeNode | null {
    const node = conceptMap.get(conceptId);
    if (!node) return null;
    
    const treeNode: TreeNode = {
      id: node.id,
      label: node.label
    };
    
    if (node.narrower && node.narrower.length > 0) {
      const children: TreeNode[] = [];
      for (const childId of node.narrower) {
        const subtree = buildSubtree(childId);
        if (subtree) children.push(subtree);
      }
      if (children.length > 0) {
        // Sort children alphabetically by label
        children.sort((a, b) => a.label.localeCompare(b.label));
        treeNode.children = children;
      }
    }
    
    return treeNode;
  }
  
  const rootNodes: TreeNode[] = [];
  for (const topId of topConcepts) {
    const rootSubtree = buildSubtree(topId);
    if (rootSubtree) rootNodes.push(rootSubtree);
  }
  
  // Sort root nodes alphabetically by label
  rootNodes.sort((a, b) => a.label.localeCompare(b.label));
  
  // Save both tree and flat lookup
  const outDir = path.join(__dirname, "../src/lib");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(outDir, "acm_ccs.json"),
    JSON.stringify(rootNodes, null, 2),
    "utf-8"
  );
  
  fs.writeFileSync(
    path.join(outDir, "acm_ccs_flat.json"),
    JSON.stringify(flatLookup, null, 2),
    "utf-8"
  );
  
  console.log("Successfully parsed ACM CCS XML and generated JSON files!");
}

parseAcmCcs().catch(console.error);

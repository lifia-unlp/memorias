import flatLookup from "./acm_ccs_flat.json";

export interface AcmInterest {
  id: string;
  label: string;
  path: string[];
}

/**
 * Generates the full hierarchical path labels from root to leaf for a given concept ID.
 * Example: "10010405.10010476" -> ["Applied computing", "Computers in other domains"]
 */
export function getAcmCcsPath(id: string): string[] {
  const parts = id.split(".");
  const path: string[] = [];
  let current = "";
  
  for (let i = 0; i < parts.length; i++) {
    current = current ? `${current}.${parts[i]}` : parts[i];
    const label = (flatLookup as Record<string, string>)[current];
    if (label) {
      path.push(label);
    }
  }
  
  return path;
}

/**
 * Safely parses the stored interests string.
 * If it is a valid JSON array of concept IDs, resolves their labels and full paths.
 * If it is legacy raw plain text or null/empty, returns null.
 */
export function safeParseAcmInterests(interestsStr: string | null): AcmInterest[] | null {
  if (!interestsStr) return null;
  
  const trimmed = interestsStr.trim();
  if (!trimmed.startsWith("[") || !trimmed.endsWith("]")) {
    return null; // Clearly not a JSON array
  }
  
  try {
    const parsed = JSON.parse(trimmed);
    if (!Array.isArray(parsed)) {
      return null;
    }
    
    // Filter to ensure all items are strings
    const ids = parsed.filter((item): item is string => typeof item === "string");
    
    return ids.map((id) => {
      const label = (flatLookup as Record<string, string>)[id] || id;
      const path = getAcmCcsPath(id);
      return { id, label, path };
    });
  } catch (e) {
    return null; // JSON parsing failed, treat as legacy plain text
  }
}

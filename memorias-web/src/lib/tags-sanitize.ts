/**
 * Standardizes a tag string by lowercasing, trimming, and collapsing double spaces.
 */
export function sanitizeTag(tag: string): string {
  if (!tag) return "";
  return tag
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/**
 * Normalizes text by converting to lowercase, normalizing unicode representation (NFD),
 * and stripping accents/diacritics.
 */
export function normalizeText(val: string | null | undefined): string {
  if (!val) return "";
  return val
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/**
 * Checks if a set of tokens matches against a list of searchable values/fields.
 * Returns true if EVERY token matches at least one of the searchable values.
 */
export function matchQueryTokens(
  query: string,
  searchableValues: (string | null | undefined | string[])[]
): boolean {
  const trimmed = query.trim();
  if (!trimmed) return true;

  const tokens = normalizeText(trimmed).split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return true;

  // Flatten and normalize searchable values
  const normalizedValues: string[] = [];
  for (const val of searchableValues) {
    if (!val) continue;
    if (Array.isArray(val)) {
      for (const item of val) {
        if (item) {
          normalizedValues.push(normalizeText(item));
        }
      }
    } else {
      normalizedValues.push(normalizeText(val));
    }
  }

  // Every token must match (be a substring of) at least one of the normalized searchable values
  return tokens.every((token) =>
    normalizedValues.some((val) => val.includes(token))
  );
}

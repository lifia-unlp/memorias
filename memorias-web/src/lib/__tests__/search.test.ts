import { describe, it, expect } from "vitest";
import { normalizeText, matchQueryTokens } from "../search";

describe("Search Utility", () => {
  describe("normalizeText", () => {
    it("should return empty string for null, undefined, or empty inputs", () => {
      expect(normalizeText(null)).toBe("");
      expect(normalizeText(undefined)).toBe("");
      expect(normalizeText("")).toBe("");
    });

    it("should convert text to lowercase", () => {
      expect(normalizeText("HELLO WORLD")).toBe("hello world");
    });

    it("should strip accents and diacritics", () => {
      expect(normalizeText("Cientópolis")).toBe("cientopolis");
      expect(normalizeText("Mendéz")).toBe("mendez");
      expect(normalizeText("áéíóúÁÉÍÓÚñÑ")).toBe("aeiouaeiounn");
    });
  });

  describe("matchQueryTokens", () => {
    const fields = ["Diego", "Torres", "PhD Student", ["science", "computing"]];

    it("should return true for empty or whitespace-only queries", () => {
      expect(matchQueryTokens("", fields)).toBe(true);
      expect(matchQueryTokens("   ", fields)).toBe(true);
    });

    it("should match single-word queries case-insensitively", () => {
      expect(matchQueryTokens("diego", fields)).toBe(true);
      expect(matchQueryTokens("TORRES", fields)).toBe(true);
      expect(matchQueryTokens("phd", fields)).toBe(true);
    });

    it("should match multi-word queries with AND logic", () => {
      // Both "diego" and "torres" are found in the fields
      expect(matchQueryTokens("Diego Torres", fields)).toBe(true);
      // "diego" is found, but "nonexistent" is not
      expect(matchQueryTokens("Diego nonexistent", fields)).toBe(false);
    });

    it("should match order-independently", () => {
      expect(matchQueryTokens("Torres Diego", fields)).toBe(true);
    });

    it("should match initials and partial words", () => {
      expect(matchQueryTokens("Diego T", fields)).toBe(true);
      expect(matchQueryTokens("D Torr", fields)).toBe(true);
    });

    it("should match tags inside arrays", () => {
      expect(matchQueryTokens("science", fields)).toBe(true);
      expect(matchQueryTokens("Diego computing", fields)).toBe(true);
    });

    it("should match diacritic-insensitively", () => {
      const accentedFields = ["Sebastián", "Cientópolis"];
      expect(matchQueryTokens("sebastian", accentedFields)).toBe(true);
      expect(matchQueryTokens("cientopolis", accentedFields)).toBe(true);
    });
  });
});

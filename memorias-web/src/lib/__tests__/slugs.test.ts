import { describe, it, expect } from "vitest";
import { slugify } from "../slugs";

describe("Slugification Utility", () => {
  it("should convert uppercase characters to lowercase", () => {
    expect(slugify("My Test Title")).toBe("my-test-title");
  });

  it("should trim surrounding whitespace", () => {
    expect(slugify("   trimmed value   ")).toBe("trimmed-value");
  });

  it("should strip accents/diacritics", () => {
    expect(slugify("Música y Educación")).toBe("musica-y-educacion");
    expect(slugify("Niño y Cigüeña")).toBe("nino-y-ciguena"); // Note: cigueña is normalized to NFD, so 'ñ' and 'ü' accents are stripped (ñ becomes n, ü becomes u)
  });

  it("should replace non-alphanumeric characters with hyphens", () => {
    expect(slugify("hello_world & stuff")).toBe("hello-world-stuff");
  });

  it("should prevent duplicate hyphens and strip trailing/leading hyphens", () => {
    expect(slugify("---hello---world---")).toBe("hello-world");
  });
});

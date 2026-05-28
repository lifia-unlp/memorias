import { describe, it, expect } from "vitest";
import { getAcmCcsPath, safeParseAcmInterests } from "../acm-ccs-utils";

describe("ACM CCS Utilities", () => {
  describe("getAcmCcsPath", () => {
    it("should resolve single root concept path correctly", () => {
      const path = getAcmCcsPath("10010405");
      expect(path).toEqual(["Applied computing"]);
    });

    it("should resolve nested concept path with breadcrumbs", () => {
      const path = getAcmCcsPath("10010405.10010476.10010480");
      expect(path).toEqual([
        "Applied computing",
        "Computers in other domains",
        "Agriculture",
      ]);
    });

    it("should gracefully skip missing/invalid parts but keep valid parts", () => {
      const path = getAcmCcsPath("10010405.invalid.10010480");
      expect(path).toEqual(["Applied computing"]);
    });
  });

  describe("safeParseAcmInterests", () => {
    it("should return null for null or undefined strings", () => {
      expect(safeParseAcmInterests(null)).toBeNull();
      expect(safeParseAcmInterests("")).toBeNull();
    });

    it("should return null for non-JSON legacy plain text", () => {
      const legacyText = "I am interested in Distributed Systems and Cloud Computing.";
      expect(safeParseAcmInterests(legacyText)).toBeNull();
    });

    it("should return null for malformed JSON starting with brackets", () => {
      expect(safeParseAcmInterests("[10010405, 10010520")).toBeNull();
    });

    it("should parse valid JSON array of concept IDs correctly", () => {
      const jsonStr = JSON.stringify([
        "10010405.10010476.10010480",
        "10010520",
      ]);
      const parsed = safeParseAcmInterests(jsonStr);
      
      expect(parsed).not.toBeNull();
      expect(parsed).toHaveLength(2);
      
      expect(parsed![0]).toEqual({
        id: "10010405.10010476.10010480",
        label: "Agriculture",
        path: ["Applied computing", "Computers in other domains", "Agriculture"],
      });
      
      expect(parsed![1]).toEqual({
        id: "10010520",
        label: "Computer systems organization",
        path: ["Computer systems organization"],
      });
    });

    it("should parse empty JSON array as empty array", () => {
      expect(safeParseAcmInterests("[]")).toEqual([]);
    });

    it("should return null if parsed JSON is not an array", () => {
      expect(safeParseAcmInterests('{"interests": "none"}')).toBeNull();
    });
  });
});

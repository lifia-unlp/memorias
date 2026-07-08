import { describe, it, expect } from "vitest";
import {
  getString,
  getBoolean,
  getInt,
  getTags,
  getArray,
  parseMemberFormData,
  parseProjectFormData,
  parseThesisFormData,
  parseScholarshipFormData,
} from "../mappers";

describe("mappers utilities", () => {
  describe("base conversion helpers", () => {
    it("getString trims values and converts empty strings to null", () => {
      const fd = new FormData();
      fd.append("name", " Diego  ");
      fd.append("empty", "  ");
      fd.append("missing", "");

      expect(getString(fd, "name")).toBe("Diego");
      expect(getString(fd, "empty")).toBeNull();
      expect(getString(fd, "missing")).toBeNull();
      expect(getString(fd, "nonexistent")).toBeNull();
    });

    it("getBoolean parses 'true' correctly", () => {
      const fd = new FormData();
      fd.append("t", "true");
      fd.append("f", "false");
      fd.append("other", "random");

      expect(getBoolean(fd, "t")).toBe(true);
      expect(getBoolean(fd, "f")).toBe(false);
      expect(getBoolean(fd, "other")).toBe(false);
    });

    it("getInt parses integers correctly", () => {
      const fd = new FormData();
      fd.append("num", "42");
      fd.append("invalid", "abc");
      fd.append("empty", "");

      expect(getInt(fd, "num")).toBe(42);
      expect(getInt(fd, "invalid")).toBeNull();
      expect(getInt(fd, "empty")).toBeNull();
    });

    it("getTags splits comma-separated strings and sanitizes each tag", () => {
      const fd = new FormData();
      fd.append("tags", "  react, next-js,  , redux ");

      expect(getTags(fd)).toEqual(["react", "next-js", "redux"]);
    });

    it("getArray collects multiple checkbox values", () => {
      const fd = new FormData();
      fd.append("members", "m1");
      fd.append("members", "m2");

      expect(getArray(fd, "members")).toEqual(["m1", "m2"]);
    });
  });

  describe("entity mappers", () => {
    it("parseMemberFormData maps member properties and throws on missing required names", () => {
      const fd = new FormData();
      fd.append("firstName", "Diego");
      fd.append("lastName", "Torres");
      fd.append("highestDegree", "PhD");
      fd.append("tags", "ai, nlp");

      const result = parseMemberFormData(fd);
      expect(result).toMatchObject({
        firstName: "Diego",
        lastName: "Torres",
        highestDegree: "PhD",
        tags: ["ai", "nlp"],
      });

      // Missing lastName throws error
      const fdError = new FormData();
      fdError.append("firstName", "Diego");
      expect(() => parseMemberFormData(fdError)).toThrow("Last Name is required.");
    });

    it("parseProjectFormData maps project fields and validates dates", () => {
      const fd = new FormData();
      fd.append("title", "MEMORIAS");
      fd.append("startDate", "2023-01-01");
      fd.append("endDate", "2023-12-31");
      fd.append("featured", "true");

      const result = parseProjectFormData(fd);
      expect(result.title).toBe("MEMORIAS");
      expect(result.featured).toBe(true);
      expect(result.startDate).toBeInstanceOf(Date);

      // Missing dates throw error
      const fdError = new FormData();
      fdError.append("title", "Fail");
      expect(() => parseProjectFormData(fdError)).toThrow("Start Date and End Date are required fields.");
    });
  });
});

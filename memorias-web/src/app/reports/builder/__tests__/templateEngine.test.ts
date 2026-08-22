import { describe, it, expect } from "vitest";
import {
  renderTemplate,
  formatDatePattern,
  DEFAULT_PROJECT_TEMPLATE,
  DEFAULT_PUBLICATION_TEMPLATE,
} from "../templateEngine";

describe("templateEngine", () => {
  describe("formatDatePattern", () => {
    it("formats ISO date string according to pattern", () => {
      const date = "2024-03-15T00:00:00.000Z";
      expect(formatDatePattern(date, "MM/YYYY")).toBe("03/2024");
      expect(formatDatePattern(date, "DD/MM/YYYY")).toBe("15/03/2024");
      expect(formatDatePattern(date, "YYYY")).toBe("2024");
    });

    it("returns fallback for null or invalid date", () => {
      expect(formatDatePattern(null, "MM/YYYY", "Ongoing")).toBe("Ongoing");
      expect(formatDatePattern("invalid-date", "MM/YYYY")).toBe("N/D");
    });
  });

  describe("renderTemplate", () => {
    it("replaces simple variables", () => {
      const template = "Title: {{title}}, Code: {{code}}";
      const data = { title: "Project Alpha", code: "P-101" };
      expect(renderTemplate(template, data)).toBe("Title: Project Alpha, Code: P-101");
    });

    it("evaluates {{#if}} conditionals correctly", () => {
      const template = "Title: {{title}}{{#if director}}, Dir: {{director}}{{/if}}{{#if coDirector}}, Co-Dir: {{coDirector}}{{/if}}.";
      const dataWithDirector = { title: "Project Alpha", director: "Dr. Smith" };
      expect(renderTemplate(template, dataWithDirector)).toBe("Title: Project Alpha, Dir: Dr. Smith.");

      const dataWithNA = { title: "Project Alpha", director: "N/A" };
      expect(renderTemplate(template, dataWithNA)).toBe("Title: Project Alpha.");
    });

    it("evaluates {{#if}}...{{else}}...{{/if}} branches correctly", () => {
      const template = 'Active from {{date startDate "MM/YYYY"}}{{#if endDate}} to {{date endDate "MM/YYYY"}}{{else}} (Ongoing){{/if}}.';
      
      const ongoingData = { startDate: "2023-01-01", endDate: null };
      expect(renderTemplate(template, ongoingData)).toBe("Active from 01/2023 (Ongoing).");

      const finishedData = { startDate: "2023-01-01", endDate: "2024-05-01" };
      expect(renderTemplate(template, finishedData)).toBe("Active from 01/2023 to 05/2024.");
    });

    it("supports unescaped HTML {{{citationHtml}}}", () => {
      const template = "{{{citationHtml}}}\n{{#if abstract}}Abstract: {{abstract}}{{/if}}";
      const data = { citationHtml: "<i>Author (2024).</i> Title.", abstract: "Some summary" };
      expect(renderTemplate(template, data)).toBe("<i>Author (2024).</i> Title.\nAbstract: Some summary");
    });

    it("renders DEFAULT_PROJECT_TEMPLATE cleanly", () => {
      const data = {
        title: "Test Project",
        code: "TP-01",
        startDate: "2023-01-01",
        endDate: null,
        director: "Dr. Director",
        coDirector: null,
        responsibleGroup: "LIFIA",
        fundingAgency: "CONICET",
        amount: "$5000",
        summary: "This is a test summary.",
        website: "https://example.org",
      };

      const result = renderTemplate(DEFAULT_PROJECT_TEMPLATE, data);
      expect(result).toContain("### Test Project (Code: TP-01)");
      expect(result).toContain("Active from 01/2023 (Ongoing)");
      expect(result).toContain("directed by Dr. Director");
      expect(result).toContain("under responsible group LIFIA");
      expect(result).toContain("with funding provided by CONICET (amount: $5000).");
      expect(result).toContain("*Summary:* This is a test summary.");
      expect(result).toContain("[Website](https://example.org)");
    });

    it("renders DEFAULT_PUBLICATION_TEMPLATE cleanly without double DOI or Vancouver static index", () => {
      const data = {
        citationHtml: "1. Smith, J. (2024). Paper title. <i>Journal</i>.",
        selfArchivingUrl: "https://sedici.unlp.edu.ar/handle/10915/123",
        abstract: "Publication abstract text.",
      };

      const result = renderTemplate(DEFAULT_PUBLICATION_TEMPLATE, data);
      expect(result).toContain(data.citationHtml);
      expect(result).toContain("[Repository / Self-archiving](https://sedici.unlp.edu.ar/handle/10915/123)");
      expect(result).toContain("*Abstract:* Publication abstract text.");
    });
  });
});

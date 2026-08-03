import { describe, it, expect } from "vitest";
import { escapeHtml, sanitizeUrl, sanitizeHtml } from "../sanitize";

describe("Sanitization & XSS Prevention (Issue #55)", () => {
  describe("escapeHtml", () => {
    it("escapes special HTML characters (<, >, &, \", ')", () => {
      const malicious = '<script>alert("XSS & attack")</script>';
      const escaped = escapeHtml(malicious);
      expect(escaped).not.toContain("<script>");
      expect(escaped).toBe("&lt;script&gt;alert(&quot;XSS &amp; attack&quot;)&lt;/script&gt;");
    });

    it("handles null and undefined gracefully", () => {
      expect(escapeHtml(null)).toBe("");
      expect(escapeHtml(undefined)).toBe("");
    });
  });

  describe("sanitizeUrl", () => {
    it("allows valid http and https URLs", () => {
      expect(sanitizeUrl("https://doi.org/10.1000/182")).toContain("https://doi.org/10.1000/182");
      expect(sanitizeUrl("http://example.com/paper.pdf")).toContain("http://example.com/paper.pdf");
    });

    it("blocks javascript: and data: URLs", () => {
      expect(sanitizeUrl("javascript:alert('xss')")).toBe("#");
      expect(sanitizeUrl("javascript:void(0)")).toBe("#");
      expect(sanitizeUrl("data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==")).toBe("#");
    });
  });

  describe("sanitizeHtml", () => {
    it("strips script tags and inline event handlers (onerror, onload, onclick)", () => {
      const dirty = '<p>Safe text</p><script>alert("XSS")</script><img src="x" onerror="alert(1)">';
      const clean = sanitizeHtml(dirty);
      expect(clean).not.toContain("<script>");
      expect(clean).not.toContain("onerror");
      expect(clean).not.toContain("alert");
      expect(clean).toContain("Safe text");
    });

    it("strips iframe and object tags", () => {
      const dirty = '<iframe src="https://evil.com"></iframe><object data="evil.swf"></object><span>Clean</span>';
      const clean = sanitizeHtml(dirty);
      expect(clean).not.toContain("<iframe");
      expect(clean).not.toContain("<object");
      expect(clean).toContain("Clean");
    });

    it("preserves safe formatting elements (b, i, em, strong, a, p, ul, li)", () => {
      const formatted = '<p>Author: <strong>Smith, J.</strong> (2024). <em>Journal of Science</em>. <a href="https://doi.org/10.1000/182">DOI Link</a></p>';
      const clean = sanitizeHtml(formatted);
      expect(clean).toContain("<strong>Smith, J.</strong>");
      expect(clean).toContain("<em>Journal of Science</em>");
      expect(clean).toContain('href="https://doi.org/10.1000/182"');
    });
  });
});

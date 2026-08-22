/**
 * Security sanitization library for escaping dynamic user input
 * and sanitizing HTML content before rendering via dangerouslySetInnerHTML.
 */

/**
 * Escapes special HTML characters in text content to prevent XSS.
 */
export function escapeHtml(str: string | null | undefined): string {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Validates and sanitizes URLs to ensure they only use safe protocols (http, https, or relative).
 * Rejects javascript:, data:, vbscript: and malformed URLs.
 */
export function sanitizeUrl(url: string | null | undefined): string {
  if (!url) return "#";
  const trimmed = String(url).trim();
  if (/^(https?:|\/|mailto:)/i.test(trimmed)) {
    return escapeHtml(trimmed);
  }
  return "#";
}

const ALLOWED_TAGS = new Set([
  "a", "b", "i", "em", "strong", "code", "pre", "p", "br",
  "ul", "ol", "li", "span", "div", "h1", "h2", "h3", "h4",
  "h5", "h6", "blockquote", "hr", "table", "thead", "tbody",
  "tr", "th", "td", "img", "sub", "sup"
]);

const ALLOWED_ATTRS = new Set([
  "href", "target", "rel", "class", "id", "title",
  "src", "alt", "width", "height", "align", "valign"
]);

/**
 * Sanitizes HTML string using DOMParser (or regex fallback) to remove dangerous tags,
 * event handlers (on*), and unsafe URL schemes.
 */
export function sanitizeHtml(dirtyHtml: string | null | undefined): string {
  if (!dirtyHtml) return "";
  const rawStr = String(dirtyHtml).replace(/&#38;/g, "&").replace(/&#x26;/g, "&");

  // In browser or JSDOM environments, parse with DOMParser
  if (typeof window !== "undefined" && typeof DOMParser !== "undefined") {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(`<body>${rawStr}</body>`, "text/html");
      cleanNode(doc.body);
      return doc.body.innerHTML;
    } catch {
      // Fallback to regex cleaning if DOMParser fails
    }
  }

  // Node environment fallback / regex cleaning
  return fallbackSanitize(rawStr);
}

function cleanNode(node: Node) {
  const children = Array.from(node.childNodes);
  for (const child of children) {
    if (child.nodeType === 1) {
      // Element node
      const el = child as HTMLElement;
      const tagName = el.tagName.toLowerCase();

      if (!ALLOWED_TAGS.has(tagName)) {
        // Remove prohibited tags (e.g. script, iframe, style, object, embed)
        el.remove();
        continue;
      }

      // Clean attributes
      const attrs = Array.from(el.attributes);
      for (const attr of attrs) {
        const attrName = attr.name.toLowerCase();

        // Strip inline event handlers (onerror, onload, onclick, etc.)
        if (attrName.startsWith("on")) {
          el.removeAttribute(attr.name);
          continue;
        }

        if (!ALLOWED_ATTRS.has(attrName)) {
          el.removeAttribute(attr.name);
          continue;
        }

        // Validate URL attributes
        if (attrName === "href" || attrName === "src") {
          const val = attr.value.trim();
          if (/^(javascript|data|vbscript):/i.test(val)) {
            el.removeAttribute(attr.name);
          }
        }
      }

      // Recursively clean children
      cleanNode(el);
    }
  }
}

function fallbackSanitize(html: string): string {
  // Strip script, style, iframe, object, embed tags and their contents
  let clean = html.replace(/<(script|style|iframe|object|embed)[\s\S]*?<\/\1>/gi, "");
  // Strip inline event handlers
  clean = clean.replace(/\s*on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  // Strip javascript: URLs
  clean = clean.replace(/href\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*'|javascript:[^\s>]+)/gi, 'href="#"');
  clean = clean.replace(/src\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*'|javascript:[^\s>]+)/gi, "");
  return clean;
}

/**
 * markdown.js
 *
 * MarkdownRenderer — wraps the marked.js library.
 *
 * Responsibilities:
 *   - Configure marked once, at construction time.
 *   - Expose a single render(source) method used by ChatView.
 *   - Keep all markdown configuration in one place so it is easy to swap
 *     the underlying library later without touching any other module.
 */

export class MarkdownRenderer {
  constructor() {
    if (typeof marked === "undefined") {
      throw new Error(
        "MarkdownRenderer: marked.js is not loaded. " +
        "Add <script src='https://cdn.jsdelivr.net/npm/marked/marked.min.js'></script> " +
        "before the module entry point."
      );
    }

    marked.setOptions({
      breaks: true,   // single newline → <br>
      gfm: true,      // GitHub-Flavoured Markdown (tables, strikethrough, etc.)
    });
  }

  /**
   * Render a Markdown source string to an HTML string.
   * @param {string} source - Raw Markdown text.
   * @returns {string} Rendered HTML.
   */
  render(source) {
    return marked.parse(source ?? "");
  }
}

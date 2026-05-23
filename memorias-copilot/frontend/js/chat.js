/**
 * chat.js
 *
 * ChatView — owns everything that happens inside the message list.
 *
 * Responsibilities:
 *   - Render user and copilot messages as full-width rows.
 *   - Stream a copilot response chunk-by-chunk into a live row.
 *   - Handle inline message editing (show editor, cancel, save).
 *   - Show / hide the truncation notice when editing would remove later messages.
 *   - Show / hide the thinking indicator.
 *   - Expose the conversation history as an array of { role, content } objects
 *     (raw Markdown source, not rendered HTML) for download and API calls.
 *   - Emit events via a simple callback interface so App stays decoupled.
 *
 * It does NOT know about the backend, OpenAI, or the download format.
 */

import { MarkdownRenderer } from "./markdown.js";

/** @typedef {{ role: "user"|"assistant", content: string }} Message */

export class ChatView {
  /**
   * @param {{
   *   messageList: HTMLElement,
   *   emptyState:  HTMLElement,
   *   thinkingRow: HTMLElement,
   *   truncationNotice: HTMLElement,
   *   onUserEdit: function(index: number, newContent: string): void
   * }} options
   */
  constructor({ messageList, emptyState, thinkingRow, truncationNotice, onUserEdit }) {
    this._list           = messageList;
    this._emptyState     = emptyState;
    this._thinkingRow    = thinkingRow;
    this._truncation     = truncationNotice;
    this._onUserEdit     = onUserEdit;
    this._renderer       = new MarkdownRenderer();

    /** @type {Message[]} Raw conversation history (Markdown source). */
    this._history = [];

    /** @type {HTMLElement[]} Rendered message row elements, parallel to _history. */
    this._rows = [];

    /** Index of the message currently being streamed into (-1 = none). */
    this._streamingIndex = -1;
  }

  // ── Public: history access ───────────────────────────────────────────────

  /** @returns {Message[]} A copy of the current conversation history. */
  get history() {
    return this._history.slice();
  }

  get isEmpty() {
    return this._history.length === 0;
  }

  // ── Public: rendering ────────────────────────────────────────────────────

  /**
   * Append a user message row and record it in history.
   * @param {string} content - Raw text (may contain Markdown).
   */
  appendUserMessage(content) {
    this._hideEmptyState();
    const index = this._history.length;
    this._history.push({ role: "user", content });
    const row = this._buildUserRow(index, content);
    this._rows.push(row);
    this._list.insertBefore(row, this._thinkingRow);
    this._scrollToBottom();
  }

  /**
   * Begin a streaming copilot response.
   * Returns a { appendChunk, finalise } handle for the caller to drive.
   * @param {string} [initialContent=""] - Optional initial content (e.g. "").
   * @returns {{ appendChunk: function(string): void, finalise: function(): void }}
   */
  beginAssistantMessage(initialContent = "") {
    this._hideEmptyState();
    const index = this._history.length;
    this._history.push({ role: "assistant", content: initialContent });
    this._streamingIndex = index;

    const row = this._buildBotRow(index, initialContent);
    this._rows.push(row);
    this._list.insertBefore(row, this._thinkingRow);
    const bodyEl = row.querySelector(".message-body");

    let accumulated = initialContent;

    return {
      appendChunk: (chunk) => {
        accumulated += chunk;
        const match = accumulated.match(/\[GROUNDING:([a-z]+):(\d+)\]/);
        let textToRender = accumulated;

        if (match) {
          const level = match[1];
          const count = parseInt(match[2], 10);
          textToRender = accumulated.replace(match[0], "");
          this._history[index].content = textToRender;
          this._updateGroundingBadge(row, level, count);
        } else {
          this._history[index].content = accumulated;
        }

        bodyEl.innerHTML = this._renderer.render(textToRender);
        this._scrollToBottom();
      },
      finalise: () => {
        const match = accumulated.match(/\[GROUNDING:([a-z]+):(\d+)\]/);
        let textToRender = accumulated;

        if (match) {
          const level = match[1];
          const count = parseInt(match[2], 10);
          textToRender = accumulated.replace(match[0], "");
          this._history[index].content = textToRender;
          this._updateGroundingBadge(row, level, count);
        }

        bodyEl.innerHTML = this._renderer.render(textToRender);
        this._streamingIndex = -1;
        this._scrollToBottom();
      },
    };
  }

  /** Show the thinking animation. */
  showThinking() {
    this._thinkingRow.classList.add("visible");
    this._scrollToBottom();
  }

  /** Hide the thinking animation. */
  hideThinking() {
    this._thinkingRow.classList.remove("visible");
  }

  /**
   * Truncate the conversation at the given index (exclusive) and re-render
   * the message at that index with new content — used after an edit.
   * @param {number} index - Index of the edited user message.
   * @param {string} newContent - The edited text.
   */
  truncateAndEdit(index, newContent) {
    // Remove DOM rows after index
    for (let i = this._rows.length - 1; i > index; i--) {
      this._rows[i].remove();
      this._rows.pop();
      this._history.pop();
    }

    // Update history and re-render the edited row's body
    this._history[index].content = newContent;
    const bodyEl = this._rows[index].querySelector(".message-body");
    bodyEl.innerHTML = this._renderer.render(newContent);

    // Update the editor textarea too
    const ta = this._rows[index].querySelector("textarea");
    if (ta) ta.value = newContent;

    this._hideTruncation();
    this._scrollToBottom();
  }

  /** Reset the view to its empty / welcome state. */
  reset() {
    for (const row of this._rows) row.remove();
    this._rows = [];
    this._history = [];
    this._streamingIndex = -1;
    this._hideTruncation();
    this.hideThinking();
    this._showEmptyState();
  }

  // ── Private: DOM builders ────────────────────────────────────────────────

  _buildUserRow(index, content) {
    const row = document.createElement("div");
    row.className = "message-row user-row";
    row.dataset.index = index;
    row.setAttribute("role", "article");
    row.setAttribute("aria-label", "Your message");

    row.innerHTML = `
      <div class="message-inner">
        <div class="message-header">
          <span class="message-label">You</span>
          <span class="message-time">${this._nowTime()}</span>
          <button class="edit-link" aria-label="Edit this message">Edit</button>
        </div>
        <div class="message-body"></div>
        <div class="inline-editor" role="form" aria-label="Edit message">
          <textarea aria-label="Edit your message"></textarea>
          <div class="editor-actions">
            <button class="btn btn-cancel">Cancel</button>
            <button class="btn btn-send">Send edited message</button>
          </div>
        </div>
      </div>`;

    // Render content as Markdown
    row.querySelector(".message-body").innerHTML = this._renderer.render(content);
    row.querySelector("textarea").value = content;

    this._wireEditControls(row, index);
    return row;
  }

  _buildBotRow(index, content) {
    const row = document.createElement("div");
    row.className = "message-row bot-row";
    row.dataset.index = index;
    row.setAttribute("role", "article");
    row.setAttribute("aria-label", "Copilot response");

    row.innerHTML = `
      <div class="message-inner">
        <div class="message-header">
          <span class="message-label">Copilot</span>
          <span class="message-time">${this._nowTime()}</span>
          <span class="grounding-badge" style="display: none;"></span>
        </div>
        <div class="message-body"></div>
      </div>`;

    let textToRender = content;
    if (content && typeof content === "string") {
      const match = content.match(/\[GROUNDING:([a-z]+):(\d+)\]/);
      if (match) {
        const level = match[1];
        const count = parseInt(match[2], 10);
        textToRender = content.replace(match[0], "");
        this._updateGroundingBadge(row, level, count);
      }
    }

    if (textToRender) {
      row.querySelector(".message-body").innerHTML = this._renderer.render(textToRender);
    }
    return row;
  }

  // ── Private: edit controls ───────────────────────────────────────────────

  _wireEditControls(row, index) {
    const editBtn  = row.querySelector(".edit-link");
    const body     = row.querySelector(".message-body");
    const editor   = row.querySelector(".inline-editor");
    const ta       = row.querySelector("textarea");
    const cancelBtn = row.querySelector(".btn-cancel");
    const sendBtn   = row.querySelector(".btn-send");

    const autoResize = () => {
      ta.style.height = "auto";
      ta.style.height = ta.scrollHeight + "px";
    };

    editBtn.addEventListener("click", () => {
      body.style.display = "none";
      editor.classList.add("visible");
      autoResize();
      ta.focus();

      // Show truncation notice if there are messages after this one
      if (index < this._history.length - 1) {
        this._showTruncation();
      }
    });

    ta.addEventListener("input", autoResize);

    cancelBtn.addEventListener("click", () => {
      editor.classList.remove("visible");
      body.style.display = "";
      this._hideTruncation();
    });

    sendBtn.addEventListener("click", () => {
      const newContent = ta.value.trim();
      if (!newContent) return;
      editor.classList.remove("visible");
      body.style.display = "";
      this._onUserEdit(index, newContent);
    });
  }

  // ── Private: helpers ─────────────────────────────────────────────────────

  _showEmptyState()  { this._emptyState.style.display  = ""; }
  _hideEmptyState()  { this._emptyState.style.display  = "none"; }
  _showTruncation()  { this._truncation.style.display  = ""; }
  _hideTruncation()  { this._truncation.style.display  = "none"; }

  _scrollToBottom() {
    // Defer one tick so the DOM has updated
    requestAnimationFrame(() => {
      this._list.scrollTop = this._list.scrollHeight;
    });
  }

  _nowTime() {
    const d = new Date();
    return (
      d.getHours().toString().padStart(2, "0") +
      ":" +
      d.getMinutes().toString().padStart(2, "0")
    );
  }

  _updateGroundingBadge(row, level, count) {
    const badgeEl = row.querySelector(".grounding-badge");
    if (!badgeEl) return;

    badgeEl.className = `grounding-badge ${level}`;
    badgeEl.style.display = "inline-flex";

    if (level === "none") {
      badgeEl.textContent = "Grounding: None";
      badgeEl.setAttribute(
        "title",
        "This response is based on the Copilot's general pre-trained knowledge rather than active database records."
      );
    } else if (level === "moderate") {
      const q = count === 1 ? "query" : "queries";
      badgeEl.textContent = `Grounding: Moderate (${count} DB ${q})`;
      badgeEl.setAttribute(
        "title",
        `This response is moderately grounded, using ${count} specific database ${q} to retrieve matching archive records.`
      );
    } else if (level === "strong") {
      badgeEl.textContent = `Grounding: Strong (${count} DB queries)`;
      badgeEl.setAttribute(
        "title",
        `This response is strongly backed by ${count} real database queries from the Memorias archive.`
      );
    }
  }
}

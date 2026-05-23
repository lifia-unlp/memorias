/**
 * app.js — Entry point.
 *
 * App — top-level orchestrator.
 *
 * Responsibilities:
 *   - Wire DOM elements to ChatView and ApiClient.
 *   - Handle user input submission.
 *   - Drive the send → think → stream → finalise cycle.
 *   - Handle inline-edit callbacks from ChatView.
 *   - Manage the theme toggle (light / dark).
 *   - Trigger transcript download.
 *   - Show / hide the offline panel.
 *   - Wire suggestion chips.
 *
 * It does NOT render messages, parse Markdown, or call fetch() directly.
 */

import { ChatView } from "./chat.js";
import { ApiClient } from "./api.js";

class App {
  constructor() {
    // ── DOM references ────────────────────────────────────────────────
    this._messageList    = this._el("messageList");
    this._emptyState     = this._el("emptyState");
    this._thinkingRow    = this._el("thinkingRow");
    this._truncationNote = this._el("truncationNotice");
    this._chatInput      = this._el("chatInput");
    this._sendBtn        = this._el("sendBtn");
    this._downloadBtn    = this._el("downloadBtn");
    this._newChatBtn     = this._el("newChatBtn");
    this._themeToggle    = this._el("themeToggle");
    this._themeLabel     = this._el("themeLabel");
    this._iconLight      = this._el("iconLight");
    this._iconDark       = this._el("iconDark");
    this._offlinePanel   = this._el("offlinePanel");
    this._inputArea      = this._el("inputArea");

    // ── Collaborators ─────────────────────────────────────────────────
    this._chat = new ChatView({
      messageList:      this._messageList,
      emptyState:       this._emptyState,
      thinkingRow:      this._thinkingRow,
      truncationNotice: this._truncationNote,
      onUserEdit:       (index, newContent) => this._handleEdit(index, newContent),
      onFeedback:       (content, rating) => this._handleFeedback(content, rating),
    });

    const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    this._api = new ApiClient(isLocal ? "http://localhost:8000" : "");

    /** Abort function for the current in-flight stream, or null. */
    this._cancelStream = null;

    /** Whether a response is currently streaming. */
    this._busy = false;
  }

  // ── Lifecycle ────────────────────────────────────────────────────────────

  start() {
    this._bindEvents();
    this._autoResize(this._chatInput);
  }

  // ── Event binding ────────────────────────────────────────────────────────

  _bindEvents() {
    // Send
    this._sendBtn.addEventListener("click", () => this._handleSend());
    this._chatInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this._handleSend();
      }
    });
    this._chatInput.addEventListener("input", () =>
      this._autoResize(this._chatInput)
    );

    // Toolbar
    this._downloadBtn.addEventListener("click", () => this._handleDownload());
    this._newChatBtn.addEventListener("click",  () => this._handleNewChat());
    this._themeToggle.addEventListener("click", () => this._handleThemeToggle());

    // Suggestion chips
    this._el("suggestions")
      .querySelectorAll(".chip")
      .forEach((chip) => {
        chip.addEventListener("click", () => {
          this._chatInput.value = chip.textContent.trim();
          this._autoResize(this._chatInput);
          this._chatInput.focus();
        });
      });
  }

  // ── Send ─────────────────────────────────────────────────────────────────

  _handleSend() {
    const text = this._chatInput.value.trim();
    if (!text || this._busy) return;

    this._chatInput.value = "";
    this._autoResize(this._chatInput);
    this._chat.appendUserMessage(text);
    this._requestCompletion();
  }

  // ── Edit ──────────────────────────────────────────────────────────────────

  _handleEdit(index, newContent) {
    if (this._busy) {
      this._cancelStream?.();
      this._cancelStream = null;
      this._chat.hideThinking();
      this._busy = false;
    }
    this._chat.truncateAndEdit(index, newContent);
    this._requestCompletion();
  }

  _handleFeedback(content, rating) {
    this._api.sendFeedback(content, rating).catch((err) => {
      console.error("Error sending feedback:", err);
    });
  }

  // ── Completion cycle ──────────────────────────────────────────────────────

  _requestCompletion() {
    this._busy = true;
    this._sendBtn.disabled = true;
    this._chat.showThinking();

    const streamHandle = this._chat.beginAssistantMessage;

    // We pass the full history to the API so the backend has context
    const history = this._chat.history;

    let handle = null;

    this._cancelStream = this._api.sendMessage(
      history,
      // onChunk — first chunk also hides the thinking indicator
      (chunk) => {
        if (!handle) {
          this._chat.hideThinking();
          handle = this._chat.beginAssistantMessage();
        }
        handle.appendChunk(chunk);
      },
      // onDone
      () => {
        if (!handle) {
          // Edge case: done fired before any chunk (empty response)
          this._chat.hideThinking();
          handle = this._chat.beginAssistantMessage(
            "_The Copilot returned an empty response._"
          );
          handle.finalise();
        } else {
          handle.finalise();
        }
        this._busy = false;
        this._sendBtn.disabled = false;
        this._cancelStream = null;
      },
      // onError
      (err) => {
        this._chat.hideThinking();
        if (handle) {
          handle.appendChunk(
            `\n\n_Error communicating with the Copilot: ${err.message}_`
          );
          handle.finalise();
        } else {
          const h = this._chat.beginAssistantMessage(
            `_Error communicating with the Copilot: ${err.message}_`
          );
          h.finalise();
        }
        this._busy = false;
        this._sendBtn.disabled = false;
        this._cancelStream = null;
      }
    );
  }

  // ── Download ──────────────────────────────────────────────────────────────

  _handleDownload() {
    const history = this._chat.history;
    if (history.length === 0) return;

    const ts = new Date().toISOString();
    const lines = [
      "# Memorias Copilot — Conversation Transcript",
      "",
      `_Downloaded: ${ts}_`,
      "",
      "---",
      "",
    ];

    for (const msg of history) {
      const label = msg.role === "user" ? "**You:**" : "**Copilot:**";
      lines.push(label, "", msg.content, "", "---", "");
    }

    const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `memorias-copilot-${ts.slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // ── New conversation ──────────────────────────────────────────────────────

  _handleNewChat() {
    if (this._busy) {
      this._cancelStream?.();
      this._cancelStream = null;
      this._busy = false;
    }
    this._chat.reset();
    this._sendBtn.disabled = false;
    this._chatInput.value = "";
    this._autoResize(this._chatInput);
  }

  // ── Theme toggle ──────────────────────────────────────────────────────────

  _handleThemeToggle() {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    if (isDark) {
      document.documentElement.removeAttribute("data-theme");
      this._themeLabel.textContent = "Dark mode";
      this._iconLight.style.display = "";
      this._iconDark.style.display  = "none";
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
      this._themeLabel.textContent = "Light mode";
      this._iconLight.style.display = "none";
      this._iconDark.style.display  = "";
    }
  }

  // ── Offline state (called externally when backend reports offline) ─────────

  showOffline(message) {
    this._offlinePanel.querySelector(".offline-message").textContent = message;
    this._offlinePanel.classList.add("visible");
    this._inputArea.style.display = "none";
  }

  hideOffline() {
    this._offlinePanel.classList.remove("visible");
    this._inputArea.style.display = "";
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  _el(id) {
    const el = document.getElementById(id);
    if (!el) throw new Error(`App: element #${id} not found in DOM.`);
    return el;
  }

  _autoResize(textarea) {
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px";
  }
}

// ── Bootstrap ────────────────────────────────────────────────────────────────
const app = new App();
app.start();

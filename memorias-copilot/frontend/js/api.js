/**
 * api.js
 *
 * ApiClient — all communication with the Copilot backend.
 *
 * Responsibilities:
 *   - Send a user message to the backend and receive the streamed response
 *     via Server-Sent Events (SSE).
 *   - Manage the session token (sent as a request header).
 *   - Expose a clean interface so ChatView / App never touch fetch() directly.
 *
 * Current state: STUB.
 *   The backend does not exist yet. sendMessage() simulates a streamed reply
 *   so the frontend can be developed and tested independently.
 *   When the backend is ready, replace _streamStub() with _streamReal().
 */

/** Possible copilot service states returned by the backend. */
export const CopilotStatus = Object.freeze({
  ONLINE:       "online",
  OFFLINE:      "offline",
  RATE_LIMITED: "rate_limited",
});

export class ApiClient {
  /**
   * @param {string} baseUrl - Backend base URL, e.g. "http://localhost:8000".
   *                           Defaults to the same origin as the frontend.
   */
  constructor(baseUrl = "") {
    this._baseUrl = baseUrl;
    this._sessionToken = this._initSessionToken();
  }

  // ── Public API ──────────────────────────────────────────────────────────

  /**
   * Send a user message and stream the assistant reply.
   *
   * @param {string[]} messageHistory - Full conversation so far (raw Markdown strings).
   *   Each element is an object { role: "user"|"assistant", content: string }.
   * @param {function(string): void} onChunk - Called for each streamed text chunk.
   * @param {function(): void} onDone - Called when the stream is complete.
   * @param {function(Error): void} onError - Called on network / server error.
   * @returns {function(): void} An abort function — call it to cancel the stream.
   */
  sendMessage(messageHistory, onChunk, onDone, onError) {
    console.log("[ApiClient] Requesting chat completion with history:", messageHistory);
    return this._streamReal(
      messageHistory,
      (chunk) => {
        console.log("[ApiClient] Chunk received:", chunk);
        onChunk(chunk);
      },
      () => {
        console.log("[ApiClient] Streaming completed successfully");
        onDone();
      },
      (err) => {
        console.error("[ApiClient] Streaming error occurred:", err);
        onError(err);
      }
    );
  }

  /** Return the current session token (useful for debugging). */
  get sessionToken() {
    return this._sessionToken;
  }

  /**
   * Send user feedback rating for a specific assistant message.
   * @param {string} content - Assistant message text content.
   * @param {string|null} rating - "thumbs_up", "thumbs_down", or null.
   */
  async sendFeedback(content, rating) {
    const endpoint = `${this._baseUrl}/chat/feedback`;
    console.log("[ApiClient] Sending feedback:", { content, rating });
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Session-Token": this._sessionToken,
        },
        body: JSON.stringify({ content, rating }),
      });
      return await response.json();
    } catch (err) {
      console.error("[ApiClient] Failed to send feedback:", err);
      throw err;
    }
  }

  /**
   * Fetch lab info and log statistics from the backend.
   * @returns {Promise<{lab_name: string, conversations_count: number, repo_url: string}>}
   */
  async fetchInfo() {
    const endpoint = `${this._baseUrl}/info`;
    console.log("[ApiClient] Fetching server stats...");
    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.error("[ApiClient] Failed to fetch server info:", err);
      throw err;
    }
  }

  // ── Private: real SSE implementation (used when backend is ready) ───────

  _streamReal(messageHistory, onChunk, onDone, onError) {
    const controller = new AbortController();
    const endpoint = `${this._baseUrl}/chat`;
    console.log("[ApiClient] Opening stream connection to:", endpoint);

    fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Session-Token": this._sessionToken,
      },
      body: JSON.stringify({ messages: messageHistory }),
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Backend returned ${response.status}`);
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        const pump = () =>
          reader.read().then(({ done, value }) => {
            if (done) { onDone(); return; }
            const text = decoder.decode(value, { stream: true });
            // SSE lines look like: data: <chunk>\n\n
            for (const line of text.split("\n")) {
              if (line.startsWith("data: ")) {
                const chunk = line.slice(6);
                if (chunk === "[DONE]") { onDone(); return; }
                // Decode escaped newlines to ensure proper multiline markdown rendering
                onChunk(chunk.replace(/\\n/g, "\n"));
              }
            }
            pump();
          });

        pump();
      })
      .catch((err) => {
        if (err.name !== "AbortError") onError(err);
      });

    return () => controller.abort();
  }

  // ── Private: stub implementation ─────────────────────────────────────────

  _streamStub(messageHistory, onChunk, onDone, _onError) {
    const lastMessage = messageHistory.at(-1)?.content ?? "";
    const reply =
      `I searched the Memorias database for **"${this._escapeMarkdown(lastMessage)}"**.\n\n` +
      `This is a **stub response** — the backend is not yet connected. ` +
      `When the real backend is wired up, this will be replaced by actual data ` +
      `from the Memorias database retrieved via the available tools.`;

    // Simulate token-by-token streaming
    const words = reply.split(" ");
    let index = 0;
    let cancelled = false;

    const tick = () => {
      if (cancelled) return;
      if (index >= words.length) { onDone(); return; }
      onChunk((index === 0 ? "" : " ") + words[index]);
      index++;
      setTimeout(tick, 35);
    };

    // Initial delay simulates network + model latency
    const timerId = setTimeout(tick, 800);

    return () => {
      cancelled = true;
      clearTimeout(timerId);
    };
  }

  // ── Private helpers ──────────────────────────────────────────────────────

  /** Generate or restore a random session token from sessionStorage. */
  _initSessionToken() {
    const key = "copilot_session";
    let token = sessionStorage.getItem(key);
    if (!token) {
      token = crypto.randomUUID();
      sessionStorage.setItem(key, token);
    }
    return token;
  }

  _escapeMarkdown(text) {
    return text.replace(/[*_`[\]]/g, "\\$&");
  }
}

# Memorias Copilot — Architecture & Design

This document records all architecture and design decisions for the Memorias Copilot.
It is the authoritative reference. Implementation must not deviate from what is
recorded here without first updating this document and obtaining user approval.

---

## 1. System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (User)                           │
│                                                                 │
│   ┌──────────────────────────────────────────────────────────┐  │
│   │                  Copilot UI  (static HTML/CSS/JS)        │  │
│   │  • ChatGPT-style conversation pane                       │  │
│   │  • Markdown rendering                                    │  │
│   │  • Message editing                                       │  │
│   │  • Session download                                      │  │
│   └──────────────────────┬───────────────────────────────────┘  │
└──────────────────────────│──────────────────────────────────────┘
                           │ HTTPS / REST or WebSocket
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Copilot Backend  (Node.js / Python TBD)      │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  Conversation Manager                                   │   │
│   │  • Maintains in-memory message thread per session       │   │
│   │  • Calls OpenAI Chat Completions API (with tools)       │   │
│   │  • Enforces system prompt (information policy)          │   │
│   │  • Rate limiting & circuit-breaker logic                │   │
│   └────────────────────┬────────────────────────────────────┘   │
│                        │                                        │
│   ┌────────────────────▼────────────────────────────────────┐   │
│   │  Tool Dispatcher                                        │   │
│   │  • Receives tool-call requests from OpenAI              │   │
│   │  • Calls the appropriate Database Adapter method        │   │
│   │  • Returns structured results back to the model         │   │
│   └────────────────────┬────────────────────────────────────┘   │
│                        │                                        │
│   ┌────────────────────▼────────────────────────────────────┐   │
│   │  Database Adapter  (internal, not exposed to internet)  │   │
│   │  • Thin read-only interface to the Memorias DB          │   │
│   │  • Wraps each query in a named function (tool)          │   │
│   │  • Returns only public fields                           │   │
│   │  • Never accepts raw SQL from callers                   │   │
│   └────────────────────┬────────────────────────────────────┘   │
└──────────────────────────│──────────────────────────────────────┘
                           │ DB driver (internal network only)
                           ▼
                  ┌─────────────────┐
                  │  Memorias DB    │
                  │  (PostgreSQL)   │
                  └─────────────────┘
```

---

## 2. Key Design Principles

### 2.1 UI / Logic Separation

The frontend is a **static single-page application** (plain HTML + CSS + JS, or a
lightweight bundled SPA). It communicates with the backend exclusively through a
well-defined REST (or WebSocket) API. The UI has no knowledge of OpenAI, the database,
or any tool definitions. This separation makes it easy to:

- Swap the UI for a different implementation (e.g., React, a mobile app, a CLI).
- Embed the copilot in `memorias-web` by pointing its chat widget at the same backend.

### 2.2 Object-Oriented Design

Both backend and frontend code must follow an **object-oriented approach**:

- **Low coupling:** Components depend on abstractions (interfaces / protocols), not
  concrete implementations. A swap of the database driver, the LLM provider, or the
  transport layer must require changes in only one place.
- **High cohesion:** Each class / module has a single, well-defined responsibility.
  Examples: `ConversationManager` manages the thread; `ToolDispatcher` routes tool
  calls; `DatabaseAdapter` owns all database access; `RateLimiter` owns all throttling
  logic.
- Classes are named with clear domain nouns; methods are named with verbs that
  describe intent, not implementation.

### 2.3 Database / Copilot Separation

The Database Adapter is the **only** component allowed to touch the database. It:

- Exposes a fixed, named set of read-only functions (tools).
- Returns only public-facing fields (no raw rows, no schema info).
- Never accepts free-form SQL from any caller.
- Connects to the database as a **read-only user / role** so that a misconfigured
  or compromised adapter cannot write data even if it tried.

This ensures that even if the LLM were to misbehave, it cannot reach the database
directly.

### 2.4 Standalone Application

`memorias-copilot` lives in its own directory with its own `package.json` (or
equivalent). It is deployed independently from `memorias-web`. No shared build
pipelines, no shared node_modules at the monorepo root.

---

## 3. Technology Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Frontend | Static HTML + Vanilla CSS + Vanilla JS | Zero build-step for the mockup phase; easy to upgrade to a bundled SPA later. |
| Markdown rendering | `marked.js` (CDN) | Lightweight, well-maintained, no build step required. |
| Backend runtime | **Python 3.12 + FastAPI** | Rich AI/ML ecosystem, excellent OpenAI SDK, async-native, fast iteration on prompt/tool development. |
| LLM API | OpenAI Python SDK (`openai` ≥ 1.x) — model **`gpt-4o-mini`** | Cost-effective, capable of tool-calling and streaming. |
| Data validation | **Pydantic v2** | Runtime validation + typed models at all component boundaries. |
| Static typing | **mypy --strict** + **Pyright** | Enforces full type coverage; acts as the "compiler". |
| Linting / formatting | **Ruff** | Replaces flake8, isort, black in a single fast tool. |
| Testing | **pytest** + **pytest-asyncio** + **pytest-mock** | Unit and integration tests for all backend components. |
| Database driver | **asyncpg** (async PostgreSQL) | Non-blocking DB access; connects as a read-only role. |
| Dependency management | **uv** | Fast, reproducible Python environment management. |

---

### 3.1 Object-Oriented & Typing Conventions

All Python code must follow these conventions (see also `rules.md §2`):

- **`mypy --strict`** enforced in CI — no untyped functions, no implicit `Any`.
- **Pydantic `BaseModel`** for every data object that crosses a component boundary
  (OpenAI messages, tool results, DB rows, HTTP request/response bodies).
  Models are `frozen=True` where mutation is not required.
- **`ABC`** for all swappable components (`LLMProvider`, `DatabaseAdapter`); concrete
  classes implement the abstract interface.
- **`Protocol`** for small structural contracts that do not warrant a full ABC.
- **`@final`** on classes not designed for extension.
- **`@override`** (Python 3.12) on every method that overrides a parent; mypy
  verifies correctness.
- **`StrEnum`** for all enumerated values (roles, statuses, tool names).
- **Frozen `@dataclass`** wrappers for primitive identifiers (`SessionId`, etc.).
- **Properties** instead of public fields; `_` prefix for private attributes.
- **No bare `dict`s** passed between components — always a typed model.

---

## 4. OpenAI Integration

- Uses the **Chat Completions API** with the `tools` parameter.
- The system prompt encodes the information policy (see `functionality.md §2`).
- Tool definitions are declared server-side and never sent to the browser.
- The model is free to call tools in a loop (agentic pattern) until it has enough
  information to answer.
- Tool results are injected back into the thread as `tool` role messages.
- The backend streams the final assistant response to the frontend using
  server-sent events (SSE) or WebSocket, enabling token-by-token display.

---

## 5. Session Management

- Sessions are **ephemeral**: the conversation thread lives in server memory (keyed by
  a random session token sent as a cookie or header) and is discarded when the
  connection ends or after a configurable idle timeout.
- No database writes occur for conversation data in the current version.

---

## 6. Access Control (Current Version)

- **None.** Anyone who can reach the copilot URL can use it.
- A future version may check for a valid `memorias-web` session cookie before
  allowing access.

---

## 7. Rate Limiting & Circuit Breaker

- The backend must enforce configurable limits:
  - **Per-session rate limit:** maximum requests per minute / hour.
  - **Global rate limit:** maximum requests per minute / hour across all sessions.
  - **Cost circuit breaker:** tracks estimated OpenAI token cost; takes the service
    offline automatically if a configurable threshold is exceeded within a time window.
  - **Error-rate circuit breaker:** if the OpenAI API error rate exceeds a threshold,
    the service goes to a maintenance mode.
- When offline, the API returns a structured error that the UI renders as a friendly
  maintenance message.
- Admin configuration is via environment variables and/or a config file; no UI for
  admin in the current version.

---

## 8. UI Design Reference

- **Visual style:** Minimalistic, clean, and professional. Inspired by the ChatGPT
  conversation layout but stripped of unnecessary chrome.
- **Theme:** Light by default. A dark-mode toggle may be added in a future iteration.
  No emojis anywhere in the UI (see `rules.md §8`).
- **Layout:** Full-height single-page layout. **No sidebar.** The entire viewport is
  the conversation panel.
- **Chat pane:** Scrollable message list occupying most of the screen; a fixed input
  bar pinned to the bottom.
- **Message display:** Messages are **not** shown in bubbles. Each message is a
  full-width row with a distinct background colour to differentiate sender:
  - User messages: light warm tint (e.g., very light grey or very light blue).
  - Copilot messages: plain white (or the page background).
  - A small, plain-text label ("You" / "Copilot") identifies the sender.
- **Markdown:** Rendered inside each message row (tables, code blocks, bold, links,
  etc.).
- **Edit:** Hovering a user message row reveals a small "Edit" text link (no icon);
  clicking opens the message in an inline editor within the same row.
- **Download:** A button in the top bar exports the session as a Markdown file.
- **Offline message:** Replaces the input bar with a friendly, lighthearted notice
  (see `functionality.md §6`).

---

## 9. File / Directory Structure (Target)

```
memorias-copilot/
├── rules.md                      # Project rules (this repo)
├── functionality.md              # Functionality spec
├── architecture-and-design.md    # This document
│
├── frontend/                     # Static SPA
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── app.js               # Entry point, UI orchestration
│       ├── chat.js              # Message rendering, editing, scrolling
│       ├── api.js               # Backend API client
│       └── markdown.js          # Markdown rendering wrapper
│
├── backend/                      # Copilot server
│   ├── src/
│   │   ├── server.js / main.py  # HTTP entry point
│   │   ├── conversation.js/.py  # Conversation manager
│   │   ├── tools/               # Tool dispatcher + individual tools
│   │   │   ├── index.js/.py
│   │   │   ├── searchPublications.js/.py
│   │   │   ├── searchProjects.js/.py
│   │   │   └── ...
│   │   ├── db/                  # Database Adapter
│   │   │   └── adapter.js/.py
│   │   └── admin/               # Rate limiting, circuit breaker
│   │       └── limits.js/.py
│   ├── .env.example
│   └── package.json / pyproject.toml
│
└── mockup/                       # Static HTML mockups (design phase)
    └── index.html
```

---

## 10. Decision Log

| # | Decision | Date | Rationale |
|---|----------|------|-----------|
| 1 | Use OpenAI Tools API | 2026-05 | Specified requirement |
| 2 | Standalone app, not embedded in memorias-web | 2026-05 | Independent evolution and deployment |
| 3 | No access control in v1 | 2026-05 | Simplicity; future auth hook documented |
| 4 | Ephemeral sessions only in v1 | 2026-05 | Simplicity; no personal data stored |
| 5 | Static HTML/CSS/JS for frontend (at least for mockup) | 2026-05 | Zero build step, easy to iterate |
| 6 | Backend: Python 3.12 + FastAPI + Pydantic v2 | 2026-05 | Rich AI ecosystem, async-native, fast iteration; Java considered and set aside |
| 7 | Object-oriented design, low coupling, high cohesion | 2026-05 | Matches developer's background and experience |
| 8 | No sidebar in UI | 2026-05 | Simplicity; only the conversation panel is needed |
| 9 | No message bubbles; row-based layout with background colours | 2026-05 | Minimalist aesthetic preferred over chat-app chrome |
| 10 | Light theme by default; dark mode toggle future option | 2026-05 | Starting point agreed with user |
| 11 | Database adapter connects as read-only DB role | 2026-05 | Defence-in-depth; copilot is strictly read-only |
| 12 | No emojis in UI or copilot responses | 2026-05 | Professional, minimalist style |
| 13 | mypy --strict + Pyright for static typing | 2026-05 | Acts as compiler; enforces full type coverage |
| 14 | asyncpg for database access | 2026-05 | Non-blocking async driver; consistent with FastAPI's async model |
| 15 | uv for dependency management | 2026-05 | Fast, reproducible environments |
| 16 | OpenAI model: gpt-4o-mini | 2026-05 | Cost-effective; supports tool-calling and streaming |
| 17 | Backend connects directly to Memorias DB | 2026-05 | Simpler architecture; DB credentials stay server-side only |

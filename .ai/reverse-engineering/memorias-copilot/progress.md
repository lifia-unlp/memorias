# memorias-copilot Reverse Engineering Progress

This living document tracks active status, findings, and handoffs between AI sessions for the **memorias-copilot** project.

---

## Current Status
* **Active Phase**: Phase 3 Complete (Traceability Verification & Wiki Publishing) & Active Maintenance (Search Enhancements)
* **Last Updated**: 2026-05-28
* **Overall Progress**: 100% completed (Maintenance active)

---

## Session Logs

### Session 5 (2026-05-28)
* **Goal**: Analyze the provided copilot session log `session_a0d7ff69-6f76-423c-b118-344be714f25b.json` and fix search shortcomings where users query members by courses taught or academic positions.
* **Accomplished**:
  * Identified that the Copilot failed to return relevant members for "profes de objetos I y objetos II" because `coursesAtUNLP` and `positionAtUnlp` were not searched in the `search_members` database adapter, and the tool's description did not inform the LLM of such capability.
  * Enhanced `PostgresDatabaseAdapter.search_members` in `adapter.py` by adding `coursesAtUNLP` and `positionAtUnlp` fields into the case-insensitive, diacritic-insensitive `ILIKE` conditions.
  * Updated the `search_members` tool definition and parameter descriptions in `definitions.py` to explicitly specify support for searching by courses taught (e.g. "Objetos I") and academic positions.
  * Verified all 11 backend test suites run and pass cleanly using `uv run pytest`.
* **Blocked Items**:
  * None.
* **Next Steps**:
  * Monitor copilot session logs for any other potential query search mismatches.

### Session 4 (2026-05-26)
* **Goal**: Investigate and resolve the search failure for "Andrés Rodriguez" vs "Andrés" in copilot member searches.
* **Accomplished**:
  * Identified that the PostgreSQL `ILIKE` operator is case-insensitive but accent-sensitive (diacritic-sensitive), causing "Andrés Rodriguez" to fail matching the database record "Andrés Rodríguez" because of the accent mismatch on the "i".
  * Integrated the PostgreSQL `unaccent` extension into the `PostgresDatabaseAdapter` connection setup with a graceful fallback for restricted cloud permissions.
  * Re-implemented all search methods (`search_members`, `search_projects`, `search_theses`, `search_scholarships`, `search_publications`) to utilize `unaccent()` for diacritic-insensitive searches.
  * Added token-based keyword splitting (multi-word match support), enabling searches with out-of-order partial name tokens (e.g., both "Andrés Rodriguez" and "Rodriguez Andres" successfully match).
  * Validated that all 11 backend test suites continue to pass successfully.
  * Manually verified search results against the local Prisma dev database sandbox.
* **Blocked Items**:
  * None.
* **Next Steps**:
  * Monitor copilot session logs for any other potential edge-case queries.

### Session 3 (2026-05-25)
* **Goal**: Execute Phase 2 (Modular Functionality & Requirements Analysis for Modules A to D) and Phase 3 (Traceability Verification & Wiki Publishing) for `memorias-copilot`.
* **Accomplished**:
  * Analyzed Session Management & FastAPI REST API Server (`server.py`, `session.py`, `config.py`), mapping REST routes (`POST /chat`, `POST /chat/feedback`, `GET /info`), cookies/custom headers (`X-Session-Token`), and ephemeral `InMemorySessionManager` with timed expiries.
  * Analyzed Core System Prompts & LLM Orchestrator (`system_prompt.md`, `llm.py`), deconstructing the primary prompt guidelines (no-emoji styles, base URL link schemas, privacy boundaries, no-hallucination policies, mandatory tag cloud refusal call, date status calculations, and language coherence), and completions stream loops with grounding tags.
  * Analyzed Agent Query Tools & Dispatcher (`definitions.py`, `dispatcher.py`, `adapter.py`), inventorying 14 tools, mapping dispatcher bindings, SQLAlchemy serialization, SQL injection parameterized preventions, and read-only connection limits.
  * Analyzed Frontend Chat Client Overlay (`index.html`, `js/`, `css/`), mapping UI widgets, empty-state suggest chips, sessionStorage token UUID cookie, async fetch readers, message row editing, download Markdown exports, and LIFIA quality consent dialogs.
  * Performed Hyperlink Traceability audits, verifying all keywords link back to their anchors on `Shared-Domain-Glossary.md`.
  * Created and published the master requirements specification file directly to `memorias-wiki/Requirements-Specification-Memorias-Copilot.md`.
* **Discovered**:
  * Confirmed that `server.py` implements an offline fallback generator serving a friendly downtime card when database adapter connection issues are caught.
  * Extracted Pydantic serialization settings masking sensitive user fields from the LLM.
  * Discovered the grounding level estimation tag appended at the end of SSE completions.
* **Blocked Items**:
  * None.
* **Next Steps**:
  * Finalize validation and obtain user sign-off for both specification files.

### Session 2 (2026-05-25)
* **Goal**: Execute Phase 1: Database Model & Sync Mechanics.
* **Accomplished**:
  * Analyzed the database sync routine in `sync_db.py`.
  * Analyzed `backend/src/copilot/models.py` and `db/adapter.py` mapping definitions.
  * Verified read-only guarantees (adapter uses exclusively `SELECT` statements).
  * Documented core model definitions mapping `Member`, `Project`, `Thesis`, `Scholarship`, `Publication` to the database adapter.
* **Discovered**:
  * The copilot is strictly read-only and queries local mirrored PostgreSQL structures.
  * Extracted models have security/privacy guards: fields like Member's `personalEmail`, `phone`, `notes` and Project's `amount` are explicitly excluded from serialization (excluded/filtered in the Pydantic models).
  * Discovered automated APA citation computed field generator in `models.py` that formats BibTeX JSON into APA bibliographies.
* **Blocked Items**:
  * None.
* **Next Steps**:
  * Initiate **Module A: Session Management & FastAPI REST API Server** functional analysis.

---

## Session 1 (2026-05-25)
* **Goal**: Bootstrap the reverse engineering folder structure and rules.
* **Accomplished**:
  * Created AI reverse-engineering folder structure.
  * Added session guidance files (`plan.md`, `progress.md`, `prompts.md`).
  * Linked workspace-level agent guidelines (`CLAUDE.md`, `AGENTS.md`) to the RE project rules.
* **Discovered**:
  * Setup workspace-level rules.
* **Blocked Items**:
  * None.
* **Next Steps**:
  * Analyze the main codebase layout of `memorias-copilot` to list primary entry points.

---

## Outstanding Questions & Blockers
*(Document any business or code mysteries here for user feedback)*

1. **Question**: `sync_db.py` lists `TABLES = ["Member", "Project", "Publication"]`, but `adapter.py` queries `Thesis` and `Scholarship` as well. We should check if the other tables are populated through a different routine or if they are fetched from the remote in production.


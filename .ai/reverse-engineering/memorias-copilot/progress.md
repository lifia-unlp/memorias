# memorias-copilot Reverse Engineering Progress

This living document tracks active status, findings, and handoffs between AI sessions for the **memorias-copilot** project.

---

## Current Status
* **Active Phase**: Phase 2 (Modular Functionality & Requirements Analysis)
* **Last Updated**: 2026-05-25
* **Overall Progress**: 25% completed

---

## Session Logs

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


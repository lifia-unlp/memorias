# memorias-web Reverse Engineering Progress

This living document tracks active status, findings, and handoffs between AI sessions for the **memorias-web** project.

---

## Current Status
* **Active Phase**: Phase 2 (Modular Functionality & Requirements Analysis)
* **Last Updated**: 2026-05-25
* **Overall Progress**: 25% completed

---

## Session Logs

### Session 3 (2026-05-25)
* **Goal**: Execute Module A: Authentication, Access Control, and Preferences.
* **Accomplished**:
  * Reverse-engineered OAuth setup (GitHub, Google, Microsoft, and ORCID provider logic) and credentials dev backdoor.
  * Extracted complete role behaviors (ADMIN, EDITOR, USER), screen widgets, and layouts.
  * Formulated five high-fidelity narrative requirements scenarios with perfect glossary relative links.
  * Drafted five strict system business rules (Credentials Isolation, First-User Admin Bootstrap, Admin Approval Enforcement, Real-time JWT Sync, and Session invalidation).
  * Initialized and published the [`Requirements-Specification-Memorias-Web.md`](../../memorias-wiki/Requirements-Specification-Memorias-Web.md) page in the Wiki.
* **Discovered**:
  * Found that ORCID uses customized OIDC sandboxing with a specialized OIDC callback mappings.
  * Observed real-time JWT syncing directly queries database records to apply permission updates instantly.
* **Blocked Items**:
  * None.
* **Next Steps**:
  * Initiate **Module B: Member Profiles & CV Management** functional analysis.

---

## Session 2 (2026-05-25)
* **Goal**: Execute Phase 1: Domain Model & Schema Extraction.
* **Accomplished**:
  * Mapped out schema database enums, constraints, and relationships.
  * Initialized the public Wiki landing index and glossary.
* **Discovered**:
  * The core business domain revolves around Member profiles and academic deliverables.
* **Blocked Items**:
  * None.
* **Next Steps**:
  * Initiate **Module A** functional analysis.

---

## Session 1 (2026-05-25)
* **Goal**: Bootstrap the reverse engineering folder structure and rules.
* **Accomplished**:
  * Created AI reverse-engineering folder structure.
  * Added session guidance files (`plan.md`, `progress.md`, `prompts.md`).
  * Linked workspace-level agent guidelines (`CLAUDE.md`, `AGENTS.md`) to the RE project rules.
* **Discovered**:
  * Found standard Next.js workspace setup.
* **Blocked Items**:
  * None.
* **Next Steps**:
  * Analyze the main workspace structure of `memorias-web` to list primary entry points.

---

## Outstanding Questions & Blockers
*(Document any business or code mysteries here for user feedback)*

1. **Question**: We observed `SystemOption` is Compounded Unique on `[listName, value]`. We should verify all distinct option lists in use during Module H.


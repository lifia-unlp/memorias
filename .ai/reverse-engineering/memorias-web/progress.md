# memorias-web Reverse Engineering Progress

This living document tracks active status, findings, and handoffs between AI sessions for the **memorias-web** project.

---

## Current Status
* **Active Phase**: Phase 2 (Modular Functionality & Requirements Analysis)
* **Last Updated**: 2026-05-25
* **Overall Progress**: 15% completed

---

## Session Logs

### Session 2 (2026-05-25)
* **Goal**: Execute Phase 1: Domain Model & Schema Extraction.
* **Accomplished**:
  * Analyzed `prisma/schema.prisma` and mapped out the 10 core system entities.
  * Formulated the authoritative definitions, database attributes, unique constraints, and relationships for each model.
  * Created the standalone public wiki index and populated the [`Shared-Domain-Glossary.md`](../../memorias-wiki/Shared-Domain-Glossary.md) with complete relative traceability links.
* **Discovered**:
  * The core business domain revolves around Member profiles, academic deliverables (Projects, Theses, Scholarships, Publications), and support entities (SystemOptions, SystemSettings, AuditLogs, Reports).
* **Blocked Items**:
  * None.
* **Next Steps**:
  * Initiate **Module A: Authentication, Access Control, and Preferences** functional analysis.

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


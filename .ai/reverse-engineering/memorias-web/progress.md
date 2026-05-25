# memorias-web Reverse Engineering Progress

This living document tracks active status, findings, and handoffs between AI sessions for the **memorias-web** project.

---

## Current Status
* **Active Phase**: Phase 3 Complete (Traceability Verification & Wiki Publishing)
* **Last Updated**: 2026-05-25
* **Overall Progress**: 100% completed

---

## Session Logs

### Session 6 (2026-05-25)
* **Goal**: Execute Module G (Custom Report Builder & Layout Engine) and Module H (Administration & System Options Editor), verify traceability, and finalize wiki spec publishing.
* **Accomplished**:
  * Analyzed `saveReport`, `getReports`, `getReport`, and `deleteReport` Server Actions, detailing how template JSON arrays (`blocks` field) are validated, transactionally saved/updated, and how creator-ownership (`userId`) checks are strictly enforced.
  * Extracted the Report Builder UI (dashboard list mode, builder canvas edit mode, A4 sticky live preview, and distraction-free document view mode supporting Markdown text exports and native window printing/PDF downloads).
  * Analyzed User Administration actions (`toggleUserActivationAction`, `updateUserRoleAction`, `deleteUserAction`, and `updateUserMemberAction`) detailing role authorization gates and unassigned physical member mappings.
  * Analyzed Options lookup list management actions (`createOption` and `deleteOptionSafe`), mapping the safe cascade reassignment delete workflow running inside an atomic transaction.
  * Analyzed global configuration panel actions (`saveSystemSettings`) updating titles, logos, and security switches, and writing to the append-only `AuditLog` table.
  * Formulated comprehensive specs, dynamic scenarios, business rules, and API contracts for both Modules G & H in full compliance with Domain-Driven Design (DDD) contexts decoupling.
  * Completed Hyperlink Traceability audits, verifying all domain keywords link back to their anchors on `Shared-Domain-Glossary.md`.
  * Published the complete compiled specifications directly to `memorias-wiki/Requirements-Specification-Memorias-Web.md`.
* **Discovered**:
  * Identified the elegant atomic `$transaction` reassigning references when deleting active lookup options.
  * Observed that the visual Audit Log visualizer aggregates statistics dynamically and tracks administrative mutations with no delete controls.
  * Confirmed that report title conflicts offer overwrites or auto-named separate copies.
* **Blocked Items**:
  * None.
* **Next Steps**:
  * Proceed to reverse engineer `memorias-copilot` as outlined in the requirements roadmap.

### Session 5 (2026-05-25)
* **Goal**: Execute Module C: Projects & Funding Management.
* **Accomplished**:
  * Analyzed `createProject` and `updateProject` Server Actions detailing title duplicate interceptors and client bypasses (`ignoreDuplicateCheck`).
  * Mapped `deleteProject` referential integrity checks that block deletion if theses, scholarships, or publications associate with the project ID, triggering the UI Referral Block Dialog.
  * Mapped list catalog (`/projects`), details (`/projects/[slug]`), and curation form (`ProjectForm`) screens.
  * Formulated five comprehensive, relative-linked narrative scenarios, seven strict business rules, and complete data contracts.
  * Appended specifications directly to the master `Requirements-Specification-Memorias-Web.md` document in the Wiki.
* **Discovered**:
  * Confirmed plural comma-separated legacy DB constraints for the `director` and `coDirector` fields.
  * Noted that budgets (`amount`) are kept as plain strings without numeric currency normalizations.
  * Re-verified masking of the amount field in Copilot schemas for privacy.
* **Blocked Items**:
  * None.
* **Next Steps**:
  * Initiate **Module D: Theses & Career Tracking** functional analysis.

---

### Session 4 (2026-05-25)
* **Goal**: Execute Module B: Member Profiles & CV Management.
* **Accomplished**:
  * Reverse-engineered profile list directory search (`hideFormer` toggle, tags/keyword search, pagination logic).
  * Analyzed `MemberForm` (auto slug generators, dynamic dropdowns from `SystemOption`).
  * Mapped detailed profile pages (`CvTabs` bilingual summaries, delete button logic).
  * Mapped referential integrity checks blocking deletions if members are associated with projects, theses, scholarships, or publications.
  * Formulated four high-fidelity requirements scenarios and five strict business rules.
  * Appended full functional specifications to [`Requirements-Specification-Memorias-Web.md`](../../memorias-wiki/Requirements-Specification-Memorias-Web.md) in the Wiki.
* **Discovered**:
  * Identified the referential integrity protection workflow returning `REFERENTIAL_BLOCK` with complete direct navigation lists for admins.
  * Confirmed that `personalEmail`, `phone`, and `notes` are restricted in Copilot model mapping for privacy.
* **Blocked Items**:
  * None.
* **Next Steps**:
  * Initiate **Module C: Projects & Funding Management** functional analysis.

---

## Session 3 (2026-05-25)
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


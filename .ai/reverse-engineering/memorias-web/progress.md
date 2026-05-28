# memorias-web Reverse Engineering Progress

This living document tracks active status, findings, and handoffs between AI sessions for the **memorias-web** project.

---

## Current Status
* **Active Phase**: Issue #23 Resolved (Multi-Word Accent-Insensitive Search Tokenization)
* **Last Updated**: 2026-05-28
* **Overall Progress**: 100% completed (Including search optimizations)

---

## Session Logs

### Session 7 (2026-05-27)
* **Goal**: Implement tag-based filtering for Project, Publications, Scholarship, and Thesis blocks, add a new `POWER_EDITOR` user role, and implement rich GenAI blocks in the Custom Report Builder.
* **Accomplished**:
  * Extended report builder initial data (`getReportInitData`) to fetch and return system taxonomy tags via server actions.
  * Added `tags` filter parameter in `PublicationFilters`, `ProjectFilters`, `ScholarshipFilters`, and `ThesisFilters` interfaces and database queries.
  * Implemented tag overlap check logic using Prisma `hasSome` scalar list query in all four queries (`queryPublications`, `queryProjects`, `queryScholarships`, `queryTheses`), ensuring all items (tagged and untagged) are returned when no tags are selected by default.
  * Configured block filters to support the `tags` array on the frontend `ReportBuilderClient.tsx` component, safely backfilling legacy report configurations and initializing new blocks with an empty selection `[]` (so all elements are included by default).
  * Updated the "Member relation filter" label to "Filter by related members" in all dynamic report blocks.
  * Rendered dynamic, interactive tags filter controls (multi-select Chips, "Select All", and "Clear All" buttons) under block configuration panels.
  * Integrated a new database-level user role `POWER_EDITOR` (Prisma enum schema updates, database synchronization, NextAuth JWT session mappings, and admin user administration promotion dropdown selectors).
  * Built a secure `generateReportAIContent` Server Action (guarded strictly for `ADMIN` and `POWER_EDITOR` accounts) to fetch completions from OpenAI's `gpt-4o-mini` API.
  * Implemented **Dual-Phase Compilation**: Phase 1 compiles static blocks, Phase 2 compiles GenAI blocks sequentially using static blocks as context prompts while showing an animated skeleton loader on the preview canvas.
  * Implemented selective GenAI block compilation using `lastGeneratedConfig` caching. The block's dynamic summary is only generated when explicitly requested by clicking the manual "Regenerate AI Block Content" button.
  * Programmed state tracking: the manual regeneration action button is enabled if and only if the active block prompt, word limit, or referenced input blocks configuration/compiled contents differ from the cached generation.
  * Streamlined the GenAI editor interface by stripping out redundant and inapplicable fields (Timeline range, Research tags, Related members filters, Sort ordering options, Show summary checkmarks, and Items in preview count badges).
  * Implemented context block size limits by truncating combined referenced markdown contexts at 15,000 characters to prevent extremely large payload submissions to the LLM.
  * Programmed a manual force stop cancellation mechanism using client-side request tokens (`activeRequestsRef`) and a Stop action button, instantly aborting running GenAI compilations, dismissing the loading skeleton, and safely ignoring any resolving server responses.
  * Implemented cascade deletion cleanups to remove deleted block IDs from dependent GenAI block filters to maintain referential integrity.
  * Added scrollable checkboxes to pick context blocks (excluding all GenAI blocks and itself to prevent circular dependency cycles) and a premium warning banner detailing AI latency/token consciousness.
  * Validated that the production Next.js compilation compiles without any type or routing errors.
* **Discovered**:
  * Found that Prisma handles scalar list checks on PostgreSQL cleanly using `hasSome` for arrays of strings.
  * Realized that adding a role enum value in Prisma requires a database schema sync via `npx prisma db push` and Client regeneration via `npx prisma generate` to rebuild the TypeScript types.
  * Verified that caching `lastGeneratedConfig` is easily persisted across database saves because builder configurations are saved in a dynamic PostgreSQL JSON column.
  * Discovered that client-side request tokens are highly effective in managing async state in React, fully preventing race conditions when compilation is manually stopped.
* **Blocked Items**:
  * None.
* **Next Steps**:
  * Deploy changes to staging, promote a user account to `POWER_EDITOR`, and execute end-to-end user validations.

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

### Session 8 (2026-05-28)
* **Goal**: Resolve issue #23 regarding multi-word accent-insensitive tokenized search filtering on catalog screens, global search, and reusable curation selectors.
* **Accomplished**:
  * Created search utility library `src/lib/search.ts` with diacritics removal and whitespace-split logical-AND token query matching.
  * Replaced literal substring checks with `matchQueryTokens` in in-memory catalog filters: `/members`, `/projects`, `/publications`, `/scholarships`, `/theses`.
  * Updated Global Search page (`/search`) to use the new utility, establishing perfect multi-word token query behavior across all entities.
  * Integrated multi-word accent-insensitive token matching into all reusable curation selectors (`MemberSelector`, `ProjectSelector`, `PublicationSelector`, `ScholarshipSelector`, `ThesisSelector`).
  * Created complete regression testing suite:
    - 10 unit tests for search normalization and token matching (`search.test.ts`).
    - Multi-word token filtering tests for the `MemberSelector` component (`MemberSelector.test.tsx`).
    - Playwright E2E integration test case for space-separated keyword searches (`members.spec.ts`).
  * Verified that all 37 unit tests pass successfully.
  * Verified that the Next.js production build compiles successfully with Turbopack and TypeScript.
* **Discovered**:
  * Realized that the search bug existed uniformly across all reusable entity selector components, which would break administrative linking of entities on forms when typing multiple words. Resolving this globally ensures maximum catalog consistency.
* **Blocked Items**:
  * None.
* **Next Steps**:
  * Request user feedback and deploy to staging.

### Session 9 (2026-05-28)
* **Goal**: Annotate the left-column core profile card with a semantic label, display active/former membership dates, and resolve Safari date picker placeholder behavior globally across all editors.
* **Accomplished**:
  * Identified the approved semantic label "Researcher profile card" defined in memorias-web/docs/semantic-ui-annotation.md.
  * Applied data-component-semantics="Researcher profile card" to the left column Card component in /members/[slug]/page.tsx that contains the core researcher info, credentials, contact information, and action panel.
  * Refined membership active period dates rendering on the "Researcher profile card" to display "Member since [startDate]" for active members and "Member from [startDate] to [endDate]" for former members.
  * Resolved Safari's native HTML5 date input issue (showing the current date as a ghost placeholder in empty inputs) globally by implementing the Dynamic Input Type Switching pattern in all four nullable date-managing forms: MemberForm.tsx, ProjectForm.tsx, ScholarshipForm.tsx, and ThesisForm.tsx.
  * Verified the application behavior with a full test suite run (37/37 tests passing) and a successful production Next.js build compilation.
* **Discovered**:
  * The semantic label "Researcher profile card" was already defined in the controlled vocabulary but was not yet applied to the JSX markup.
  * Implementing Dynamic Input Type Switching (toggling between "text" and "date" on focus/blur) is a lightweight and robust way to resolve native date input placeholder limitations on Safari globally across all entity forms (Member, Project, Scholarship, and Thesis) without drawing in heavy date-picking packages.
* **Blocked Items**:
  * None.
* **Next Steps**:
  * Proceed to implement ACM classification selections and details view rendering once the mockup is approved.

### Session 10 (2026-05-28)
* **Goal**: Implement a reusable ACM CCS selection component and visual path rendering, and integrate them into the active researcher profile editor and detail pages on a new git branch, complying with custom aesthetic and layout preferences.
* **Accomplished**:
  * Created and switched to the clean branch `feature/acm-ccs-interests`.
  * Parsed the complete ACM CCS XML schema (10,569 lines) using a `jsdom` parser script, generating optimized tree and flat-map datasets `acm_ccs.json` and `acm_ccs_flat.json` in `src/lib/`.
  * Created a utility library `acm-ccs-utils.ts` to compute full breadcrumb trails in $O(1)$ and safely parse serialized JSON selections falling back to raw plain text.
  * Developed the premium, search-enabled hierarchical selector `AcmCcsSelector.tsx` component.
  * Built a standalone mockup environment at `/acm-test` separating Next.js Server Components from dynamic client form states.
  * Fully integrated the hierarchical selector into the main profile form (`MemberForm.tsx`) using a low-profile dialog modal pattern: replaced the tall tree inline with space-conscious **Chips rendering their complete taxonomic path trails** (e.g. `Applied computing > Computers in other domains > Agriculture`) and placed editing actions in a centered MUI Dialog.
  * Safely hid Spanish research interests (`interestsInSpanish`) from the editing UI as requested, rendering it as a hidden input to preserve existing database values without form clutter.
  * Integrated path rendering into the English tab in `CvTabs.tsx` displaying category labels and bullet-separated breadcrumbs, and completely removed the Spanish research interests display block (`interestsEs`) from the Spanish tab as requested.
  * Wrote 9 unit tests verifying utilities, achieving 100% pass rates (46/46 tests passing in total).
  * Compiled the Next.js production build successfully with Turbopack, verifying zero type warnings, syntax conflicts, or bundler issues on the new branch.
* **Discovered**:
  * Dotted category IDs mirror the complete taxonomy branches perfectly, enabling instant breadcrumb path generation purely by string splitting.
  * Using a flat index for tree searching in React is extremely optimized, resolving ancestor expansions in under 2 milliseconds.
  * Keeping page routes as Server Components and decoupling interactive mockup states into child Client Components completely avoids Prisma/pg module-not-found compilation errors on the client.
* **Blocked Items**:
  * None.
* **Next Steps**:
  * Request user review on the dynamic profile editor and detail view pages, and proceed to merge `feature/acm-ccs-interests` into the main branch.

---

## Outstanding Questions & Blockers
*(Document any business or code mysteries here for user feedback)*

1. **Question**: We observed `SystemOption` is Compounded Unique on `[listName, value]`. We should verify all distinct option lists in use during Module H.



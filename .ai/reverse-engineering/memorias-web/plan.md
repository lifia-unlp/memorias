# memorias-web Fine-Grained Reverse Engineering Plan

This document outlines the fine-grained roadmaps, checklists, and modular breakdown for reverse engineering the **memorias-web** application.

---

## Roadmap & Milestones

### 📋 Phase 1: Domain Model & Schema Extraction (One-Shot)
* **Goal**: Extract the database structure, enums, constraints, and entities in a single step to build the core foundation of our Shared Glossary.
* **Tasks**:
  - [x] Analyze the Prisma configuration (`prisma/schema.prisma`) and database migration history.
  - [x] Initialize the [`Shared-Domain-Glossary.md`](../../memorias-wiki/Shared-Domain-Glossary.md) with absolute definitions for core entities: `User`, `Member`, `Project`, `Thesis`, `Scholarship`, `Publication`, `SystemOption`, `AuditLog`, `SystemSetting`, `Report`.

---

### 🧱 Phase 2: Modular Functionality & Requirements Analysis
Instead of analyzing the application at a high level, the functional specs will be extracted step-by-step in the following fine-grained modules:

#### Module A: Authentication, Access Control, and Preferences
* **Target Files**: `src/app/auth/`, `src/app/pending-activation/`, `src/app/preferences/`, `src/auth.config.ts`, `src/auth.ts`.
* **Tasks**:
  - [x] Analyze sign-in, sign-up, and provider integration flows.
  - [x] Document the account activation workflow (`pending-activation`) and role-based permissions (`USER`, `EDITOR`, `ADMIN`).
  - [x] Document user preferences (notification subscriptions, digest email toggle).
  - [x] Scenarios: *Sign In*, *Activation Request*, *Update Preferences*.

#### Module B: Member Profiles & CV Management
* **Target Files**: `src/app/members/`, `src/components/members/` (or similar profile subcomponents).
* **Tasks**:
  - [x] Extract the UI layouts and forms for creating, viewing, and modifying member profiles.
  - [x] Detail professional fields, custom categories, UNLP/CONICET/CIC dropdown roles.
  - [x] Document CV fields, short bios, and contact links (ORCID, Google Research, ResearchGate).
  - [x] Scenarios: *Create Profile*, *Edit Professional Roles*, *Link User to Member*.

#### Module C: Projects & Funding Management
* **Target Files**: `src/app/projects/`, `src/components/projects/`.
* **Tasks**:
  - [x] Analyze the project dashboard, search filters, and detail pages.
  - [x] Document fields (directors, funding agencies, amount, duration) and relationships.
  - [x] Detail how members are associated with projects, and the "featured project" flag.
  - [x] Scenarios: *Register Project*, *Associate Project Members*, *Toggle Featured Project*.

#### Module D: Theses & Career Tracking
* **Target Files**: `src/app/theses/`, `src/components/theses/`.
* **Tasks**:
  - [x] Map the progress tracking logic (10% to 100% in intervals of 10).
  - [x] Analyze thesis level fields (PhD, Masters, Grade) and student/director mappings.
  - [x] Document thesis report uploads and external report links.
  - [x] Scenarios: *Register Thesis*, *Update Thesis Progress*, *Filter Theses by Level*.

#### Module E: Scholarships Management
* **Target Files**: `src/app/scholarships/`, `src/components/scholarships/`.
* **Tasks**:
  - [x] Map scholarship definitions, funding agencies, and duration limits.
  - [x] Analyze relationships linking scholarships to projects and theses.
  - [x] Scenarios: *Add Scholarship*, *Associate Scholarship to Project*.

#### Module F: Publications & BibTeX Parsing Engine
* **Target Files**: `src/app/publications/`, `src/lib/bibtex/` (or equivalent parsing utils).
* **Tasks**:
  - [x] Analyze how BibTeX files are imported and parsed into JSON storage (`bibtexData`).
  - [x] Document custom fields like Rank/Indexing and Self-Archiving URLs.
  - [x] Document publications dashboard filters (year, type, author, tag).
  - [x] Scenarios: *Import BibTeX Publication*, *Search Publications by Author*, *Toggle Featured Publication*.

#### Module G: Custom Report Builder & Layout Engine
* **Target Files**: `src/app/reports/`, `src/components/reports/`.
* **Tasks**:
  - [ ] Extract how custom reports are assembled using the JSON block configuration (`blocks`).
  - [ ] Map block types (text, cards, lists), filters, sorting parameters, and user permissions.
  - [ ] Scenarios: *Assemble Custom Report*, *Apply Dynamic Filter to Block*.

#### Module H: Administration & System Options Editor
* **Target Files**: `src/app/admin/`, `src/app/tags/`.
* **Tasks**:
  - [ ] Map the activation/deactivation dashboards for user accounts.
  - [ ] Analyze the list option editor (`SystemOption`) for positions and academic levels.
  - [ ] Map the Audit Log visualizer and the system settings panel.
  - [ ] Scenarios: *Activate Pending User*, *Edit System Options*, *View Audit Log entries*.

---

### 🚀 Phase 3: Traceability Verification & Wiki Publishing
* **Tasks**:
  - [ ] Review all generated sections for 100% compliance with Hyperlink Traceability (`[Term](Shared-Domain-Glossary#term)`).
  - [ ] Assemble the full, verified document.
  - [ ] Publish the specification directly to [`memorias-wiki/Requirements-Specification-Memorias-Web.md`](../../memorias-wiki/Requirements-Specification-Memorias-Web.md).

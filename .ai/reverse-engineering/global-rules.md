# Global Reverse Engineering Methodology & Rules

This document outlines the authoritative rules, analysis guidelines, delivery standards, and glossary to be maintained across all reverse-engineering sessions for **memorias-web** and **memorias-copilot**. All agent activities, plan documents, and generated specifications must conform strictly to these standards.

---

## 1. Core Principles & Philosophy

### Core Rule: Observable Only
* **Extract only what is observable.** 
* Do **not** invent, complete, redesign, rename, normalize, or improve the application.
* Do not suggest improvements in the specifications or analysis documents.
* Keep entity names, field names, UI labels, and enum values exactly as found in the codebase and interface.
* Do not translate labels unless explicitly asked. Do not introduce synonyms.

### Evidence-Based Confidence Ratings
For every extracted item, entity, scenario, or rule, you must explicitly mark and document the level of confidence based on concrete evidence:
* **`[Observed]`**: Directly visible in the UI, source code, database schemas, API schemas, or test suites.
* **`[Inferred]`**: Highly likely, based on multiple intersecting pieces of evidence (must detail the logic behind the inference).
* **`[Uncertain]`**: Possible or suggested by context, but not sufficiently supported by current codebase evidence.

### Evidence Sources to Leverage
* **UI Screens & Assets**: Routes, forms, tables, filters, buttons, labels, dialogs, messages, and mockups.
* **Source Code**: Routes, components, services, controllers, models, validation hooks/logic, and test files.
* **Database Layer**: Database schemas, migration files, seed data scripts, and sample records.
* **Network & APIs**: API routes, request/response payloads, and integration definitions.
* **Existing Meta-Docs**: Internal readmes, code comments, and inline annotations.

---

## 2. Standardized Deliverables Format
Any final analysis or documentation created for the GitHub Wiki or intermediate files must follow these ten sections exactly:

### 1. Application Overview
* Briefly describe what the application currently appears to do based on observed features.

### 2. User Roles
* List observed roles or actor types. For each, describe observable permissions and actions. **Do not invent roles.**

### 3. Domain Model
* List domain entities, fields, relationships, enum values, and constraints.
* Use the exact naming conventions found in the application.
* Include the source of evidence and confidence rating (`[Observed]`, `[Inferred]`, `[Uncertain]`) for each entity, field, and relationship.

### 4. Glossary
* List key terms used by the application. Include both UI labels and internal/codebase names where they differ.

### 5. Screen Inventory
* List all observed screens and routes.
* For each screen, describe its purpose, visible data, active actions, filters, forms, and navigation flows.

### 6. Scenarios (Requirements Analysis Workflows)
* Extract user scenarios representing observable workflows. 
* Do **not** use Gherkin (Given/When/Then) syntax.
* Write each scenario as a narrative or semi-structured requirements-analysis description of how an actor interacts with the existing system to achieve a goal.
* For each scenario, include:
  * **Actor**: The observed user role executing the workflow.
  * **Goal**: The objective the actor wants to achieve.
  * **Preconditions**: Observable state that must be true before the scenario starts.
  * **Trigger**: The event that initiates the scenario.
  * **Main Flow**: The step-by-step observable sequence of interactions between the actor and the system.
  * **Alternative Flows**: Deviations from the main flow that still lead to success.
  * **Error or Empty States**: Observed system responses when validation fails, data is absent, or errors occur.
  * **Postconditions**: The state of the system after the scenario successfully completes.
  * **Involved Screens**: The observed UI screens/routes where the interaction occurs.
  * **Involved Entities**: The domain model entities participating in or modified by the flow.
  * **Evidence**: Concrete code, database, API, or UI lines/elements confirming the workflow.
  * **Confidence**: The evidence rating (`[Observed]`, `[Inferred]`, `[Uncertain]`).

### 7. Business Rules
* Extract validation rules, authorization rules, state transition rules, calculation rules, visibility rules, and data integrity rules.
* **Do not invent rules** that are not programmatically enforced or visually displayed.

### 8. Data and API Contracts
* Where observable, list API endpoints, query parameters, payload schemas, response structures, and related entities.

### 9. Negative Findings
* List things that were searched for but **not** observed in the application (e.g. absent audit logs, missing soft deletes). 
* Phrase these as *"not observed"*, never as defects or system bugs.

### 10. Open Questions
* List ambiguities, code dead-ends, or uncertainties that require direct confirmation from stakeholders.

---

## 3. Session Continuity & AI Workflow
To ensure zero context loss between chat sessions:

1. **Before writing code or specifications**:
   - Locate the relevant project folder under `.ai/reverse-engineering/<app-name>/` (either `memorias-web` or `memorias-copilot`).
   - Read the corresponding `plan.md` and `progress.md` files.
   - Re-read this `global-rules.md` document.
   
2. **Glossary Alignment & Hyperlink Traceability**:
   - Always check the `Shared Domain Glossary` located in the Wiki at [`memorias-wiki/Shared-Domain-Glossary.md`](file:///Volumes/X-Wing/casco/Development/memorias-migration-antigrativy/memorias-wiki/Shared-Domain-Glossary.md). Ensure that all generated domain objects, scenarios, and documentation use exactly these terms. Do not invent synonyms. Update the shared glossary file as new domain terms are reverse-engineered.
   - **Enforce Traceability Links**: Whenever a domain/glossary term is referenced in specifications, scenarios, screen inventories, or rules, it **must** be formatted as a relative Markdown link pointing to its anchor in the glossary page (e.g., `[Memory](Shared-Domain-Glossary#memory)` or `[Usuario](Shared-Domain-Glossary#usuario)`). This enables clickable traceability and lets us find all references across files.

3. **Output Target for Final Specifications**:
   - Once domain models, screen inventories, scenarios, or rules are finalized, write/update the resulting markdown documentation directly to the corresponding wiki files in the `memorias-wiki/` repository folder:
     * **Memorias Web Spec**: [`memorias-wiki/Requirements-Specification-Memorias-Web.md`](file:///Volumes/X-Wing/casco/Development/memorias-migration-antigrativy/memorias-wiki/Requirements-Specification-Memorias-Web.md)
     * **Memorias Copilot Spec**: [`memorias-wiki/Requirements-Specification-Memorias-Copilot.md`](file:///Volumes/X-Wing/casco/Development/memorias-migration-antigrativy/memorias-wiki/Requirements-Specification-Memorias-Copilot.md)
     * **User's Manual**: [`memorias-wiki/Users-Manual.md`](file:///Volumes/X-Wing/casco/Development/memorias-migration-antigrativy/memorias-wiki/Users-Manual.md)

4. **End of Session Handoff**:
   - Before ending your turn or concluding a session, **you must update** the appropriate `progress.md` log file.
   - Summarize what you accomplished, specify any blocked items or questions for the developer, and write concrete `Next Steps` for the subsequent session.
   - If a roadmap milestone has been met, mark it off in `plan.md`.

---

## 4. Shared Domain Glossary
The single source of truth for the Domain Glossary is maintained directly on the public wiki at [`memorias-wiki/Shared-Domain-Glossary.md`](file:///Volumes/X-Wing/casco/Development/memorias-migration-antigrativy/memorias-wiki/Shared-Domain-Glossary.md). 

All reverse-engineering outputs, code models, and test workflows must adhere strictly to the vocabulary defined there. Do not keep duplicate glossary definitions in local files.

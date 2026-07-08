# Workspace Agent Rules & Instructions

You are assisting with the development and reverse engineering of the **memorias** workspace (which contains `memorias-web` and `memorias-copilot`).

---

## 🚀 REVERSE ENGINEERING PROJECT STATE

There is an active reverse engineering project to define the domain model and requirements-analysis scenarios for both applications. You MUST maintain continuity across sessions by following these steps:

1. **Before writing code or specifications**:
   - Locate the relevant project folder under `.ai/reverse-engineering/<app-name>/` (either `memorias-web` or `memorias-copilot`).
   - Read the corresponding `plan.md` and `progress.md` files.
   - Read `.ai/reverse-engineering/global-rules.md` for formatting and naming guidelines.
   
2. **Glossary Alignment & Hyperlink Traceability**:
   - Always check the `Shared Domain Glossary` located in the Wiki at [`Shared-Domain-Glossary.md`](../memorias-wiki/Shared-Domain-Glossary.md). Ensure that all generated domain objects, scenarios, and documentation use exactly these terms. Do not invent synonyms. Update this shared glossary file as new domain terms are reverse-engineered.
   - **Enforce Traceability Links**: Whenever a domain/glossary term is referenced in specifications, scenarios, screen inventories, or rules, it **must** be formatted as a relative Markdown link pointing to its anchor in the glossary page (e.g., `[Memory](Shared-Domain-Glossary#memory)` or `[Usuario](Shared-Domain-Glossary#usuario)`). This enables clickable traceability and let us find all references across files.

3. **Output Target for Final Specifications**:
   - Once domain models, screen inventories, scenarios, or rules are finalized, write/update the resulting markdown documentation directly to the corresponding wiki files in the `memorias-wiki/` repository folder:
     * **Memorias Web Spec**: [`Requirements-Specification-Memorias-Web.md`](../memorias-wiki/Requirements-Specification-Memorias-Web.md)
     * **Memorias Copilot Spec**: [`Requirements-Specification-Memorias-Copilot.md`](../memorias-wiki/Requirements-Specification-Memorias-Copilot.md)
     * **User's Manual**: [`Users-Manual.md`](../memorias-wiki/Users-Manual.md)

4. **End of Session Handoff**:
   - Before ending your turn or concluding a session, **you must update** the appropriate `progress.md` log file.
   - Summarize what you accomplished, specify any blocked items or questions for the developer, and write concrete `Next Steps` for the subsequent session.
   - If a roadmap milestone has been met, mark it off in `plan.md`.

---

## 🛠️ ENVIRONMENT & BUILD RULES

* **Next.js Breaking Changes Warning**:
  - The `memorias-web` application may contain breaking Next.js changes compared to standard pre-trained LLM context.
  - Pay attention to custom Next.js configurations and routing setups.

* **Test Coverage Requirement**:
  - Do not modify or refactor any code file or component unless it is covered by automated unit or E2E tests.
  - If a file or component lacks test coverage, you must create the corresponding automated tests before or alongside applying any modifications.

* **Shell Command Safety & Escaping**:
  - When running shell commands, always escape special characters (e.g. parentheses `(`, `)`, semicolons `;`, ampersands `&`, etc.) or wrap arguments in single quotes (`'`) to prevent the zsh/sh shell from interpreting them as subshells or background operators.



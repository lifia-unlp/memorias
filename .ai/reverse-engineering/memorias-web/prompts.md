# memorias-web Reverse Engineering Prompts

This catalog stores the exact prompts, system instructions, and templates proven to generate accurate models and scenarios for **memorias-web**.

---

## 1. Domain Extraction Prompt

Copy-paste this prompt when initiating a file or module analysis session:

```text
You are an expert systems analyst. Analyze the following source code files from the memorias-web application. 
Your goal is to extract the core domain objects, their relationships, fields, and business rules.

Please output your findings in the following format:
1. **Entity Name**: Describe what it represents in plain business language.
2. **Attributes**: Present a table with Column Name, Data Type, Constraints (e.g. Unique, Nullable), and Description.
3. **Relationships**: List other entities it relates to and the type of relationship (e.g. 1-to-many).
4. **Business Rules**: Extract any validation logic, calculations, or status constraints found in the code.

Traceability Rule: Whenever you refer to any core domain or glossary terms (such as Memory, User, Tag, etc.) in your output, you must format them as relative Markdown links pointing to their definitions in the Shared Domain Glossary page: `[Memory](Shared-Domain-Glossary#memory)`.

Here are the files:
[PASTE CODE OR FILE REFERENCES HERE]
```

---

## 2. Requirements Analysis Scenario Generation Prompt

Use this prompt to turn reverse-engineered logic, user flows, or controller behaviors into semi-structured requirements scenarios:

```text
Review the domain objects, screens, and controller logic analyzed for [Feature Name] in memorias-web.
Generate a comprehensive set of Requirements-Analysis Scenarios detailing how actors interact with the system to achieve goals.

Do NOT use Gherkin syntax (Given/When/Then). Instead, output each scenario in the following semi-structured format:

### Scenario: [Scenario Name]
* **Actor**: [Observed role executing the flow]
* **Goal**: [What the actor wants to achieve]
* **Preconditions**: [State of the system/user before triggering]
* **Trigger**: [What initiates the flow]
* **Main Flow**:
  1. [Step 1...]
  2. [Step 2...]
* **Alternative Flows**:
  * [Describe alternate paths that lead to success]
* **Error or Empty States**:
  * [Describe system responses to validation failures, empty data, or errors]
* **Postconditions**: [State of the system after success]
* **Involved Screens**: [List observed UI screens/routes]
* **Involved Entities**: [List involved domain entities]
* **Evidence**: [References to files, UI widgets, or database schema elements]
* **Confidence**: [Observed / Inferred / Uncertain]

Traceability Rule: Every time you mention a domain or glossary term in any of the fields above (such as in Actor, Preconditions, Flows, Postconditions, or Involved Entities), you must format it as a relative Markdown link to its glossary page definition, for example: `[Memory](Shared-Domain-Glossary#memory)`.
```

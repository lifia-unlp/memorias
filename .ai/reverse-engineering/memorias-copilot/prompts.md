# memorias-copilot Reverse Engineering Prompts

This catalog stores the exact prompts, system instructions, and templates proven to generate accurate models and scenarios for **memorias-copilot**.

---

## 1. Domain Extraction Prompt

Copy-paste this prompt when initiating a file or module analysis session:

```text
You are an expert systems analyst. Analyze the following source code files from the memorias-copilot application. 
Your goal is to extract the core domain objects, prompt utilities, and data models used by the copilot.

Please output your findings in the following format:
1. **Entity/Service Name**: Describe what it represents/does in the copilot ecosystem.
2. **Context Inputs**: What data or schema inputs are required for its execution?
3. **LLM/Promoting Logic**: Describe the prompts, parameters, and LLM providers used.
4. **Business Rules**: Extract any validation logic, fallback behaviors, or flow constraints found.

Traceability Rule: Whenever you refer to any core domain or glossary terms (such as Memory, User, Tag, etc.) in your output, you must format them as relative Markdown links pointing to their definitions in the Shared Domain Glossary page: `[Memory](Shared-Domain-Glossary#memory)`.

Here are the files:
[PASTE CODE OR FILE REFERENCES HERE]
```

---

## 2. Requirements Analysis Scenario Generation Prompt

Use this prompt to turn reverse-engineered logic, agent execution flows, or integrations into semi-structured requirements scenarios:

```text
Review the domain objects, context-gathering flows, and model integrations analyzed for [Feature Name] in memorias-copilot.
Generate a comprehensive set of Requirements-Analysis Scenarios detailing how actors (or the host application) interact with the copilot to achieve goals.

Do NOT use Gherkin syntax (Given/When/Then). Instead, output each scenario in the following semi-structured format:

### Scenario: [Scenario Name]
* **Actor**: [Observed role or system actor executing the flow]
* **Goal**: [What the actor wants to achieve]
* **Preconditions**: [State of the system/copilot context before triggering]
* **Trigger**: [What initiates the flow]
* **Main Flow**:
  1. [Step 1...]
  2. [Step 2...]
* **Alternative Flows**:
  * [Describe alternate paths that lead to success]
* **Error or Empty States**:
  * [Describe system responses to context truncation, timeout, bad formats, or empty states]
* **Postconditions**: [State of the copilot/system after success]
* **Involved Screens**: [List observed UI interfaces or endpoints]
* **Involved Entities**: [List involved domain or service entities]
* **Evidence**: [References to files, agent configurations, or database entities]
* **Confidence**: [Observed / Inferred / Uncertain]

Traceability Rule: Every time you mention a domain or glossary term in any of the fields above (such as in Actor, Preconditions, Flows, Postconditions, or Involved Entities), you must format it as a relative Markdown link to its glossary page definition, for example: `[Memory](Shared-Domain-Glossary#memory)`.
```

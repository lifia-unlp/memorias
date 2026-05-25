# memorias-copilot Fine-Grained Reverse Engineering Plan

This document outlines the fine-grained roadmaps, checklists, and modular breakdown for reverse engineering the **memorias-copilot** application.

---

## Roadmap & Milestones

### 📋 Phase 1: Database Model & Sync Mechanics (One-Shot)
* **Goal**: Extract the read-only database connections and model mappings in a single step to lay out the technical foundations of the Copilot.
* **Tasks**:
  - [x] Analyze `sync_db.py` to understand how the Copilot mirrors or connects to the main postgres database.
  - [x] Analyze `backend/src/copilot/models.py` and `backend/src/copilot/db/` mapping objects.
  - [x] Document data synchronization intervals and local sqlite/postgres read-only schema mappings.

---

### 🧱 Phase 2: Modular Functionality & Requirements Analysis
Instead of analyzing the application at a high level, the functional specs will be extracted step-by-step in the following fine-grained modules:

#### Module A: Session Management & FastAPI REST API Server
* **Target Files**: `backend/src/copilot/server.py`, `backend/src/copilot/session.py`, `backend/src/copilot/config.py`.
* **Tasks**:
  - [x] Map FastAPI routes, endpoints (`/chat`, `/sessions`), query/path parameters, and JSON payloads.
  - [x] Document session state preservation, chat history logic, and limits (e.g. rate limits, timeout configurations).
  - [x] Detail CORS, environment variable setups, and backend settings.
  - [x] Scenarios: *Initialize Chat Session*, *Send Message with Session ID*, *Clear Chat History*.

#### Module B: Core System Prompts & LLM Orchestrator
* **Target Files**: `backend/src/copilot/prompts/system_prompt.md`, `backend/src/copilot/llm.py`.
* **Tasks**:
  - [x] Deconstruct the primary system instructions, domain guidance rules, and the strict read-only / no-hallucination / no-emoji guards.
  - [x] Analyze the LLM provider connections (Google Gemini, OpenAI, etc.), parameters (temperature, max tokens), and error fallbacks.
  - [x] Scenarios: *Enforce No-Hallucination Guard*, *Request Model Response*, *Handle LLM Endpoint Timeout*.

#### Module C: Agent Query Tools & Dispatcher
* **Target Files**: `backend/src/copilot/tools/definitions.py`, `backend/src/copilot/tools/dispatcher.py`.
* **Tasks**:
  - [x] Inventory every tool exposed to the agent (e.g., search members, filter publications, get project details).
  - [x] Map parameters, JSON outputs, search algorithms, and DB adapters.
  - [x] Verify security rules (preventing SQL injection, verifying no DB write methods exist in tools).
  - [x] Scenarios: *Agent triggers member lookup tool*, *Agent queries publication records*, *Gracefully handle missing search parameters*.

#### Module D: Frontend Chat Client Overlay
* **Target Files**: `frontend/index.html`, `frontend/js/`, `frontend/css/`.
* **Tasks**:
  - [x] Inventory the UI widgets: chat bubble overlay, text inputs, conversation window, and session control buttons.
  - [x] Detail the JavaScript state management (session local storage, async fetch calls, message rendering queues).
  - [x] Document custom styling tokens, layouts, and constraints (e.g., no emojis, responsive mobile behavior).
  - [x] Scenarios: *Open Chat Widget*, *Submit Message*, *Render Model Streaming Message*, *Render Network Error State*.

---

### 🚀 Phase 3: Traceability Verification & Wiki Publishing
* **Tasks**:
  - [x] Review all generated sections for 100% compliance with Hyperlink Traceability (`[Term](Shared-Domain-Glossary#term)`).
  - [x] Assemble the full, verified document.
  - [x] Publish the specification directly to [`memorias-wiki/Requirements-Specification-Memorias-Copilot.md`](../../memorias-wiki/Requirements-Specification-Memorias-Copilot.md).

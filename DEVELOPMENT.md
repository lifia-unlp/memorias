# Local Development & Setup Guide

This guide is the unified step-by-step reference for setting up the local development environment and running both **Memorias Web Portal** and **Memorias Copilot** on your local machine.

---

## 🛠️ Prerequisites

Ensure you have the following installed on your machine:
- **Node.js** (v18+ recommended) & **npm**
- **Python** (v3.12+ recommended) — managed via `pyenv` is highly recommended
- **uv** (Astral's fast Python package installer)
- **Git**

---

## 🐘 1. Database Setup (Prisma PostgreSQL Sandbox)

Prisma v7 uses a lightweight local database engine running in the background. You **do not** need to install or run a separate PostgreSQL server on your Mac.

Navigate to the `memorias-web` directory:
```bash
cd memorias-web
```

### Common Prisma Sandbox Commands:

* **Check if database is running & get connection URL**:
  ```bash
  npx prisma dev ls
  ```
* **Start database sandbox in the background (detached)**:
  ```bash
  npx prisma dev --detach
  ```
* **Start database sandbox in the foreground**:
  ```bash
  npx prisma dev
  ```
* **Stop database sandbox**:
  ```bash
  npx prisma dev stop default
  ```
* **Reset all tables & clear data (keep sandbox running)**:
  ```bash
  npx prisma db push --force-reset
  ```
* **Completely drop and recreate the sandbox**:
  ```bash
  npx prisma dev rm default --force
  npx prisma dev --detach
  npx prisma db push
  ```

---

## 💻 2. Next.js Web App Setup (`memorias-web`)

The main portal is built using Next.js, Tailwind CSS, Prisma, and PostgreSQL.

### Setup Steps:
1. Navigate to the directory:
   ```bash
   cd memorias-web
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Set up your local environment file:
   ```bash
   cp .env.example .env
   ```
   *(For local development against the Prisma sandbox, ensure `DATABASE_URL` is set to your sandbox local database URL).*
4. Synchronize the database schema:
   ```bash
   npx prisma db push
   ```
5. Seed initial settings options:
   ```bash
   node prisma/seed-options.js
   ```
6. Run the development server:
   ```bash
   npm run dev
   ```
   Open **`http://localhost:3000`** in your browser.

---

## 🤖 3. AI Copilot Setup (`memorias-copilot`)

The conversational research assistant consists of a Python FastAPI backend and a Vanilla HTML/CSS/JS frontend.

### A. Backend Setup:
1. Install **uv** if you haven't already:
   ```bash
   curl -LsSf https://astral.sh/uv/install.sh | sh
   ```
2. Navigate to the backend directory:
   ```bash
   cd memorias-copilot/backend
   ```
3. Configure the local Python version (using pyenv):
   ```bash
   pyenv local 3.12.9
   ```
4. Install all dependencies and create virtual environment:
   ```bash
   uv sync --all-extras
   ```
5. Configure your local environment file:
   ```bash
   cp .env.example .env
   ```
   Make sure to fill in your `OPENAI_API_KEY` and the correct read-only role or main database `DATABASE_URL` in `.env`.
6. Start the FastAPI development server:
   ```bash
   uv run uvicorn --app-dir src copilot.server:app --reload --port 8000
   ```
   The backend API will be live at `http://localhost:8000`.

### B. Frontend Setup:
The frontend uses native ES modules, which browsers block when loaded directly from files (`file://`). Therefore, you must serve it using a local HTTP server.

* **Option A: Python's built-in HTTP server**:
  ```bash
  cd memorias-copilot/frontend
  python3 -m http.server 3000
  ```
* **Option B: Node-based static server**:
  ```bash
  npx -y serve memorias-copilot/frontend -p 3000
  ```
Once the server is running, open **`http://localhost:3000`** in your browser to interact with the copilot.

---

## 🔄 4. Running the Full Stack Locally

To run the complete Memorias environment locally, you will need three terminal tabs:

1. **Tab 1 (Database)**: Keep your local Prisma sandbox running.
   ```bash
   cd memorias-web
   npx prisma dev --detach
   ```
2. **Tab 2 (Web Portal)**: Run the Next.js frontend and main app.
   ```bash
   cd memorias-web
   npm run dev
   ```
3. **Tab 3 (Copilot Backend)**: Run the AI assistant API.
   ```bash
   cd memorias-copilot/backend
   uv run uvicorn --app-dir src copilot.server:app --reload --port 8000
   ```
4. **Tab 4 (Copilot Frontend)**: Serve the AI assistant UI.
   ```bash
   python3 -m http.server 3000  # or FastAPI will serve it statically
   ```

---

## 🧪 5. Testing & Code Quality

### Web App (`memorias-web`) Quality Suite:
- **Run Unit/Integration Tests**:
  ```bash
  cd memorias-web
  npm run test
  # or using Vitest directly:
  npx vitest
  ```
- **Run E2E / Browser Tests (Playwright)**:
  ```bash
  cd memorias-web
  npx playwright test
  ```
- **Lint Code**:
  ```bash
  npm run lint
  ```

### Copilot (`memorias-copilot`) Quality Suite:
Navigate to `memorias-copilot/backend` and run:
- **Run unit tests (pytest)**:
  ```bash
  uv run pytest
  ```
- **Run tests with coverage**:
  ```bash
  uv run pytest --cov=copilot --cov-report=term-missing
  ```
- **Type-checking (mypy)**:
  ```bash
  uv run mypy .
  ```
- **Linting & Formatting (ruff)**:
  ```bash
  uv run ruff check .       # Lints
  uv run ruff check --fix . # Lints & auto-fixes
  uv run ruff format .      # Formats
  ```
- **Run all checks in a single command**:
  ```bash
  uv run ruff format --check . && uv run ruff check . && uv run mypy . && uv run pytest
  ```

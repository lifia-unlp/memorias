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

---

## 👥 6. Core Concepts: User & Member Relationship

In the Memorias portal, authentication and academic profiles are separated to maintain clean data boundary control:

1. **User Model (`User`)**: Represents a registered account with login credentials, role assignments (USER, EDITOR, ADMIN), and notification preferences.
2. **Member Model (`Member`)**: Represents a physical academic or researcher profile listing their publications, projects, defended theses, biography, UNLP courses, and affiliations.

### The One-to-One Mapping:
* **The Relationship**: A `User` can be linked to exactly one `Member` profile via the `memberId` field (which is a unique one-to-one constraint in the database).
* **Security & Modification**:
  * **Admin Only**: Only administrators have authorization to change these mappings via the **User Administration** dashboard (`/admin/users`).
  * **Read-Only Display**: Normal users can view their associated Member profile name as a read-only field under **User Preferences** (`/preferences`), but cannot alter it.
* **Benefits & Contexts**:
  * **Targeted Alerts**: Enables sending immediate email digests or notifications specifically to the logged-in user when publications or defended theses connected to their `Member` profile are updated.
  * **Pre-Filtered Reporting**: Streamlines report creation by automatically selecting the user's mapped researcher profile in search builder forms.

---

## ✉️ 7. Configuring & Testing Email Sends

The email notification service uses secure SMTP connections fully compatible with standard third-party hosts like Google Gmail and Microsoft Office 365/Outlook.

### A. Local SMTP Configuration
To set up email notifications, add the following variables to your local `memorias-web/.env` file:

```env
# SMTP Mail Delivery Settings
SMTP_HOST="smtp.gmail.com"  # Use smtp.office365.com for Office 365
SMTP_PORT="587"             # STARTTLS port
SMTP_SECURE="false"         # set "true" for port 465 (SSL/TLS), or "false" for 587 (STARTTLS)
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM_NAME="LIFIA Memorias"
SMTP_FROM_EMAIL="noreply@lifia.info.unlp.edu.ar"
```

> [!IMPORTANT]
> When using Google Gmail, you must generate a secure **App Password** from your Google Account settings instead of using your primary account password. Similarly, for Microsoft Outlook/Office 365, ensure SMTP AUTH is enabled for the mailbox and use an app-specific password if Multi-Factor Authentication is active.

### B. Fallback / Development Mode
* If any of `SMTP_HOST`, `SMTP_USER`, or `SMTP_PASS` are unconfigured in your `.env` file, the email service will automatically fall back to **JSON logging mode**.
* In this mode, no real emails are sent. Instead, standard logs and message payloads are printed directly to the terminal where Next.js is running, allowing you to debug and verify layout strings easily.

### C. Isolated Testing (Vitest)
When running tests, the email service automatically intercepts all email-sending operations and redirects them to an in-memory stream transport. This ensures tests are self-contained and run extremely quickly without needing internet access or real credentials.

To run the full suite of email service tests locally, navigate to `memorias-web` and execute:
```bash
npx vitest run src/lib/__tests__/email.test.ts
```


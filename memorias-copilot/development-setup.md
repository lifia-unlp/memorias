# Memorias Copilot — Developer Setup & Common Recipes

This document is the step-by-step reference for setting up a development environment
and performing the most common day-to-day tasks. All commands assume macOS + zsh.

---

## Prerequisites

- **pyenv** already installed and configured in `~/.zshrc`
- **`UV_CACHE_DIR`** set in `~/.zshrc` (e.g. pointing to your external disk)
- Git

---

## 1. Install uv

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Then reload your shell (or open a new terminal tab):

```bash
source ~/.zshrc
```

Verify:

```bash
uv --version
```

---

## 2. Python version management (pyenv)

### Install a specific Python version

```bash
pyenv install 3.12.9
```

### List all installed versions

```bash
pyenv versions
```

### List all available versions to install

```bash
pyenv install --list | grep "3\.12"
```

### Set the Python version for this project

Run this once from inside `memorias-copilot/backend/`:

```bash
pyenv local 3.12.9
```

This creates a `.python-version` file. `uv` reads it automatically.

### Check which Python is active in the current directory

```bash
pyenv version
python --version
```

---

## 3. Project setup (first time)

```bash
# 1. Go to the backend directory
cd memorias-copilot/backend

# 2. Confirm the right Python version is active
python --version        # should print 3.12.x

# 3. Install all dependencies and create .venv in one step
uv sync --all-extras

# 4. Verify the environment
uv run python --version
uv run mypy --version
uv run pytest --version
```

The `.venv` folder is created inside `memorias-copilot/backend/` — on your external
disk because that is where the project lives.

---

## 4. Day-to-day uv tasks

### Add a new runtime dependency

```bash
uv add <package>
# Example:
uv add httpx
```

### Add a development-only dependency

```bash
uv add --dev <package>
# Example:
uv add --dev pytest-cov
```

### Remove a dependency

```bash
uv remove <package>
```

### Update all dependencies to latest compatible versions

```bash
uv lock --upgrade
uv sync
```

### Update a single package

```bash
uv lock --upgrade-package <package>
uv sync
```

### Reproduce the exact environment on any machine (CI, teammate)

```bash
uv sync          # reads uv.lock and installs exact versions
```

### Show installed packages

```bash
uv pip list
```

---

## 5. Running project tools

Always use `uv run` — no need to activate the virtual environment manually.

### Start the development server

```bash
uv run uvicorn --app-dir src copilot.server:app --reload
```

### Run all tests

```bash
uv run pytest
```

### Run tests with coverage report

```bash
uv run pytest --cov=copilot --cov-report=term-missing
```

### Type-check the entire codebase

```bash
uv run mypy .
```

### Lint and format

```bash
# Check for issues
uv run ruff check .

# Fix auto-fixable issues
uv run ruff check --fix .

# Format code
uv run ruff format .

# Check formatting without changing files (useful in CI)
uv run ruff format --check .
```

### Run all quality checks in one shot (recommended before committing)

```bash
uv run ruff format --check . && \
uv run ruff check . && \
uv run mypy . && \
uv run pytest
```

---

## 6. Managing the uv cache

The cache is shared across all your Python projects and lives at the path you
set in `UV_CACHE_DIR`.

### Show cache size and location

```bash
uv cache dir
du -sh "$(uv cache dir)"
```

### Clear the cache (safe — packages are re-downloaded on next install)

```bash
uv cache clean
```

---

## 7. Virtual environment tips

### Where is the venv?

```bash
uv run python -c "import sys; print(sys.prefix)"
```

It will be inside `memorias-copilot/backend/.venv/`.

### Activate the venv manually (rarely needed — prefer `uv run`)

```bash
source .venv/bin/activate
deactivate   # to exit
```

### Delete and recreate the venv from scratch

```bash
rm -rf .venv
uv sync
```

---

## 8. Environment variables

Copy the example file and fill in your values — never commit `.env`:

```bash
cp .env.example .env
```

Key variables (full list in `.env.example`):

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | Your OpenAI API key |
| `DATABASE_URL` | PostgreSQL connection string (read-only role) |
| `SESSION_TIMEOUT_SECONDS` | Idle session expiry (default: 1800) |
| `RATE_LIMIT_RPM` | Max requests per minute per session |
| `COST_CIRCUIT_BREAKER_USD` | USD threshold that triggers maintenance mode |

---

## 9. Git hygiene

Files that must **never** be committed:

```
.env
.venv/
__pycache__/
*.pyc
.mypy_cache/
.ruff_cache/
.pytest_cache/
```

These are already listed in `.gitignore` (generated with the project).

---

## 10. Frontend local development

The frontend uses **native ES modules** (`type="module"` in the HTML). Browsers
block ES module imports when the page is loaded directly from the filesystem
(`file://`), so you must serve it from a local HTTP server.

### Quickest option — Python's built-in server

```bash
cd memorias-copilot/frontend
python3 -m http.server 3000
```

Then open `http://localhost:3000` in your browser.

### Alternatively — any static file server

```bash
# Node-based (if you have npx available)
npx -y serve memorias-copilot/frontend -p 3000
```

### In production

The backend (FastAPI) will serve the `frontend/` directory as static files, so
no separate server is needed in production.

---

## 11. Running the full stack locally

Once the backend is implemented:

```bash
# Terminal 1 — backend
cd memorias-copilot/backend
uv run uvicorn copilot.server:app --reload --port 8000

# Terminal 2 — frontend (FastAPI serves it, or use the Python server above)
# Navigate to http://localhost:8000
```

The frontend's `ApiClient` defaults to the same origin, so no extra configuration
is needed when both run on the same port.

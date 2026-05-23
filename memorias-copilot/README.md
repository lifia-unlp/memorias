# Memorias Copilot

Memorias Copilot is a research lab assistant designed to help users explore the contents of the Memorias database through natural-language conversation.

This directory contains the codebase for both the backend (FastAPI) and the frontend (Vanilla HTML/JS/CSS).

## How to Start the Servers

You can run both the backend and frontend servers locally by following these steps.

### 1. Start the Backend Server

The backend is built with Python 3.12, FastAPI, and uv.

1. Navigate to the backend directory:
   ```bash
   cd memorias-copilot/backend
   ```

2. Make sure you have created and configured your .env file:
   ```bash
   cp .env.example .env
   ```

3. Start the development server using uv:
   ```bash
   uv run uvicorn --app-dir src copilot.server:app --reload --port 8000
   ```

The backend API will be available at http://localhost:8000.

### 2. Start the Frontend Server

The frontend uses native ES modules, which browsers block when loaded directly from the filesystem (file://). Therefore, you must serve it using a local HTTP server.

#### Option A: Python's built-in HTTP server
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd memorias-copilot/frontend
   ```

2. Serve the directory on port 3000:
   ```bash
   python3 -m http.server 3000
   ```

#### Option B: Node-based static server
Serve the directory using npx serve:
```bash
npx -y serve memorias-copilot/frontend -p 3000
```

Once the server is running, open your browser and navigate to http://localhost:3000 to interact with the copilot.

---

## Additional Resources

- For detailed developer setup, dependencies, formatting, and quality checks, see development-setup.md.
- For details on the features and behavior of the copilot, see functionality.md.
- For architecture decisions and components, see architecture-and-design.md.
- For development guidelines and rules, see rules.md.

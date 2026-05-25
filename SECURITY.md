# Security Policy & Deployment Checklist

Welcome to the **Memorias Research Portal & AI Copilot** repository. 

To ensure the safety, privacy, and integrity of the application in development and production environments, all developers and deployers must strictly adhere to the security guidelines below.

---

## 🔑 1. Secrets & Credentials Management

* **Never Commit Environment Files**: Ensure local environment files (`.env`, `.env.local`, `.env.development.local`, `.env.production.local`, etc.) are never tracked in Git. These files are correctly listed in `.gitignore` by default.
* **Pre-commit Secrets Check**: Before committing and pushing changes, ensure no active API keys, passwords, or OAuth credentials are left in code blocks, test files, or comments.
* **Scan Repository History**: It is highly recommended to run a secret scanner (such as [Gitleaks](https://github.com/gitleaks/gitleaks) or [TruffleHog](https://github.com/trufflesecurity/trufflehog)) before making this repository public or sharing it.
  ```bash
  # Check repository history with gitleaks
  gitleaks detect --verbose
  ```
* **Verify Client-Side Exposure**: Next.js automatically bundles environment variables prefixed with `NEXT_PUBLIC_` into the client-side JavaScript sent to browsers. **Never** prefix database URLs, OAuth secrets, SMTP passwords, or OpenAI API keys with `NEXT_PUBLIC_`.

---

## 🐳 2. Secure Docker & Network Deployment

If you are using the Docker Compose configurations described in `DEPLOYMENT.md`, implement these network hardening practices:

* **Isolate the Database (PostgreSQL)**:
  * By default, the database container binds to port `5432`.
  * **Production Action**: Remove the port mapping entirely if the Next.js app communicates on the shared container network (`memorias-network`). If external admin access is needed, map it exclusively to localhost:
    ```yaml
    # Secure postgres mapping in docker-compose.db.yml
    ports:
      - "127.0.0.1:5432:5432"
    ```
* **Protect the AI Copilot API**:
  * The Copilot backend runs on port `8000`. Do not expose this port directly to the public internet, as it interacts with LLM providers (e.g. OpenAI) and could be abused.
  * Keep port `8000` private, or add API authorization headers/rate-limiting at the proxy level.
* **Always Use SSL/TLS (HTTPS)**:
  * Never serve the application over plain HTTP in production. Wrap the Next.js (port `3000`) and Copilot (port `8000`) containers with a reverse proxy (e.g., Nginx, Caddy, or Traefik) configured with valid SSL certificates.

---

## 💾 3. Data Privacy & Legacy Migration Safety

The system supports migrating database entries from legacy MongoDB instances. 
* **PII Protection**: When performing migrations on shared or staging servers, ensure that MongoDB dump files (`.bson`, `.json`) containing real user emails, passwords, or personal details are stored securely outside of the project repository.
* **Clean Dumps**: Ensure no raw database dumps are accidentally added or committed. Verify your `.gitignore` configuration ignores `/dump/` and database files.

---

## 🤖 4. AI Copilot Safety & Cost Controls

* **Guardrail Prompts**: Ensure backend AI prompts instruct the models not to disclose system instructions, database schemas, or database credentials.
* **API Spending Limits**: Set monthly spending limits and usage alerts on your OpenAI Developer Console to safeguard against unexpected spikes in query volume.
* **FastAPI Rate Limiting**: Consider adding middleware rate-limiters (e.g., `slowapi`) to the backend query endpoints to deter automated spam.

---

## 🛡️ 5. Reporting a Security Vulnerability

If you discover a potential security vulnerability in this project, please **do not** open a public issue. Instead, report it privately to the maintainers or the development lead at LIFIA/Cientópolis so it can be mitigated before publication.

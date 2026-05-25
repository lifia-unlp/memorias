# Memorias Web Portal

This directory contains the main web application and repository portal for **Memorias**. It is a modern, responsive academic and laboratory management platform built to catalog research publications, defended theses, active projects, scholarships, and members' profiles.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 15 (App Router with TypeScript)
- **Database Access**: Prisma ORM (v7+)
- **Database**: PostgreSQL (configured with `@prisma/adapter-pg` pool connection)
- **UI Design System**: Material UI (MUI) for a premium, clean user interface
- **Testing**: Vitest (Unit/Integration) and Playwright (End-to-End browser tests)

---

## 🚦 Getting Started

For the complete guide on environment variables, Prisma PostgreSQL database sandboxes, and full-stack local setup, please see the master documentation at the root of the project:
👉 **[Root DEVELOPMENT.md](../../DEVELOPMENT.md)**

### Key Package Commands

To run commands within the `memorias-web` directory:

```bash
# 1. Install Node modules
npm install

# 2. Run local Next.js development server
npm run dev

# 3. Build optimized production bundle
npm run build

# 4. Start production server
npm run start

# 5. Run type checks and code linting
npm run lint
```

---

## 🧪 Testing Suites

```bash
# Run unit and integration tests (Vitest)
npm run test

# Run tests in UI watch mode
npx vitest

# Run Playwright End-to-End browser tests
npx playwright test
```

---

## 📂 Deep-Dive Module Documentation

This module contains specialized guides inside the **`docs/`** folder:

- **[migration.md](docs/migration.md)**: Details the design of the MongoDB-to-PostgreSQL two-pass translation engine and transformation rules.
- **[deployment_guide.md](docs/deployment_guide.md)**: Deep-dive deployment instructions for Proxmox and Ubuntu server hosts.
- **[local_development.md](docs/local_development.md)**: Deep-dive local Prisma Postgres database management operations (sandbox listing, detaching, reconstructing).
- **[bibtex-fields.md](docs/bibtex-fields.md)**: Metadata structure, required keys, and JSON models for BibTeX academic publications.
- **[testing-strategy.md](docs/testing-strategy.md)**: Detailed QA walkthrough covering mock authenticators and headless browser runs.
- **[semantic-ui-annotation.md](docs/semantic-ui-annotation.md)**: Rationale and guidelines behind the UI migration to Material design standards.

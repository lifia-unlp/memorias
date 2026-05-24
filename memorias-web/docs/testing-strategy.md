# memorias-web Testing Strategy

This document outlines the testing strategy, file structures, covered test scenarios, and execution commands for the automated test suite established in the `memorias-web` component.

---

## 1. Test Strategy

We adopt a **two-tiered testing strategy** designed to maximize confidence, execution speed, and resilience:

1. **Component & Unit Testing (Fast feedback, headless JSDOM)**:
   - **Framework**: **Vitest** + **React Testing Library (RTL)** + **jsdom**
   - **Purpose**: Verifies that reusable UI components render correctly under varying inputs, update selection state through interactive callbacks, filter matches on user search queries, and apply precise sorting rules (dates, alphabetical) client-side in isolation.
2. **End-to-End (E2E) Browser Integration Testing (Real browser flows)**:
   - **Framework**: **Playwright** + **Chromium**
   - **Purpose**: Verifies full page layouts, routing page transitions, search parameters synchronization in URLs, and component presence. E2E tests leverage the application's **Semantic UI annotations** (`data-component-semantics="..."`) as stable locators, keeping tests fully decoupled from volatile CSS classes or text matches.
   - **Automation**: Uses a built-in `webServer` block to automatically boot and tear down the Next.js development server on port 3000 during test execution.

---

## 2. Files Involved

### Configuration & Setup
- [package.json](file:///Users/casco/Development/memorias-migration-antigrativy/memorias-web/package.json): Houses automated test scripts (`npm run test`, `npm run test:watch`, `npm run test:e2e`).
- [vitest.config.ts](file:///Users/casco/Development/memorias-migration-antigrativy/memorias-web/vitest.config.ts): Configuration for Vitest unit runner, including JSDOM environment, setup hook triggers, and tsconfig path aliases (`@/*`).
- [playwright.config.ts](file:///Users/casco/Development/memorias-migration-antigrativy/memorias-web/playwright.config.ts): E2E configuration defining Chromium test specs, base URL, parallel threads, and automatic web server startup settings.
- [src/test/setup.ts](file:///Users/casco/Development/memorias-migration-antigrativy/memorias-web/src/test/setup.ts): Initializer script extending Vitest matchers with `@testing-library/jest-dom` assertions.
- [.gitignore](file:///Users/casco/Development/memorias-migration-antigrativy/memorias-web/.gitignore): Excludes Playwright execution caches (`/test-results/`, `/playwright-report/`).

### Test Suites
- [src/components/reusable/__tests__/MemberSelector.test.tsx](file:///Users/casco/Development/memorias-migration-antigrativy/memorias-web/src/components/reusable/__tests__/MemberSelector.test.tsx): Unit tests verifying the involved lab members selector logic.
- [src/components/reusable/__tests__/ProjectSelector.test.tsx](file:///Users/casco/Development/memorias-migration-antigrativy/memorias-web/src/components/reusable/__tests__/ProjectSelector.test.tsx): Unit tests verifying related projects selector display, dates, and sorting.
- [src/components/reusable/__tests__/PublicationSelector.test.tsx](file:///Users/casco/Development/memorias-migration-antigrativy/memorias-web/src/components/reusable/__tests__/PublicationSelector.test.tsx): Unit tests verifying APA bold title citation formatting and year sorting.
- [tests/e2e/members.spec.ts](file:///Users/casco/Development/memorias-migration-antigrativy/memorias-web/tests/e2e/members.spec.ts): Playwright integration tests covering hero layouts and interactive checkbox parameters in the members directory.

---

## 3. Functionalities & Cases Covered

### MemberSelector
- **Default Filter**: Verifies the `"Hide former members"` checkbox is checked by default and filters out researchers who have a past `endDate`.
- **Alphabetical Sorting**: Asserts visible members are sorted alphabetically by `lastName`, then by `firstName`.
- **UX Guard (Selection Visibility)**: Verifies that if a former member is already selected, they remain visible in the list despite having a past `endDate` and the checkbox being checked (protecting existing connections from accidental loss).
- **Interactive Search**: Confirms typing a query in the text field filters elements dynamically.
- **State Selection**: Verifies clicking on elements correctly toggles selection checkboxes and triggers the parent `onChange` callback.
- **Layout Adaptability**: Validates structure under both `"grid"` and `"list"` modes.

### ProjectSelector
- **Sorting Logic**: Verifies projects are sorted descending by `endDate`. If end dates are equal, it sorts descending by `startDate`.
- **Detail Rendering**: Asserts director, co-director (if defined), and start/end dates render as clear timeline metadata.
- **No Slugs**: Confirms technical project slugs are excluded from display.
- **Interactive Filtering**: Asserts search input filters by project title or code.

### PublicationSelector
- **APA Citations**: Verifies that standard APA format citations render dynamically, with the publication's scientific title wrapped in bold (`<strong>`).
- **Year Sorting**: Confirms publications are sorted descending by publication year.

### Members Directory E2E
- **Hero & Semantics**: Asserts that `[data-component-semantics="Hero banner"]` and `[data-component-semantics="Hero title"]` render correctly with standard "Our Researchers" copy.
- **URL Search Parameters Sync**:
  - Verifies the `"Hide former members"` checkbox defaults to checked.
  - Clicking the checkbox to uncheck it appends `hideFormer=false` to the browser URL.
  - Clicking the checkbox again checks it and removes `hideFormer=false` from the browser URL, preserving state in the navigation history.

---

## 4. How to Run Tests

Ensure you are located inside the `memorias-web/` directory before executing commands.

### Running Component / Unit Tests
Execute the Vitest test suites once:
```bash
npm run test
```

Execute the Vitest test suites in interactive watch mode (automatically re-runs when files are modified):
```bash
npm run test:watch
```

### Running E2E Integration Tests
Execute the Playwright integration tests (automatically spins up Next.js dev server on port 3000, runs tests in headless Chromium, and shuts down the server):
```bash
npm run test:e2e
```

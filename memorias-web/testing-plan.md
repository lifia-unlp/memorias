# Testing Plan: memorias-web Automated Testing

This document outlines the strategy, architecture, and roadmap for establishing comprehensive automated testing in the `memorias-web` component.

---

## 1. Objectives

- **Type Safety & Runtime Correctness**: Ensure reusable UI elements render and behave consistently.
- **Regression Prevention**: Verify selection state changes, sorting strategies, and hide-former filtering constraints remain intact during feature iterations.
- **Robust Locators**: Leverage standard `data-component-semantics` annotations for selectors and page elements to keep tests decoupling from design shifts.

---

## 2. Test Architecture

### Phase 1: Component & Unit Testing (Fast, Headless)
- **Framework**: **Vitest** + **React Testing Library (RTL)** + **jsdom**
- **Target Components**: Reusable form selectors inside `src/components/reusable/`
- **Scenarios to Cover**:
  - `MemberSelector.tsx`:
    - Sorts members alphabetically by `lastName`, then `firstName`.
    - Includes `"Hide former members"` checkbox (checked by default).
    - Correctly filters out researchers with a past `endDate` if checked.
    - UX Guard: Always retains visibility of already-selected former members regardless of checkbox state.
  - `ProjectSelector.tsx`, `ScholarshipSelector.tsx`, `ThesisSelector.tsx`:
    - Sorts descending by `endDate`, then by `startDate`.
    - Renders layout types correctly (`layout="grid"` vs. `layout="list"`).
    - Hides slug display.
    - Displays detailed context fields (e.g. director, student name, timelines).
  - `PublicationSelector.tsx`:
    - Correctly renders APA citations using `formatAPA` client-side, making the title bold.
    - Sorts descending by publication `year`.

### Phase 2: End-to-End (E2E) Browser Integration Testing (Real Browsers)
- **Framework**: **Playwright**
- **Scenarios to Cover**:
  - Form submission flows for `ProjectForm`, `ThesisForm`, `ScholarshipForm`, `PublicationForm`.
  - Filter panel inputs (`MemberFilters`) updating search parameters, pagination, and hide-former checkbox states in the URL.
  - Core page dashboard layouts and semantic UI annotation coverage checks.

---

## 3. Implementation Roadmap (Phase 1)

1. **Environment Setup**:
   - Install `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@vitejs/plugin-react`, and `jsdom`.
   - Configure Vitest in `vitest.config.ts`.
   - Setup a custom environment initialization file `src/test/setup.ts` to extend Jest matcher assertions.
2. **Writing Component Tests**:
   - Write test suites under `src/components/reusable/__tests__/` or next to components.
3. **Execution**:
   - Add test runner scripts to `package.json` (`npm run test` and `npm run test:watch`).

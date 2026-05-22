# Component Semantics Annotation Rules

This application uses the HTML attribute `data-component-semantics` to identify meaningful UI components using a controlled vocabulary.

The purpose of this attribute is to let developers and agents refer to complete UI components by explicit, human-readable names such as `"Researcher profile card"`, `"Main menu"`, or `"List of papers"`.

## Purpose

Use `data-component-semantics` to mark meaningful UI components or regions of the interface.

The value describes what the component represents in the user interface. It is not a technical identifier, CSS selector, JavaScript hook, database field, or accessibility label.

## Allowed values

The value of `data-component-semantics` must come from the approved vocabulary defined at the end of this document.

Do not invent new values.

Do not rename existing values.

Do not use synonyms or near-equivalent alternatives unless the vocabulary has been explicitly updated.

## Scope of use

Apply `data-component-semantics` only to meaningful UI components or regions that users, developers, or agents may reasonably refer to as a whole.

Avoid using it on low-level visual or structural elements unless they are explicitly listed in the approved vocabulary.

The attribute identifies the semantic kind of component, not a unique instance.

The same value may appear multiple times when the same kind of component is repeated.

## Styling rule

Do not use `data-component-semantics` in CSS selectors.

Use classes, design-system tokens, or framework-specific styling mechanisms for styling.

## Behavior rule

Do not use `data-component-semantics` as a JavaScript behavior hook.

Use framework event handlers, component references, controller bindings, or explicit behavior-oriented attributes for functionality.

## Accessibility rule

Do not use `data-component-semantics` as a substitute for semantic HTML, headings, labels, or ARIA attributes.

Use proper HTML structure and accessibility attributes independently.

## Preservation rule

Agents and developers must preserve existing `data-component-semantics` attributes unless explicitly instructed to modify them.

When refactoring, restyling, reorganizing, or regenerating markup, do not remove, rename, or reinterpret these annotations.

## No inferred UI elements

Agents must not introduce new UI components, sections, fields, menus, filters, badges, labels, or actions merely because they seem useful.

The annotation must describe what is already present in the interface.

If a component exists and matches an approved vocabulary value, annotate it.

If no approved value applies, leave it unannotated and propose a vocabulary extension separately.

## Value format

Use exact, human-readable values with normal capitalization and spaces.

Do not use kebab-case, snake_case, camelCase, abbreviations, or technicalized names unless they are explicitly part of the approved vocabulary.

## Agent instructions

When modifying markup, agents must:

1. Preserve all existing `data-component-semantics` attributes.
2. Use only approved values.
3. Avoid inventing new component names.
4. Avoid using the attribute for styling, behavior, accessibility, or data binding.
5. Annotate only meaningful UI components or regions.
6. Leave unmatched components unannotated and propose vocabulary additions separately.
7. Preserve the terminology already present in the application.
8. Avoid introducing UI fields, labels, sections, filters, badges, or actions not already present.

## Developer instructions

When implementing or reviewing markup, developers must:

1. Treat `data-component-semantics` as semantic metadata only.
2. Keep styling concerns in classes or styling systems.
3. Keep behavior concerns in framework handlers, controller bindings, or explicit behavior attributes.
4. Keep accessibility concerns in semantic HTML and ARIA attributes.
5. Ensure every value used is present in the approved vocabulary.
6. Update the approved vocabulary before introducing a new value.

## Approved component semantics values

Add approved values below.

Each value should include:

- The exact value to use.
- A short explanation of when to use it.
- Any relevant boundary notes to avoid overlap with similar values.

### Main menu

The primary navigation menu of the application.

### Researcher profile card

A compact card-like component that presents the main identifying and descriptive information about a researcher.

### Hero banner

The full-width background container that spans the entire browser viewport width (100%), containing the linear gradient and responsive wave SVG background. 

### Hero title
The prominent, high-contrast typography heading (variant="h1") that represents the title of the page.

### Hero subtitle
The smaller, semi-transparent supporting narrative description text located below the title.

### Featured badge

A prominent high-contrast badge styled with the secondary accent color, highlighting special academic achievements or featured catalog elements (e.g., Featured Publication).

### Status badge

A color-coded state indicator representing completion milestones, dynamic percentages, or workflow progress (e.g., Thesis Progress, Thesis Completed).

### Metadata badge

A neutral, low-contrast badge displaying secondary technical facts, catalog identifiers, or tags (e.g., Publication Year, Thesis Level, Project Code) without drawing visual focus.

### Featured thesis

The compact card-like component presenting a featured thesis on the home page dashboard.

### Featured project

The compact card-like component presenting a featured research project on the home page dashboard.

### Featured publication

The compact card-like component presenting a featured scientific publication on the home page dashboard.

### Topic cloud

The TagCloud topic explorer widget on the home page dashboard that displays the dynamically sized research topics/tags.

### Member directory card

The card presenting identifying and descriptive details of an academic researcher within the members directory listing.

### Project directory card

The card presenting details of an investigation or research project within the projects directory listing.

### Thesis directory card

The card presenting metadata, students, directors, and progress status of an academic thesis within the theses directory listing.

### Publication directory card

The card presenting full HTML citation formatting, bibtex export actions, and metadata chips of a scientific publication within the publications directory listing.

### Scholarship directory card

The card presenting details of an academic scholarship (timeline, student, agency, director, and co-director) within the scholarships directory listing.

### Menubar

The primary application header container containing logo navigation links, main menu bar components, and the session control interface.

### Menubar logo

The brand logo navigation anchor on the left side of the main menu bar linking back to the homepage.

### Session button

The authentication status and action controller, displaying either a "Sign In" action link or the logged-in user profile avatar menu button.

### Relevant theses

The component presenting the list of theses related to a specific entity (such as a project, publication, or member).

### Relevant projects

The component presenting the list of research projects related to a specific entity (such as a scholarship, publication, thesis, or member).

### Relevant lab members

The component presenting the list of lab members related to a specific entity (such as a scholarship, publication, or thesis).

### Relevant scholarships

The component presenting the list of scholarships related to a specific entity (such as a project or member).

### Tag badge

A subtle color-coded badge displaying taxonomy keywords, research topics, or tags that help filter or categorize resources.

## Developer Tooling: Visual Semantic Highlights

To inspect or verify semantically annotated components in the browser during development, a non-intrusive hover highlight tool is available.

### Enabling Highlight Tooling

Add the following environment variable to your `.env.local` or `.env.development` configuration:

```env
NEXT_PUBLIC_HIGHLIGHT_SEMANTIC_COMPONENTS="true"
```

### Visual Effect

When enabled (and in a development environment):
- Any element carrying the `data-component-semantics` attribute will display a solid **2px red outline** (`#ef4444`) on mouse hover.
- A red text badge displaying the exact **semantic name** of the component will appear directly **above the top-left corner** of the outline box.
- The outline uses an inset offset (`outline-offset: -2px`) and temporary hover overflow visibility (`overflow: visible !important`) to ensure the outline and label are fully visible without causing any layout shifting or reflow of surrounding elements.
- The default mouse cursor is preserved to avoid interfering with application behavior.
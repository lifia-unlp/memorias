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

### HeroTitle
The prominent, high-contrast typography heading (variant="h1") that represents the title of the page.

### HeroSubtitle
The smaller, semi-transparent supporting narrative description text located below the title.
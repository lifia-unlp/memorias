# Plan: Material UI Mockup and Migration Guide

Build a static Material Design mockup in `memorias-mui-mockup` that captures the portal's major screen families and reusable shell patterns, then turn that into a concise migration guide for the AI agent that will later replace Tailwind in `memorias-web` with MUI.

The mockup must represent the existing application faithfully. It must not invent new entities, fields, menu labels, section names, forms, actions, or terminology. It should capture and reorganize what already exists, using a lighter Material-oriented presentation that supports reading, browsing, and understanding the research portal.

## Steps

1. Audit the current UI surface and lock the mockup coverage to the major route families. Use the shared shell and representative screens as anchors: root layout, header, footer, home dashboard, entity list/detail/create/edit patterns, reports, admin, auth, preferences, about, and pending-activation. Depends on the discovery already done.

2. Capture the existing information model before designing. For each representative screen, identify the actual data elements, fields, labels, menu entries, section titles, actions, filters, and form inputs already present in the application. Do not introduce new data elements or rename existing ones unless the current application already uses those names.

3. Define the mockup architecture in `memorias-mui-mockup` as a static, responsive, semantic HTML plus centralized CSS prototype. Keep it framework-agnostic, no Tailwind, no inline styles, no iconography, and no page-specific styling unless unavoidable. Model the reusable patterns explicitly: app shell, navigation, cards, tables/lists, forms, filters, empty/error states, dense admin layouts, and interactive workspace layouts.

4. Translate the current visual language into Material-oriented design tokens and reusable components. Preserve the portal's established brand colors and information density, but express them through MUI-friendly concepts: theme palette, typography scale, spacing, surface/elevation, button hierarchy, input states, responsive breakpoints, and card/list/table variants.

5. Favor a lightweight, editorial design. The portal should feel informative and invite reading, not like an overloaded dashboard. Use whitespace, hierarchy, typography, and clear grouping to improve comprehension. Avoid excessive decoration, heavy surfaces, unnecessary color blocks, and visual noise.

6. Use badges, labels, chips, and pills sparingly. They are acceptable only when they clarify status, category, role, type, visibility, or another compact classification already present in the application. Do not use badges as decorative elements or to compensate for weak layout hierarchy.

7. Preserve existing terminology. Menu labels, section names, entity names, field labels, action names, and form labels must come from the current application. Do not invent friendlier or alternative names in the mockup. If a label appears inconsistent in the existing app, document the inconsistency instead of silently renaming it.

8. Preserve existing data scope. Mockup screens may use placeholder values, but only for fields and entities that already exist in the application. Do not add new profile attributes, project metadata, publication fields, report dimensions, filters, workflow states, or admin controls unless they are already visible or clearly implemented in the current app.

9. Finalize a migration guide document in the mockup folder that becomes the AI agent handoff. Merge the existing `mockup-rules.md` into a more complete brief that includes scope, non-goals, screen inventory, component mapping, token rules, layout priorities, accessibility expectations, responsive behavior, terminology constraints, data-element constraints, badge/chip usage rules, and the intended migration order for removing Tailwind from `memorias-web`.

10. Add a validation pass that compares the mockup and guide against the current app structure. Confirm that every major route family has a place in the mockup, that no invented data elements or terminology were introduced, that badges are used only when justified, that the design remains lightweight and reading-oriented, and that the mockup is easy to translate into MUI components and a centralized theme.
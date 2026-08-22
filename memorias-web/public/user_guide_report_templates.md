# User Guide: Customizing Report Block Templates

The **Report Builder** in MEMORIAS allows you to customize exactly how each element (*Projects*, *Publications*, *Scholarships*, *Theses*) is rendered. By default, items are formatted using standard templates, but you can edit the block's template to change labels, select which properties to display, reorder attributes, or translate the report into any language (e.g. Spanish).

---

## 1. How Templates Work

Every data block (`projects`, `publications`, `scholarships`, `theses`) in the Report Builder includes a **Block Rendering Template** editor field:

- **Automatic Fallback**: If you do not edit the template, the default template is used automatically.
- **Live Preview**: Any change you make in the template box is rendered in real time on the A4 page preview.
- **Reset Button**: Click **"Reset Default Template"** at any time to restore the original format.

---

## 2. Template Syntax Quick Reference

The template engine uses a simple syntax:

### A. Displaying Properties
To display an element property, enclose its name in double curly braces: `{{propertyName}}`.

Example:
```handlebars
Title: {{title}}
```

### B. Conditional Content (`{{#if}}`)
To render a section only when a property exists and is not empty, wrap it in an `{{#if propertyName}} ... {{/if}}` block.

Example:
```handlebars
{{#if director}}
Director: {{director}}
{{/if}}
```

### C. Date Formatting (`{{date}}` Helper)
Dates (`startDate`, `endDate`) can be formatted using custom date pattern strings (such as `MM/YYYY`, `DD/MM/YYYY`, or `YYYY`):

Example:
```handlebars
Active from {{date startDate "MM/YYYY"}}{{#if endDate}} to {{date endDate "MM/YYYY"}}{{else}} (Ongoing){{/if}}
```

---

## 3. Available Variables by Block Type

### 📁 Projects (`projects`)
- `{{title}}`: Project title.
- `{{code}}`: Project internal code.
- `{{startDate}}` / `{{endDate}}`: Raw ISO start and end dates.
- `{{startYear}}` / `{{endYear}}`: Extracted four-digit years.
- `{{director}}`: Project director name.
- `{{coDirector}}`: Project co-director name.
- `{{responsibleGroup}}`: Responsible research group or lab.
- `{{fundingAgency}}`: Funding agency (e.g. CONICET, CIC, UNLP).
- `{{amount}}`: Project grant amount.
- `{{summary}}`: Project summary/description.
- `{{website}}`: External project website URL.
- `{{tags}}`: Taxonomy tags assigned to the project.

### 📚 Publications (`publications`)
- `{{{citationHtml}}}`: Complete pre-formatted CSL bibliographic citation (APA, Vancouver, Harvard, etc., based on block style selection). Note: Use triple braces `{{{` to allow HTML rendering.
- `{{selfArchivingUrl}}`: Institutional repository / open-access self-archiving link.
- `{{abstract}}`: Publication abstract text.
- `{{ranking}}`: Journal or conference ranking (e.g., SJR Q1, CORE A*).
- `{{journal}}`: Journal name (if available).
- `{{publisher}}`: Publisher name.
- `{{doi}}`: Digital Object Identifier.
- `{{title}}`, `{{year}}`, `{{authors}}`: Core publication metadata.
- `{{tags}}`: Assigned tags.

### 🎓 Scholarships (`scholarships`)
- `{{title}}`: Scholarship project or grant title.
- `{{type}}`: Scholarship type (e.g. Doctoral, Master, Undergraduate).
- `{{startDate}}` / `{{endDate}}` / `{{startYear}}` / `{{endYear}}`: Duration.
- `{{student}}`: Awarded student name.
- `{{director}}`: Director.
- `{{coDirector}}`: Co-Director.
- `{{fundingAgency}}`: Funding agency.
- `{{summary}}`: Grant summary.
- `{{tags}}`: Assigned tags.

### 📜 Theses (`theses`)
- `{{title}}`: Thesis title.
- `{{level}}`: Academic level (e.g. Grade, Master, PhD).
- `{{career}}`: Academic degree/career program.
- `{{startDate}}` / `{{endDate}}` / `{{startYear}}` / `{{endYear}}`: Execution period.
- `{{student}}`: Student / Author name.
- `{{director}}`: Director.
- `{{coDirector}}`: Co-Director.
- `{{otherAdvisors}}`: Other advisors/committee members.
- `{{progress}}`: Percentage of completion (e.g. `80`).
- `{{summary}}`: Thesis abstract/summary.
- `{{reportUrl}}`: Download URL for final report/PDF.
- `{{website}}`: Related thesis website URL.
- `{{keywords}}`: Free-text keywords.
- `{{tags}}`: Assigned tags.

---

## 4. Practical Examples

### Example A: Spanish Project Report
```handlebars
### {{title}}{{#if code}} (Código: {{code}}){{/if}}
Período: {{date startDate "MM/YYYY"}}{{#if endDate}} a {{date endDate "MM/YYYY"}}{{else}} (En ejecución){{/if}}{{#if director}}, Dirigido por: {{director}}{{/if}}{{#if coDirector}}, Co-Director: {{coDirector}}{{/if}}{{#if fundingAgency}}, Financiado por: {{fundingAgency}}{{/if}}{{#if amount}} (Monto: {{amount}}){{/if}}.
{{#if summary}}
*Resumen:* {{summary}}
{{/if}}
{{#if website}}
[Sitio Web del Proyecto]({{website}})
{{/if}}
```

### Example B: Publication with Repository Link & Ranking
```handlebars
{{{citationHtml}}}
{{#if ranking}}
*Clasificación:* {{ranking}}
{{/if}}
{{#if selfArchivingUrl}}
[Acceso Abierto en Repositorio]({{selfArchivingUrl}})
{{/if}}
{{#if abstract}}
*Resumen:* {{abstract}}
{{/if}}
```

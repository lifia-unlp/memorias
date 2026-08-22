export function formatDatePattern(
  dateInput?: string | Date | null,
  pattern: string = "MM/YYYY",
  fallback: string = "N/D"
): string {
  if (!dateInput) return fallback;
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return fallback;

  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year = String(d.getUTCFullYear());

  return pattern
    .replace("YYYY", year)
    .replace("YY", year.slice(-2))
    .replace("MM", month)
    .replace("DD", day);
}

export function renderTemplate(templateStr: string, data: Record<string, any>): string {
  if (!templateStr) return "";

  let result = templateStr;

  // 1. Process helpers: {{date variable "PATTERN"}}
  result = result.replace(/\{\{date\s+([a-zA-Z0-9_]+)(?:\s+"([^"]+)")?\}\}/g, (_, key, pattern) => {
    const val = data[key];
    return formatDatePattern(val, pattern || "MM/YYYY");
  });

  // 2. Process conditionals: {{#if variable}}thenContent{{else}}elseContent{{/if}}
  const processConditionals = (input: string): string => {
    return input.replace(
      /\{\{#if\s+([a-zA-Z0-9_]+)\}\}([\s\S]*?)(?:\{\{else\}\}([\s\S]*?))?\{\{\/if\}\}/g,
      (_, key, thenClause, elseClause = "") => {
        const val = data[key];
        const isTruthy =
          Boolean(val) &&
          val !== "N/A" &&
          val !== "N/D" &&
          (Array.isArray(val) ? val.length > 0 : true);

        return processConditionals(isTruthy ? thenClause : elseClause);
      }
    );
  };

  result = processConditionals(result);

  // 3. Process raw HTML variables: {{{variable}}}
  result = result.replace(/\{\{\{([a-zA-Z0-9_]+)\}\}\}/g, (_, key) => {
    const val = data[key];
    return val !== undefined && val !== null ? String(val) : "";
  });

  // 4. Process standard variables: {{variable}}
  result = result.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (_, key) => {
    const val = data[key];
    if (Array.isArray(val)) {
      return val.join(", ");
    }
    return val !== undefined && val !== null ? String(val) : "";
  });

  // 5. Clean up redundant spaces
  return result
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .join("\n")
    .trim();
}

export const DEFAULT_PROJECT_TEMPLATE = `### {{title}}{{#if code}} (Code: {{code}}){{/if}}
Active from {{date startDate "MM/YYYY"}}{{#if endDate}} to {{date endDate "MM/YYYY"}}{{else}} (Ongoing){{/if}}{{#if director}}, directed by {{director}}{{/if}}{{#if coDirector}}, with Co-Director {{coDirector}}{{/if}}{{#if responsibleGroup}}, under responsible group {{responsibleGroup}}{{/if}}{{#if fundingAgency}}, with funding provided by {{fundingAgency}}{{/if}}{{#if amount}} (amount: {{amount}}){{/if}}.
{{#if summary}}
*Summary:* {{summary}}
{{/if}}
{{#if website}}
[Website]({{website}})
{{/if}}`;

export const DEFAULT_PUBLICATION_TEMPLATE = `{{{citationHtml}}}
{{#if selfArchivingUrl}}
[Repository / Self-archiving]({{selfArchivingUrl}})
{{/if}}
{{#if abstract}}
*Abstract:* {{abstract}}
{{/if}}`;

export const DEFAULT_SCHOLARSHIP_TEMPLATE = `### {{title}}{{#if type}} ({{type}}){{/if}}
Scholarship active from {{date startDate "MM/YYYY"}}{{#if endDate}} to {{date endDate "MM/YYYY"}}{{else}} (Ongoing){{/if}}{{#if student}}, awarded to student {{student}}{{/if}}{{#if director}}, directed by {{director}}{{/if}}{{#if coDirector}}, with Co-Director {{coDirector}}{{/if}}{{#if fundingAgency}}, with funding provided by {{fundingAgency}}{{/if}}.
{{#if summary}}
*Summary:* {{summary}}
{{/if}}`;

export const DEFAULT_THESIS_TEMPLATE = `### {{title}}{{#if level}} ({{level}}){{/if}}
Thesis{{#if career}} for career {{career}}{{/if}} active from {{date startDate "MM/YYYY"}}{{#if endDate}} to {{date endDate "MM/YYYY"}}{{else}} (Ongoing){{/if}}{{#if student}}, with student {{student}}{{/if}}{{#if director}}, directed by {{director}}{{/if}}{{#if coDirector}}, with Co-Director {{coDirector}}{{/if}}{{#if otherAdvisors}}, and advisors {{otherAdvisors}}{{/if}}{{#if progress}}, progress: {{progress}}%{{/if}}.
{{#if summary}}
*Summary:* {{summary}}
{{/if}}
{{#if reportUrl}}
[Thesis Report]({{reportUrl}})
{{/if}}
{{#if website}}
[Website]({{website}})
{{/if}}`;

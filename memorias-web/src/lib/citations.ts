// @ts-ignore
import Cite from "citation-js";
import { formatAPA, jsonToBibtex, getBibtexString } from "./bibtex";

export interface FormattedCitation {
  html: string;
  text: string;
}

export const SUPPORTED_STYLES = [
  { value: "apa", label: "APA (7th Edition)" },
  { value: "vancouver", label: "Vancouver Style" },
  { value: "harvard", label: "Harvard Style" },
  { value: "bibtex", label: "BibTeX Format" },
  { value: "ris", label: "RIS Format" },
];

export function formatCitation(pb: any, style: string = "apa"): FormattedCitation {
  const isRaw = !pb.bibtexData || 
                typeof pb.bibtexData !== "object" || 
                Object.keys(pb.bibtexData).length === 0 || 
                pb.bibtexData.raw === true || 
                pb.authors === "Raw Reference";

  if (isRaw) {
    const cleanTitle = (pb.title || "").trim();
    if (style === "bibtex") {
      const rawText = jsonToBibtex(pb);
      return {
        html: `<pre class="font-mono text-[11px] leading-relaxed p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto text-slate-700 dark:text-slate-350 select-all">${rawText}</pre>`,
        text: rawText,
      };
    }
    if (style === "ris") {
      const citationKey = pb.slug || "citation";
      const rawText = `TY  - GEN\nID  - ${citationKey}\nTI  - ${cleanTitle}\nAU  - Raw Reference\nPY  - ${pb.year || ""}\nER  -`;
      return {
        html: `<pre class="font-mono text-[11px] leading-relaxed p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto text-slate-700 dark:text-slate-350 select-all">${rawText}</pre>`,
        text: rawText,
      };
    }
    return {
      html: cleanTitle,
      text: cleanTitle,
    };
  }

  const bibtexString = jsonToBibtex(pb);
  
  // Clean plain-text citation backup using our own APA algorithm
  const backupApa = formatAPA(pb);
  const doi = getBibtexString(pb.bibtexData?.entryTags?.doi || pb.bibtexData?.entryTags?.DOI || "");

  try {
    if (!bibtexString) {
      return { html: backupApa, text: backupApa.replace(/<[^>]*>/g, "") };
    }

    const cite = new Cite(bibtexString);

    if (style === "bibtex") {
      const rawText = cite.format("bibtex") || bibtexString;
      return {
        html: `<pre class="font-mono text-[11px] leading-relaxed p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto text-slate-700 dark:text-slate-350 select-all">${rawText}</pre>`,
        text: rawText,
      };
    }

    if (style === "ris") {
      const rawText = cite.format("ris") || "";
      return {
        html: `<pre class="font-mono text-[11px] leading-relaxed p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto text-slate-700 dark:text-slate-350 select-all">${rawText}</pre>`,
        text: rawText,
      };
    }

    // Determine CSL template
    let template = "apa";
    if (style === "vancouver") template = "vancouver";
    else if (style === "harvard") template = "harvard1";

    // Format CSL (HTML output)
    let formattedHtml = cite.format("bibliography", {
      format: "html",
      template: template,
      lang: "en-US",
    }) || "";

    // Clean up CSL wrappers if present
    formattedHtml = formattedHtml.replace(/<div[^>]*csl-bib-body[^>]*>/i, "").replace(/<\/div>\s*$/i, "");
    formattedHtml = formattedHtml.replace(/<div[^>]*csl-entry[^>]*>/i, "").replace(/<\/div>\s*$/i, "");
    formattedHtml = formattedHtml.trim();

    // If DOI is present, append it as a premium link at the end of the HTML representation
    if (doi) {
      let doiUrl = doi.trim();
      if (!doiUrl.startsWith("http")) {
        doiUrl = `https://doi.org/${doiUrl}`;
      }
      const doiLink = ` DOI: <a href="${doiUrl}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-mono text-[11px] ml-1">${doiUrl}</a>`;
      formattedHtml += doiLink;
    }

    // Generate plain-text representation (without HTML tags) for copying
    const plainText = formattedHtml.replace(/<[^>]*>/g, "").trim();

    return {
      html: formattedHtml || backupApa,
      text: plainText || backupApa.replace(/<[^>]*>/g, "").trim(),
    };
  } catch (err) {
    // Graceful fallback to custom APA layout
    return {
      html: backupApa,
      text: backupApa.replace(/<[^>]*>/g, "").trim(),
    };
  }
}

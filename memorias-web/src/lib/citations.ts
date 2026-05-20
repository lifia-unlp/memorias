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

    // If DOI is present, cleanly linkify it in-place or append it
    if (doi) {
      const trimmedDoi = doi.trim();
      let doiUrl = trimmedDoi;
      if (!doiUrl.startsWith("http")) {
        doiUrl = `https://doi.org/${doiUrl}`;
      }

      // Check if it is already a link in the CSL HTML
      const isAlreadyLinked = formattedHtml.includes("href=") && formattedHtml.includes(trimmedDoi);

      if (!isAlreadyLinked) {
        const urlPattern = `https://doi.org/${trimmedDoi}`;
        const httpUrlPattern = `http://doi.org/${trimmedDoi}`;
        const prefixPattern = `doi:${trimmedDoi}`;

        const htmlLower = formattedHtml.toLowerCase();
        
        if (htmlLower.includes(urlPattern.toLowerCase())) {
          const idx = htmlLower.indexOf(urlPattern.toLowerCase());
          const originalText = formattedHtml.substring(idx, idx + urlPattern.length);
          formattedHtml = formattedHtml.substring(0, idx) + 
                          `<a href="${doiUrl}" target="_blank" rel="noopener noreferrer" class="hover:underline text-primary">${originalText}</a>` + 
                          formattedHtml.substring(idx + urlPattern.length);
        } else if (htmlLower.includes(httpUrlPattern.toLowerCase())) {
          const idx = htmlLower.indexOf(httpUrlPattern.toLowerCase());
          const originalText = formattedHtml.substring(idx, idx + httpUrlPattern.length);
          formattedHtml = formattedHtml.substring(0, idx) + 
                          `<a href="${doiUrl}" target="_blank" rel="noopener noreferrer" class="hover:underline text-primary">${originalText}</a>` + 
                          formattedHtml.substring(idx + httpUrlPattern.length);
        } else if (htmlLower.includes(prefixPattern.toLowerCase())) {
          const idx = htmlLower.indexOf(prefixPattern.toLowerCase());
          const originalText = formattedHtml.substring(idx, idx + prefixPattern.length);
          formattedHtml = formattedHtml.substring(0, idx) + 
                          `<a href="${doiUrl}" target="_blank" rel="noopener noreferrer" class="hover:underline text-primary">${originalText}</a>` + 
                          formattedHtml.substring(idx + prefixPattern.length);
        } else if (htmlLower.includes(trimmedDoi.toLowerCase())) {
          const idx = htmlLower.indexOf(trimmedDoi.toLowerCase());
          const precedingChar = idx > 0 ? formattedHtml.charAt(idx - 1) : "";
          if (precedingChar !== '"' && precedingChar !== "'" && precedingChar !== "=" && precedingChar !== "/") {
            const originalText = formattedHtml.substring(idx, idx + trimmedDoi.length);
            formattedHtml = formattedHtml.substring(0, idx) + 
                            `<a href="${doiUrl}" target="_blank" rel="noopener noreferrer" class="hover:underline text-primary">${originalText}</a>` + 
                            formattedHtml.substring(idx + trimmedDoi.length);
          }
        } else {
          // CSL didn't output the DOI at all; append it as a link using the same font
          const doiLink = ` DOI: <a href="${doiUrl}" target="_blank" rel="noopener noreferrer" class="hover:underline text-primary">${trimmedDoi}</a>`;
          formattedHtml += doiLink;
        }
      }
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

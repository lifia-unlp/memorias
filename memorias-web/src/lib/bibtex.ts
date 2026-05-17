export function getBibtexString(val: any): string {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "number") return String(val);
  if (Array.isArray(val)) {
    return val.map(getBibtexString).join(" ");
  }
  if (typeof val === "object") {
    if (val.value !== undefined) {
      return getBibtexString(val.value);
    }
    return getBibtexString(val.text || val.name || val.label || JSON.stringify(val));
  }
  return String(val);
}

export function formatAPA(pb: any): string {
  try {
    const bib = pb.bibtexData;
    if (!bib || typeof bib !== "object") {
      return `${pb.authors}. (${pb.year}). ${pb.title}.`;
    }

    const tags = (bib as any).entryTags || (bib as any).tags || bib;
    
    let authorsStr = pb.authors || getBibtexString(tags.author) || getBibtexString(tags.authors) || "";
    if (authorsStr) {
      const authorList = authorsStr.split(/\s+and\s+/i);
      const formattedAuthors = authorList.map((auth: string) => {
        const parts = auth.trim().split(",");
        if (parts.length === 2) {
          const last = parts[0].trim();
          const firstParts = parts[1].trim().split(/\s+/);
          const initials = firstParts.map(f => `${f.charAt(0).toUpperCase()}.`).join(" ");
          return `${last}, ${initials}`;
        } else {
          const names = auth.trim().split(/\s+/);
          if (names.length > 1) {
            const last = names[names.length - 1];
            const firstInitials = names.slice(0, names.length - 1).map(n => `${n.charAt(0).toUpperCase()}.`).join(" ");
            return `${last}, ${firstInitials}`;
          }
          return auth.trim();
        }
      });
      
      if (formattedAuthors.length > 1) {
        const lastAuth = formattedAuthors.pop();
        authorsStr = `${formattedAuthors.join(", ")} & ${lastAuth}`;
      } else {
        authorsStr = formattedAuthors[0] || "";
      }
    }

    const title = getBibtexString(tags.title) || pb.title || "";
    const year = getBibtexString(tags.year) || pb.year || "";
    const entryType = getBibtexString((bib as any).entryType || (bib as any).type || pb.type || "").toLowerCase();

    let citation = `${authorsStr} (${year}). ${title}. `;

    if (entryType === "article") {
      const journal = getBibtexString(tags.journal) || getBibtexString(tags.journaltitle) || "";
      const volume = getBibtexString(tags.volume) || "";
      const number = getBibtexString(tags.number) || "";
      const pages = getBibtexString(tags.pages) || "";
      if (journal) citation += `<em>${journal}</em>`;
      if (volume) citation += `, <em>${volume}</em>`;
      if (number) citation += `(${number})`;
      if (pages) citation += `, ${pages}`;
      citation += ".";
    } else if (entryType === "inproceedings" || entryType === "conference" || entryType === "inbook") {
      const booktitle = getBibtexString(tags.booktitle) || "";
      const pages = getBibtexString(tags.pages) || "";
      const publisher = getBibtexString(tags.publisher) || "";
      if (booktitle) citation += `In <em>${booktitle}</em>`;
      if (pages) citation += ` (pp. ${pages})`;
      if (publisher) citation += `. ${publisher}`;
      citation += ".";
    } else if (entryType === "book") {
      const publisher = getBibtexString(tags.publisher) || "";
      const address = getBibtexString(tags.address) || "";
      citation = `${authorsStr} (${year}). <em>${title}</em>. `;
      if (address) citation += `${address}: `;
      if (publisher) citation += `${publisher}.`;
    } else if (entryType === "phdthesis" || entryType === "mastersthesis") {
      const school = getBibtexString(tags.school) || "";
      const typeLabel = entryType === "phdthesis" ? "Doctoral dissertation" : "Master's thesis";
      citation += `(${typeLabel}, ${school}).`;
    } else {
      const howpublished = getBibtexString(tags.howpublished) || "";
      const note = getBibtexString(tags.note) || "";
      if (howpublished) citation += `${howpublished}. `;
      if (note) citation += `${note}.`;
    }

    const doi = getBibtexString(tags.doi) || getBibtexString(tags.DOI) || "";
    if (doi) {
      let doiUrl = doi.trim();
      if (!doiUrl.startsWith("http")) {
        doiUrl = `https://doi.org/${doiUrl}`;
      }
      citation += ` DOI: <a href="${doiUrl}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-mono text-xs">${doiUrl}</a>`;
    }

    return citation;
  } catch (err) {
    return `${pb.authors}. (${pb.year}). ${pb.title}.`;
  }
}

export function jsonToBibtex(pb: any): string {
  try {
    const bib = pb.bibtexData;
    if (!bib || typeof bib !== "object") return "";
    const citationKey = (bib as any).citationKey || (bib as any).key || pb.slug || "citation";
    const entryType = (bib as any).entryType || (bib as any).type || pb.type || "article";
    const tags = (bib as any).entryTags || (bib as any).tags || bib;
    
    let str = `@${entryType}{${citationKey},\n`;
    for (const [k, v] of Object.entries(tags)) {
      if (k !== "citationKey" && k !== "entryType" && k !== "tags" && k !== "entryTags") {
        const cleanVal = getBibtexString(v);
        str += `  ${k} = {${cleanVal}},\n`;
      }
    }
    str += `}`;
    return str;
  } catch (e) {
    return "";
  }
}

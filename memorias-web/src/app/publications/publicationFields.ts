export const BIBTEX_FIELDS_MAP: Record<string, { label: string; required: string[]; optional: string[] }> = {
  article: {
    label: "Article (Journal / Magazine)",
    required: ["journal", "volume"],
    optional: ["number", "pages", "month", "doi", "note", "key"],
  },
  book: {
    label: "Book / Monograph",
    required: ["publisher"],
    optional: ["editor", "volume", "number", "series", "address", "edition", "month", "note", "key", "url"],
  },
  inbook: {
    label: "Inbook (Part of a Book)",
    required: ["chapter", "pages", "publisher"],
    optional: ["editor", "volume", "number", "series", "type", "address", "edition", "month", "note", "key"],
  },
  incollection: {
    label: "Incollection (Book Chapter with Title)",
    required: ["booktitle", "publisher"],
    optional: ["editor", "volume", "number", "series", "type", "chapter", "pages", "address", "edition", "month", "note", "key"],
  },
  inproceedings: {
    label: "Inproceedings (Conference Article)",
    required: ["booktitle"],
    optional: ["editor", "volume", "number", "series", "pages", "address", "month", "organization", "publisher", "note", "key"],
  },
  manual: {
    label: "Manual (Technical Documentation)",
    required: [],
    optional: ["author", "organization", "address", "edition", "month", "year", "note", "key"],
  },
  mastersthesis: {
    label: "Master's Thesis",
    required: ["school"],
    optional: ["type", "address", "month", "note", "key"],
  },
  misc: {
    label: "Miscellaneous (Other)",
    required: [],
    optional: ["author", "howpublished", "month", "note", "key"],
  },
  phdthesis: {
    label: "PhD Thesis",
    required: ["school"],
    optional: ["type", "address", "month", "note", "key"],
  },
  proceedings: {
    label: "Proceedings (Conference)",
    required: [],
    optional: ["editor", "volume", "number", "series", "address", "month", "publisher", "organization", "note", "key"],
  },
  techreport: {
    label: "Technical Report",
    required: ["institution"],
    optional: ["type", "number", "address", "month", "note", "key"],
  },
  unpublished: {
    label: "Unpublished Manuscript",
    required: ["note"],
    optional: ["month", "key"],
  },
};

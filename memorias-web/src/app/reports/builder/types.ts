export interface Block {
  id: string;
  type: "markdown" | "publications" | "projects" | "scholarships" | "theses" | "genai";
  content?: string;
  filters: {
    memberIds: string[];
    types: string[];
    year: string;
    startYear: string;
    endYear: string;
    style: string; // apa, vancouver, harvard
    showSummary: boolean;
    tags?: string[];

    // GenAI specifics
    prompt?: string;
    maxLength?: number;
    inputBlockIds?: string[];
  };
  sort: {
    field: "year" | "title";
    direction: "asc" | "desc";
  };
  compiledItems: any[];
  isGenerating?: boolean;
  lastGeneratedConfig?: {
    prompt: string;
    maxLength: number;
    inputBlockIds: string[];
    inputContent: string;
  };
}

export interface InitData {
  members: Array<{ id: string; firstName: string; lastName: string; slug: string }>;
  publicationYears: number[];
  publicationTypes: string[];
  scholarshipTypes: string[];
  thesisLevels: string[];
  tags: string[];
}

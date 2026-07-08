import { sanitizeTag } from "@/lib/tags-sanitize";

// Base helpers for FormData parsing
export const getString = (formData: FormData, key: string): string | null => {
  const val = formData.get(key);
  if (typeof val !== "string") return null;
  const trimmed = val.trim();
  return trimmed || null;
};

export const getRequiredString = (formData: FormData, key: string, fieldName: string): string => {
  const val = getString(formData, key);
  if (!val) {
    throw new Error(`${fieldName} is required.`);
  }
  return val;
};

export const getDate = (formData: FormData, key: string): Date | null => {
  const val = getString(formData, key);
  return val ? new Date(val) : null;
};

export const getBoolean = (formData: FormData, key: string): boolean => {
  return formData.get(key) === "true";
};

export const getInt = (formData: FormData, key: string): number | null => {
  const val = getString(formData, key);
  if (!val) return null;
  const parsed = parseInt(val, 10);
  return isNaN(parsed) ? null : parsed;
};

export const getTags = (formData: FormData, key: string = "tags"): string[] => {
  const val = getString(formData, key);
  if (!val) return [];
  return val
    .split(",")
    .map((t) => sanitizeTag(t))
    .filter(Boolean);
};

export const getArray = (formData: FormData, key: string): string[] => {
  return (formData.getAll(key) as string[]) || [];
};

// Entity Specific Mappers
export const parseMemberFormData = (formData: FormData, requireSlug = false) => {
  const firstName = getRequiredString(formData, "firstName", "First Name");
  const lastName = getRequiredString(formData, "lastName", "Last Name");
  const slug = getString(formData, "slug");
  if (requireSlug && !slug) {
    throw new Error("Slug is required.");
  }

  return {
    firstName,
    lastName,
    slug: slug || undefined,
    startDate: getDate(formData, "startDate"),
    endDate: getDate(formData, "endDate"),
    highestDegree: getString(formData, "highestDegree"),
    coursesAtUNLP: getString(formData, "coursesAtUNLP"),
    positionAtLab: getString(formData, "positionAtLab"),
    positionAtUnlp: getString(formData, "positionAtUnlp"),
    category: getString(formData, "category"),
    sicadiCategory: getString(formData, "sicadiCategory"),
    positionAtCIC: getString(formData, "positionAtCIC"),
    positionAtCONICET: getString(formData, "positionAtCONICET"),
    personalEmail: getString(formData, "personalEmail"),
    institutionalEmail: getString(formData, "institutionalEmail"),
    phone: getString(formData, "phone"),
    webPage: getString(formData, "webPage"),
    orcid: getString(formData, "orcid"),
    dblpProfile: getString(formData, "dblpProfile"),
    googleResearchProfile: getString(formData, "googleResearchProfile"),
    researchGateProfile: getString(formData, "researchGateProfile"),
    shortCvInSpanish: getString(formData, "shortCvInSpanish"),
    shortCvInEnglish: getString(formData, "shortCvInEnglish"),
    interestsInEnglish: getString(formData, "interestsInEnglish"),
    interestsInSpanish: getString(formData, "interestsInSpanish"),
    affiliations: getString(formData, "affiliations"),
    notes: getString(formData, "notes"),
    avatarUrl: getString(formData, "avatarUrl"),
    tags: getTags(formData),
  };
};

export const parseProjectFormData = (formData: FormData) => {
  const title = getRequiredString(formData, "title", "Project Title");
  const startDateStr = getString(formData, "startDate");
  const endDateStr = getString(formData, "endDate");
  if (!startDateStr || !endDateStr) {
    throw new Error("Start Date and End Date are required fields.");
  }

  return {
    title,
    slug: getString(formData, "slug") || undefined,
    code: getString(formData, "code"),
    startDate: new Date(startDateStr),
    endDate: new Date(endDateStr),
    director: getString(formData, "director"),
    coDirector: getString(formData, "coDirector"),
    responsibleGroup: getString(formData, "responsibleGroup"),
    fundingAgency: getString(formData, "fundingAgency"),
    amount: getString(formData, "amount"),
    summary: getString(formData, "summary"),
    website: getString(formData, "website"),
    featured: getBoolean(formData, "featured"),
    tags: getTags(formData),
    members: getArray(formData, "members"),
  };
};

export const parseThesisFormData = (formData: FormData) => {
  const title = getRequiredString(formData, "title", "Thesis Title");

  return {
    title,
    slug: getString(formData, "slug") || undefined,
    career: getString(formData, "career"),
    level: getString(formData, "level"),
    student: getString(formData, "student"),
    director: getString(formData, "director"),
    coDirector: getString(formData, "coDirector"),
    otherAdvisors: getString(formData, "otherAdvisors"),
    startDate: getDate(formData, "startDate"),
    endDate: getDate(formData, "endDate"),
    summary: getString(formData, "summary"),
    reportUrl: getString(formData, "reportUrl"),
    progress: getInt(formData, "progress"),
    keywords: getString(formData, "keywords"),
    website: getString(formData, "website"),
    featured: getBoolean(formData, "featured"),
    tags: getTags(formData),
    members: getArray(formData, "members"),
    projects: getArray(formData, "projects"),
    publications: getArray(formData, "publications"),
    scholarships: getArray(formData, "scholarships"),
  };
};

export const parseScholarshipFormData = (formData: FormData) => {
  const title = getRequiredString(formData, "title", "Scholarship Title");

  return {
    title,
    slug: getString(formData, "slug") || undefined,
    type: getString(formData, "type"),
    student: getString(formData, "student"),
    director: getString(formData, "director"),
    coDirector: getString(formData, "coDirector"),
    fundingAgency: getString(formData, "fundingAgency"),
    startDate: getDate(formData, "startDate"),
    endDate: getDate(formData, "endDate"),
    summary: getString(formData, "summary"),
    tags: getTags(formData),
    members: getArray(formData, "members"),
    projects: getArray(formData, "projects"),
    theses: getArray(formData, "theses"),
  };
};

import { tagService, sanitizeTag } from "./services/tagService";

export { sanitizeTag };

export const getAllTagsWithCounts = tagService.getAllTagsWithCounts;
export const getPopularTags = tagService.getPopularTags;
export const getDistinctTags = tagService.getDistinctTags;

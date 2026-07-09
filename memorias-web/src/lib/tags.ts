import { tagService } from "./services/tagService";
import { sanitizeTag } from "./tags-sanitize";

export { sanitizeTag };

export const getAllTagsWithCounts = tagService.getAllTagsWithCounts;
export const getPopularTags = tagService.getPopularTags;
export const getDistinctTags = tagService.getDistinctTags;

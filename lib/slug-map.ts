import { siteStrings } from './translations'; // Import siteStrings which now includes slugs
import type { SubcategoryKey } from './slug-definitions'; // Import SubcategoryKey
// import { LANG_CONFIGS } from '../data_config'; // Cannot directly import Python files

// The authoritative slugs are now in lib/slug-definitions.ts and accessed via siteStrings.
// This file consumes them and provides helper functions.

// Category Slugs from translations (now global/English-based)
export const categorySlugs = siteStrings.slugs.parentCategories;

export type CategorySlug = typeof categorySlugs[keyof typeof categorySlugs];
export type ParentCategoryKey = keyof typeof categorySlugs; // English keys

// Generate reverse map for category slugs
const tempSlugToCategoryKey: Record<string, string> = {};
for (const key in categorySlugs) {
  if (Object.prototype.hasOwnProperty.call(categorySlugs, key)) {
    // Assert key as ParentCategoryKey before using it to index categorySlugs
    tempSlugToCategoryKey[categorySlugs[key as ParentCategoryKey]] = key;
  }
}
export const slugToCategoryKey = tempSlugToCategoryKey as Record<CategorySlug, ParentCategoryKey>;

// Subcategory Slugs from translations (now global/English-based)
// Mapping from English subcategory key to its global/English slug
export const subcategoryKeyToSlugMap = siteStrings.slugs.subcategories;

// Automatically create the reverse map: Global Subcategory Slug -> English Subcategory Key
export const subcategorySlugToKeyMap: Record<string, string> = {};
for (const [key, slug] of Object.entries(subcategoryKeyToSlugMap)) {
  if (slug) { 
    subcategorySlugToKeyMap[slug] = key;
  }
}

// For Sitemap and potentially other uses if you define the parent-child relationships:
export const PARENT_CATEGORY_KEYS: Array<ParentCategoryKey> = Object.keys(categorySlugs) as Array<ParentCategoryKey>;

// If your sitemap or other logic needs the SUBCATEGORIES_BY_PARENT_KEY structure:
// You might need to replicate or derive it here if it's used by frontend code.
// Example (ensure keys match SUBCATEGORIES_EN from data_config.py):
// export const SUBCATEGORIES_BY_PARENT_KEY: Record<ParentCategoryKey, string[]> = {
//   groups: ['amateur', 'hot', /* add all EN keys of subcategories under groups */ ],
//   channels: ['porn', /* ... */ ],
//   videos: [ /* ... */ ],
//   chat: [ /* ... */ ],
// }; 

// Helper function to get a subcategory's full path
export function getSubcategoryLocalizedPath(subcategoryKey: SubcategoryKey, parentCategoryKey?: ParentCategoryKey): string | undefined {
  const subSlug = subcategoryKeyToSlugMap[subcategoryKey];
  if (!subSlug) {
    console.warn(`[slug-map] Subcategory slug not found for key: ${subcategoryKey}`);
    return undefined;
  }

  if (parentCategoryKey) {
    const parentSlug = categorySlugs[parentCategoryKey as keyof typeof categorySlugs]; // Type assertion
    if (!parentSlug) { 
      console.warn(`[slug-map] Parent category slug not found for key: ${parentCategoryKey}`);
      return undefined; 
    }
    return `/${parentSlug}/${subSlug}`;
  }
  
  // Fallback if parentCategoryKey is not provided. 
  // This assumes subcategory slugs are globally unique or the context implies a root path.
  // console.warn(`[slug-map] getSubcategoryLocalizedPath called for '${subcategoryKey}' without parentCategoryKey. Returning root-relative sub-slug path.`);
  return `/${subSlug}`;
}

export function getParentCategoryLocalizedPath(parentCategoryKey: ParentCategoryKey): string | undefined {
    const parentSlug = categorySlugs[parentCategoryKey as keyof typeof categorySlugs]; // Type assertion
    if (!parentSlug) {
      console.warn(`[slug-map] Parent category slug not found for key: ${parentCategoryKey}`);
      return undefined;
    }
    return `/${parentSlug}`;
}

/**
 * IMPORTANT:
 * The primary source of truth for slug values is `lib/slug-definitions.ts`.
 * 
 * `lib/translations.ts` imports slugs from `lib/slug-definitions.ts` and makes them available 
 * to the frontend via `siteStrings.slugs`.
 * 
 * The Python backend configuration (`data_config.py`) also dynamically loads slug definitions 
 * directly from `lib/slug-definitions.ts`.
 * 
 * This ensures that slugs are consistent across both the frontend and backend systems.
 * To change a slug, edit it in `lib/slug-definitions.ts`.
 */


 
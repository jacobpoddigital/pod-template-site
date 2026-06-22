// Client-safe search shapes + constants (NO server-only import) so the autocomplete client
// component can share them with the server seam (search.ts). Keep this free of any server code.

export type SearchProductSuggestion = {
  id: number;
  name: string;
  slug: string;
  price: string | null;
  image: { url: string; alt: string } | null;
};
export type SearchCategorySuggestion = { name: string; slug: string; count: number };
export type SearchSuggestions = { products: SearchProductSuggestion[]; categories: SearchCategorySuggestion[] };

export const SEARCH_MIN_CHARS = 2;

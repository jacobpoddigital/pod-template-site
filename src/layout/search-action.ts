"use server";

import { getSearchSuggestions } from "@/lib/commerce/search";
import type { SearchSuggestions } from "@/lib/commerce/search-types";

// Server Action backing the autocomplete dropdown — keeps the WooGraphQL endpoint + auth on the
// server (browser never hits WP, ADR 0007/0013). Thin wrapper over the search SEAM so swapping
// to Orama later is a one-file change in @/lib/commerce/search.
export async function searchSuggestionsAction(q: string): Promise<SearchSuggestions> {
  return getSearchSuggestions(q);
}

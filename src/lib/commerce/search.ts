import "server-only";
import { commerceRequest } from "./client";
import { SearchSuggestDocument } from "./generated/graphql";
import type { SearchSuggestQuery } from "./generated/graphql";
import { COMMERCE_TAGS } from "./products";
import { SEARCH_MIN_CHARS, type SearchSuggestions, type SearchProductSuggestion, type SearchCategorySuggestion } from "./search-types";

// THE SEARCH SEAM. Today: WooGraphQL native keyword search. Later: swap the internals here for
// Orama (in-process, free, typo-tolerant) WITHOUT touching the UI — the autocomplete dropdown
// and /search page consume these stable shapes (search-types.ts). See
// docs/research/2026-06-19-ecommerce-search-bar-ux.md (engine decision: Orama, deferred).
// Results listing reuses getShopData({ search }) (server-side filter + facets), so search
// results are filterable like the shop — only the autocomplete suggestions live here.

export async function getSearchSuggestions(q: string, first = 6): Promise<SearchSuggestions> {
  const term = q.trim();
  if (term.length < SEARCH_MIN_CHARS) return { products: [], categories: [] };

  // WooGraphQL `search:` maps to WP_Query `s=`, which matches ANY word (OR). So "nike pegasus"
  // also surfaces every other Nike and every other Pegasus — the autocomplete looked like it
  // searched words individually. Over-fetch, then keep only products whose NAME contains EVERY
  // token (AND) so suggestions reflect the phrase typed. (The /search results page still runs the
  // full WP search; this precision is just for the dropdown.) Orama would make this typo-tolerant.
  const tokens = term.toLowerCase().split(/\s+/).filter(Boolean);
  const matchesAllTokens = (name: string) => {
    const n = name.toLowerCase();
    return tokens.every((t) => n.includes(t));
  };

  const d = await commerceRequest<SearchSuggestQuery>(SearchSuggestDocument, { q: term, first: first * 4 }, [
    COMMERCE_TAGS.products,
  ]);

  const products: SearchProductSuggestion[] = (d.products?.nodes ?? [])
    .filter((n) => tokens.length < 2 || matchesAllTokens(n.name ?? ""))
    .slice(0, first)
    .map((n) => ({
      id: n.databaseId,
      name: n.name ?? "",
      slug: n.slug ?? "",
      price: "price" in n ? n.price ?? null : null,
      image: n.image?.sourceUrl ? { url: n.image.sourceUrl, alt: n.image.altText ?? n.name ?? "" } : null,
    }));

  const categories: SearchCategorySuggestion[] = (d.productCategories?.nodes ?? []).map((c) => ({
    name: c.name ?? "",
    slug: c.slug ?? "",
    count: c.count ?? 0,
  }));

  return { products, categories };
}

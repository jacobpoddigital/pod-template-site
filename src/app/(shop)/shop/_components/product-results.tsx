import Link from "next/link";
import type { ProductCard as ProductCardModel, ShopFacets } from "@/lib/commerce/products";
import { PAGINATION_MODE } from "@/lib/commerce/config";
import { ProductCard } from "./product-card";
import { ActiveFilterChips } from "./active-filter-chips";
import { ShopToolbar } from "./shop-toolbar";
import { LoadMore } from "./load-more";
import { Pagination } from "./pagination";
import { PendingRegion } from "./pending-region";

// The results column shared by /shop and /shop/[category]: active-filter chips + a results
// toolbar (count + sort) + the product grid (with an empty state) + paging. Paging STYLE is a
// build-level choice (PAGINATION_MODE): "load-more" renders the cumulative button; "numbered"
// renders a crawlable numbered <nav> top AND bottom of the grid. `products` is the slice to
// render this request (cumulative or windowed by mode), `total` the full filtered count,
// `totalPages` the numbered-mode page count. `clearHref` is where "Clear filters" returns to —
// /shop on the catalogue, /shop/[category] on a category page (so clearing stays in-category).
export function ProductResults({
  products,
  total,
  page,
  totalPages,
  facets,
  clearHref,
}: {
  products: ProductCardModel[];
  total: number;
  page: number;
  totalPages: number;
  facets: ShopFacets;
  clearHref: string;
}) {
  const numbered = PAGINATION_MODE === "numbered";
  return (
    // Bottom clearance on mobile so the sticky filter bar never covers Load-more / pagination.
    <div className="max-lg:pb-24">
      <h2 className="sr-only">Product results</h2>
      <ActiveFilterChips facets={facets} />
      <ShopToolbar total={total} />
      <PendingRegion>
        {products.length ? (
          <>
            {numbered && <Pagination page={page} totalPages={totalPages} className="mb-6" />}
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((p) => (
                <li key={p.id}>
                  <ProductCard product={p} />
                </li>
              ))}
            </ul>
            {numbered ? (
              <Pagination page={page} totalPages={totalPages} className="mt-10" />
            ) : (
              <LoadMore shown={products.length} total={total} page={page} />
            )}
          </>
        ) : (
          <p className="body text-muted-foreground">
            No shoes match those filters.{" "}
            <Link
              href={clearHref}
              className="text-link underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Clear filters
            </Link>
          </p>
        )}
      </PendingRegion>
    </div>
  );
}

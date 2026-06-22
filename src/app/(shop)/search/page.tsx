import type { Metadata } from "next";
import { Section } from "@/ui/section";
import { getShopData, getProducts } from "@/lib/commerce/products";
import { ShopControls } from "../shop/_components/shop-controls";
import { ProductResults } from "../shop/_components/product-results";
import { Breadcrumb } from "../shop/_components/breadcrumb";
import { parseShopFilters, type SearchParams } from "../shop/_lib/parse-filters";
import { parsePage, paginate } from "../shop/_lib/pagination";
import { SearchRecovery } from "./_components/search-recovery";

// Search results = the standardised shop listing scoped to a query (filterable + faceted, the
// best-practice "search + facets together"), plus a proper zero-results recovery. Search results
// pages are noindex (thin, query-driven). The query box lives in the header (SearchAutocomplete);
// this page consumes ?q= and the same WooGraphQL search seam.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false, follow: true },
};

export default async function SearchPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const filters = parseShopFilters(sp);
  const q = (filters.search ?? "").trim();

  // No query yet → prompt with recovery's browse/popular affordances (recommended = newest).
  if (!q) {
    const recommended = await getProducts({ first: 3 });
    return (
      <Section dataBlock="search" padding="default">
        <SearchRecovery query="" recommended={recommended} />
      </Section>
    );
  }

  const { products, facets, universe, labels } = await getShopData(filters);
  const { shown, page, total, totalPages } = paginate(products, parsePage(sp));

  if (total === 0) {
    const recommended = await getProducts({ first: 3 });
    return (
      <Section dataBlock="search" padding="default">
        <SearchRecovery query={q} recommended={recommended} />
      </Section>
    );
  }

  const clearHref = `/search?q=${encodeURIComponent(q)}`;
  return (
    <Section dataBlock="search" padding="default">
      <header className="mb-8 max-w-[65ch]">
        <Breadcrumb items={[{ name: "Home", href: "/" }, { name: "Shop", href: "/shop" }, { name: "Search" }]} />
        <h1 className="display-lg text-foreground">
          Results for <span>&ldquo;{q}&rdquo;</span>
        </h1>
        <p className="mt-4 body text-muted-foreground">Refine with the filters, or dial in fit on the product page.</p>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[16rem_1fr]">
        <ShopControls facets={facets} universe={universe} labels={labels} />
        <ProductResults products={shown} total={total} page={page} totalPages={totalPages} facets={facets} clearHref={clearHref} />
      </div>
    </Section>
  );
}

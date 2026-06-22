import type { Metadata } from "next";
import { Section } from "@/ui/section";
import { getShopData } from "@/lib/commerce/products";
import { ShopControls } from "./_components/shop-controls";
import { ProductResults } from "./_components/product-results";
import { Breadcrumb } from "./_components/breadcrumb";
import { BreadcrumbJsonLd } from "./_components/breadcrumb-jsonld";
import { parseShopFilters, type SearchParams } from "./_lib/parse-filters";
import { parsePage, paginate } from "./_lib/pagination";

// Filtered listings are inherently dynamic (searchParams-driven). The unfiltered shell could
// be static, but server-side facet filtering/search is the point; the WooGraphQL fetch is
// still tag-cached. Browser never hits WP — the server runs the query (ADR 0007/0013).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop running shoes",
  description: "Daily trainers, stability, racing and trail running shoes — filter by type, brand, drop, support and cushioning.",
  alternates: { canonical: "/shop" },
};

export default async function ShopPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const filters = parseShopFilters(sp);
  const { products, facets, universe, labels } = await getShopData(filters);
  const { shown, page, total, totalPages } = paginate(products, parsePage(sp));

  return (
    <Section dataBlock="shop_index" padding="default">
      <BreadcrumbJsonLd items={[{ name: "Home", path: "/" }, { name: "Shop", path: "/shop" }]} />
      <header className="mb-8 max-w-[65ch]">
        <Breadcrumb items={[{ name: "Home", href: "/" }, { name: "Shop" }]} />
        <h1 className="display-lg text-foreground">Running shoes</h1>
        <p className="mt-4 body text-muted-foreground">
          Every shoe compared on equal footing — filter by how you run, not by brand. Type,
          heel drop, support, cushioning, weight and width, then dial in fit on the product page.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[16rem_1fr]">
        <ShopControls facets={facets} universe={universe} labels={labels} />
        <ProductResults products={shown} total={total} page={page} totalPages={totalPages} facets={facets} clearHref="/shop" />
      </div>
    </Section>
  );
}

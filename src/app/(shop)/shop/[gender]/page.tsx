import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Section } from "@/ui/section";
import { getShopData } from "@/lib/commerce/products";
import { ShopControls } from "../_components/shop-controls";
import { ProductResults } from "../_components/product-results";
import { Breadcrumb } from "../_components/breadcrumb";
import { BreadcrumbJsonLd } from "../_components/breadcrumb-jsonld";
import { parseShopFilters, type SearchParams } from "../_lib/parse-filters";
import { parsePage, paginate } from "../_lib/pagination";
import { getGender, GENDERS } from "../_lib/taxonomy";

// Gender landing (type-first nav, gender-first axis). Gender is LOCKED by the route (not a URL
// filter) → omitted from the sidebar; every other filter, the chips, the mobile drawer and the
// cards are identical to /shop. Sub-pages add a type lock (/shop/[gender]/[type]).
export const dynamic = "force-dynamic";

type Params = { gender: string };

// Known gender pages are the curated set (mens / womens) — anything else 404s.
export function generateStaticParams(): Params[] {
  return GENDERS.map((g) => ({ gender: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { gender } = await params;
  const g = getGender(gender);
  if (!g) return {};
  return {
    title: g.heroTitle,
    description: g.heroBody,
    alternates: { canonical: `/shop/${g.slug}` },
  };
}

export default async function GenderPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const { gender } = await params;
  const g = getGender(gender);
  if (!g) notFound();

  const base = `/shop/${g.slug}`;
  const sp = await searchParams;
  // Lock gender to this route; every other filter still comes from the URL.
  const filters = parseShopFilters(sp, { gender: [g.slug] });
  const { products, facets, universe, labels } = await getShopData(filters);
  const { shown, page, total, totalPages } = paginate(products, parsePage(sp));

  return (
    <Section dataBlock="shop_gender" padding="default">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Shop", path: "/shop" },
          { name: g.name, path: base },
        ]}
      />
      <header className="mb-8 max-w-[65ch]">
        <Breadcrumb
          items={[
            { name: "Home", href: "/" },
            { name: "Shop", href: "/shop" },
            { name: g.name },
          ]}
        />
        <h1 className="display-lg text-foreground">{g.heroTitle}</h1>
        <p className="mt-4 body text-muted-foreground">{g.heroBody}</p>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[16rem_1fr]">
        <ShopControls facets={facets} universe={universe} labels={labels} omit={["gender"]} basePath={base} />
        <ProductResults products={shown} total={total} page={page} totalPages={totalPages} facets={facets} clearHref={base} />
      </div>
    </Section>
  );
}

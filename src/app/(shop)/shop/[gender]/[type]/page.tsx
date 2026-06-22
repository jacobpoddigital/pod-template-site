import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Section } from "@/ui/section";
import { getShopData } from "@/lib/commerce/products";
import { ShopControls } from "../../_components/shop-controls";
import { ProductResults } from "../../_components/product-results";
import { Breadcrumb } from "../../_components/breadcrumb";
import { BreadcrumbJsonLd } from "../../_components/breadcrumb-jsonld";
import { CategoryLinks } from "../../_components/category-links";
import { parseShopFilters, type SearchParams } from "../../_lib/parse-filters";
import { parsePage, paginate } from "../../_lib/pagination";
import { getGender, getType, GENDERS, TYPES } from "../../_lib/taxonomy";

// Gender + type landing (e.g. /shop/mens/racing). BOTH axes LOCKED by the route → omitted from
// the sidebar; everything else (refinement filters, chips, mobile drawer, cards) is identical to
// /shop. This is the leaf the header mega-menu links to (Men's ► Racing).
export const dynamic = "force-dynamic";

type Params = { gender: string; type: string };

// Curated set = gender × type (mens/womens × the four type categories) — anything else 404s.
export function generateStaticParams(): Params[] {
  return GENDERS.flatMap((g) => TYPES.map((t) => ({ gender: g.slug, type: t.slug })));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { gender, type } = await params;
  const g = getGender(gender);
  const t = getType(type);
  if (!g || !t) return {};
  const title = `${g.name} ${t.name.toLowerCase()}`;
  return {
    title,
    description: `${title} — ${t.heroBody}`,
    alternates: { canonical: `/shop/${g.slug}/${t.slug}` },
  };
}

export default async function GenderTypePage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const { gender, type } = await params;
  const g = getGender(gender);
  const t = getType(type);
  if (!g || !t) notFound();

  const base = `/shop/${g.slug}/${t.slug}`;
  const sp = await searchParams;
  // Lock BOTH gender and type to this route; every other filter still comes from the URL.
  const filters = parseShopFilters(sp, { gender: [g.slug], type: [t.slug] });
  const { products, facets, universe, labels } = await getShopData(filters);
  const { shown, page, total, totalPages } = paginate(products, parsePage(sp));

  const heading = `${g.name} ${t.name.toLowerCase()}`;

  return (
    <Section dataBlock="shop_gender_type" padding="default">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Shop", path: "/shop" },
          { name: g.name, path: `/shop/${g.slug}` },
          { name: t.name, path: base },
        ]}
      />
      <header className="mb-8 max-w-[65ch]">
        <Breadcrumb
          items={[
            { name: "Home", href: "/" },
            { name: "Shop", href: "/shop" },
            { name: g.name, href: `/shop/${g.slug}` },
            { name: t.name },
          ]}
        />
        <h1 className="display-lg text-foreground">{heading}</h1>
        <p className="mt-4 body text-muted-foreground">{t.heroBody}</p>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[16rem_1fr]">
        <ShopControls facets={facets} universe={universe} labels={labels} omit={["gender", "type"]} basePath={base} />
        <ProductResults products={shown} total={total} page={page} totalPages={totalPages} facets={facets} clearHref={base} />
      </div>

      <CategoryLinks gender={g} type={t} />
    </Section>
  );
}

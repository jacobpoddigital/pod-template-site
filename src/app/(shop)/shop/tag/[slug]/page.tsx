import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Section } from "@/ui/section";
import { getShopData } from "@/lib/commerce/products";
import { getProductTag } from "@/lib/commerce/tags";
import { ShopControls } from "../../_components/shop-controls";
import { ProductResults } from "../../_components/product-results";
import { Breadcrumb } from "../../_components/breadcrumb";
import { BreadcrumbJsonLd } from "../../_components/breadcrumb-jsonld";
import { parseShopFilters, type SearchParams } from "../../_lib/parse-filters";
import { parsePage, paginate } from "../../_lib/pagination";

// Product-tag archive (merchandising / editorial browse, e.g. "shop the look"). Tag is LOCKED by the
// route (not a URL filter) → not in the sidebar; every other filter, the chips, the mobile drawer
// and the cards are identical to /shop. Tags are dynamic (merchant-defined), so no static params —
// an unknown tag 404s via the getProductTag lookup.
export const dynamic = "force-dynamic";

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const tag = await getProductTag(slug);
  if (!tag) return {};
  const description = tag.description?.replace(/<[^>]+>/g, "").trim() || `Shop running products tagged ${tag.name}.`;
  return { title: `${tag.name} — Shop`, description, alternates: { canonical: `/shop/tag/${tag.slug}` } };
}

export default async function TagPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const { slug } = await params;
  const tag = await getProductTag(slug);
  if (!tag) notFound();

  const base = `/shop/tag/${tag.slug}`;
  const sp = await searchParams;
  // Lock the tag to this route; every other filter still comes from the URL.
  const filters = parseShopFilters(sp, { tag: [tag.slug] });
  const { products, facets, universe, labels } = await getShopData(filters);
  const { shown, page, total, totalPages } = paginate(products, parsePage(sp));

  return (
    <Section dataBlock="shop_tag" padding="default">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Shop", path: "/shop" },
          { name: tag.name, path: base },
        ]}
      />
      <header className="mb-8 max-w-[65ch]">
        <Breadcrumb items={[{ name: "Home", href: "/" }, { name: "Shop", href: "/shop" }, { name: tag.name }]} />
        <h1 className="display-lg text-foreground">{tag.name}</h1>
        <p className="mt-4 body text-muted-foreground">
          {tag.description?.replace(/<[^>]+>/g, "").trim() || `Everything tagged “${tag.name}” — filter and sort to dial in fit.`}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[16rem_1fr]">
        <ShopControls facets={facets} universe={universe} labels={labels} basePath={base} />
        <ProductResults products={shown} total={total} page={page} totalPages={totalPages} facets={facets} clearHref={base} />
      </div>
    </Section>
  );
}

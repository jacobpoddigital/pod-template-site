import { siteConfig } from "../../../../../../site.config";
import { ORG_ID } from "@/app/structured-data";
import type { ProductDetail } from "@/lib/commerce/products";

// Product + BreadcrumbList structured data (PDP). Server-rendered so AI/GEO crawlers parse it
// without JS. AggregateOffer for the variation price range; aggregateRating from real reviews.
// `<` escaped so a stray "</script>" can't break out of the tag (matches blog-jsonld).
const SITE = siteConfig.url.replace(/\/$/, "");
const abs = (path: string) => (path.startsWith("http") ? path : `${SITE}${path}`);

function Ld({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

const toNum = (s: string | null): number => parseFloat((s ?? "").replace(/[^0-9.]/g, "")) || 0;

function buildOffers(product: ProductDetail) {
  const availability = `https://schema.org/${product.inStock ? "InStock" : "OutOfStock"}`;
  const prices = product.variations.map((v) => toNum(v.price)).filter((n) => n > 0);
  const url = abs(`/product/${product.slug}`);
  if (prices.length === 0) return undefined;
  const low = Math.min(...prices);
  const high = Math.max(...prices);
  if (low === high) {
    return { "@type": "Offer", price: low.toFixed(2), priceCurrency: "GBP", availability, url };
  }
  return {
    "@type": "AggregateOffer",
    lowPrice: low.toFixed(2),
    highPrice: high.toFixed(2),
    priceCurrency: "GBP",
    offerCount: prices.length,
    availability,
    url,
  };
}

export function ProductJsonLd({
  product,
  breadcrumb,
}: {
  product: ProductDetail;
  breadcrumb: { name: string; path: string }[];
}) {
  const images = [product.image, ...product.gallery]
    .filter((i): i is NonNullable<typeof i> => Boolean(i))
    .map((i) => abs(i.url));

  const productLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    url: abs(`/product/${product.slug}`),
    ...(product.sku ? { sku: product.sku } : {}),
    ...(images.length ? { image: images } : {}),
    ...(product.shortDescription
      ? { description: product.shortDescription.replace(/<[^>]+>/g, "").trim() }
      : {}),
    ...(product.brand ? { brand: { "@type": "Brand", name: product.brand } } : {}),
    ...(product.categories[0] ? { category: product.categories[0].name } : {}),
    seller: { "@id": ORG_ID },
  };

  const offers = buildOffers(product);
  if (offers) productLd.offers = offers;

  // Gate on reviewsAllowed too — a reviews-disabled product hides its rating on every visible
  // surface (PDP, card, quick-view), so emitting aggregateRating here would be a Rich-Results
  // mismatch (structured rating with no visible content backing it).
  if (product.reviewsAllowed && product.reviewCount && product.averageRating) {
    productLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: product.averageRating.toFixed(1),
      reviewCount: product.reviewCount,
    };
  }

  return (
    <>
      <Ld data={productLd} />
      <Ld
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: breadcrumb.map((c, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: c.name,
            item: abs(c.path),
          })),
        }}
      />
    </>
  );
}

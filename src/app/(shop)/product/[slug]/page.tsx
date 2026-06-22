import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Section } from "@/ui/section";
import { Badge } from "@/ui/badge";
import { RichText } from "@/ui/rich-text";
import { Slider, SliderItem } from "@/ui/slider";
import { getProducts, getProductBySlug } from "@/lib/commerce/products";
import { commerceConfigured } from "@/lib/commerce/client";
import { getUpsellRail } from "@/lib/commerce/related";
import type { ProductCard as ProductCardData, ProductDetail } from "@/lib/commerce/products";
import { ProductCard } from "@/app/(shop)/shop/_components/product-card";
import { BuyBox } from "./_components/buy-box";
import { TrustStrip } from "./_components/trust-strip";
import { ProductJsonLd } from "./_components/product-jsonld";
import { ProductGallery } from "./_components/product-gallery";
import { ColourGalleryProvider } from "@/app/(shop)/_components/colour-gallery";
import { SpecSection } from "./_components/spec-section";
import { FitGuidance } from "./_components/fit-guidance";
import { ReviewsSection } from "./_components/reviews-section";
import { StickyBuyCta } from "./_components/sticky-buy-cta";
import { BuyCtaProvider } from "./_components/buy-cta-context";
import { siteConfig } from "../../../../../site.config";

// SSG for the seeded catalogue; new products render on-demand (ISR) without a rebuild.
export const dynamicParams = true;

export async function generateStaticParams() {
  // No live WooCommerce endpoint (e.g. CI build) → skip pre-rendering. dynamicParams=true
  // means the routes still build and render on demand once an endpoint exists.
  if (!commerceConfigured()) return [];
  const products = await getProducts({ first: 100 });
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  const description = product.shortDescription?.replace(/<[^>]+>/g, "").trim() || product.name;
  return {
    title: product.name,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: { title: `${product.name} | ${siteConfig.name}`, description, url: `/product/${product.slug}`, type: "website" },
  };
}

const num = (s: string | null): number | null => {
  const n = parseFloat((s ?? "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : null;
};

const isSupportShoe = (s: string) => s.includes("stability") || s.includes("motion");

function supportReason(current: ProductDetail, r: ProductCardData): string | null {
  const cur = (current.pronation ?? "").toLowerCase();
  const rs = (r.pronation ?? "").toLowerCase();
  if (!rs || rs === cur) return null;
  if (isSupportShoe(rs)) return "If you overpronate";
  if (isSupportShoe(cur)) return "For a neutral ride";
  return null;
}

function deltaReason(cur: number | null, other: number | null, min: number, labels: { lower: string; higher: string }): string | null {
  if (cur == null || other == null || Math.abs(other - cur) < min) return null;
  return other < cur ? labels.lower : labels.higher;
}

// Shoe products carry technical specs; simple accessories (e.g. socks) don't — gates the spec
// table, fit adviser, and the shoe-specific copy/heading on the PDP.
const productHasSpecs = (p: ProductDetail): boolean =>
  Boolean(p.drop || p.cushioning || p.pronation || p.weightGrams);

// Contextual cross-sell label — compares the related shoe to the one being viewed so the reason
// is genuine ("lighter alternative", "if you overpronate"), not generic "you may also like".
function crossSellReason(current: ProductDetail, r: ProductCardData): string {
  return (
    supportReason(current, r) ??
    deltaReason(num(current.weightGrams), num(r.weightGrams), 15, { lower: "Lighter alternative", higher: "More cushioned option" }) ??
    deltaReason(num(current.drop), num(r.drop), 1, { lower: "Lower-drop option", higher: "Higher-drop option" }) ??
    "Similar option"
  );
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const category = product.categories[0];
  const hasSpecs = productHasSpecs(product);
  // Merchant up-sells first (labelled "Recommended"), filled with algorithmic related.
  const rail = await getUpsellRail(product, 10);
  const galleryImages = [product.image, ...product.gallery].filter((i): i is NonNullable<typeof i> => Boolean(i));
  const breadcrumb = [
    { name: "Shop", path: "/shop" },
    ...(category ? [{ name: category.name, path: `/shop?type=${category.slug}` }] : []),
    { name: product.name, path: `/product/${product.slug}` },
  ];

  return (
    <BuyCtaProvider price={product.price}>
      <ProductJsonLd product={product} breadcrumb={breadcrumb} />
      {/* Trust strip — immediate credibility for paid-traffic arrivals (Baymard). Digital (virtual)
          products swap the shipping reassurances for download-appropriate ones. */}
      <TrustStrip digital={product.virtual} />

      <Section dataBlock="product_detail" padding="compact">
        <nav aria-label="Breadcrumb" className="mb-6 body-sm text-muted-foreground">
          <Link href="/shop" className="hover:text-foreground focus-visible:outline-none focus-visible:underline">
            Shop
          </Link>
          {category && (
            <>
              {" / "}
              <Link
                href={`/shop?type=${category.slug}`}
                className="hover:text-foreground focus-visible:outline-none focus-visible:underline"
              >
                {category.name}
              </Link>
            </>
          )}
          <span className="text-foreground"> / {product.name}</span>
        </nav>

        {/* Provider shares the selected colourway between the buy-box selector and the gallery so
            picking a colour swaps the displayed image (colourImages empty → no-op). */}
        <ColourGalleryProvider colourImages={product.colourImages}>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
            <ProductGallery images={galleryImages} name={product.name} />
            <BuyBox product={product} />
          </div>
        </ColourGalleryProvider>

        {product.description && (
          <div className="mt-14 max-w-[65ch]">
            <h2 className="display-sm text-foreground">{hasSpecs ? "About this shoe" : "About this product"}</h2>
            <RichText html={product.description} className="mt-4 body text-muted-foreground" />
          </div>
        )}
      </Section>

      {/* Spec table + fit adviser are shoe-specific — skip for simple accessories with no specs. */}
      {hasSpecs && (
        <>
          <SpecSection product={product} />
          <FitGuidance product={product} />
        </>
      )}
      <ReviewsSection product={product} />

      {rail.length > 0 && (
        <Section dataBlock="pdp_cross_sell" tone="muted" padding="default">
          <h2 className="display-sm text-foreground">You may also like</h2>
          {/* Template card slider (ui/slider, same as card-grid): drag/swipe + controls. Merchant
              up-sells read "Recommended"; algorithmic picks keep their contextual reason label. */}
          <div className="mt-8">
            <Slider label="You may also like">
              {rail.map(({ card, source }) => (
                <SliderItem key={card.slug}>
                  <div className="flex h-full flex-col gap-2">
                    <Badge variant="muted" className="self-start">
                      {source === "merchant" ? "Recommended" : crossSellReason(product, card)}
                    </Badge>
                    <ProductCard product={card} />
                  </div>
                </SliderItem>
              ))}
            </Slider>
          </div>
        </Section>
      )}

      <StickyBuyCta price={product.price} />
    </BuyCtaProvider>
  );
}

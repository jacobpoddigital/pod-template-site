import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlockRenderer } from "@/blocks/block-renderer";
import { getPage, getPages, pageMetadata } from "@/lib/cms";
import { SeoSchema } from "../seo-schema";

// Generic CMS page (workflow/02 canonical tree): any published WP page renders
// through the block registry. THIN composition only.
// SSG only — params are fixed at build time. A brand-new WP page appears at the
// next build/deploy; revalidateTag refreshes CONTENT of existing pages. This is
// deliberate: content pages are never SSR'd (resilience rule, workflow/01).
export const dynamic = "error";
export const dynamicParams = false;

// Slugs owned by REAL app routes — the catch-all must NOT prerender these, or its static page
// shadows the dynamic route on Vercel (the static prerender is served from the edge before the
// route's function runs). A WP page whose slug matches a route (e.g. WooCommerce seeds shop/cart/
// checkout/my-account) would otherwise 404 or hijack that route in production. Keep in sync with
// the literal routes under src/app (incl. the opt-in commerce module). HQ FRICTION 2026-06-21.
const RESERVED_SLUGS = new Set([
  "home", // served at "/"
  "account", "blog", "case-studies", "styleguide", "blocks", "preview",
  // commerce module (opt-in) — reserved so a Woo-seeded page never shadows these:
  "shop", "cart", "checkout", "my-account", "search", "product", "fit-guide",
]);

interface Props {
  params: Promise<{ slug: string[] }>;
}

export async function generateStaticParams() {
  const pages = await getPages();
  return pages
    .filter((page) => !RESERVED_SLUGS.has(page.slug))
    .map((page) => ({ slug: [page.slug] }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const path = slug.join("/");
  const page = await getPage(path);
  if (!page) notFound();
  return pageMetadata(page, `/${path}`);
}

export default async function CmsPage({ params }: Props) {
  const { slug } = await params;
  const page = await getPage(slug.join("/"));
  if (!page) notFound();
  return (
    <>
      <SeoSchema raw={page.seo?.schemaRaw} />
      <BlockRenderer blocks={page.blocks} />
    </>
  );
}

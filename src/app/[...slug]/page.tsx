import type { Metadata } from "next";
import { BlockRenderer } from "@/blocks/block-renderer";
import { getPage, getPages } from "@/lib/cms";

// Generic CMS page (workflow/02 canonical tree): any published WP page renders
// through the block registry. THIN composition only.
// SSG only — params are fixed at build time. A brand-new WP page appears at the
// next build/deploy; revalidateTag refreshes CONTENT of existing pages. This is
// deliberate: content pages are never SSR'd (resilience rule, workflow/01).
export const dynamic = "error";
export const dynamicParams = false;

interface Props {
  params: Promise<{ slug: string[] }>;
}

export async function generateStaticParams() {
  const pages = await getPages();
  return pages
    .filter((page) => page.slug !== "home") // home is served at "/"
    .map((page) => ({ slug: [page.slug] }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug.join("/"));
  return {
    title: page.title,
    alternates: { canonical: `/${slug.join("/")}` },
  };
}

export default async function CmsPage({ params }: Props) {
  const { slug } = await params;
  const page = await getPage(slug.join("/"));
  return <BlockRenderer blocks={page.blocks} />;
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlockRenderer } from "@/blocks/block-renderer";
import { getPage, pageMetadata } from "@/lib/cms";
import { SeoSchema } from "./seo-schema";

// THIN composition only (workflow/02): fetch the page, hand blocks to the renderer.
// SSG enforced — content pages are NEVER SSR (resilience: ISR serves last-good).
export const dynamic = "error";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("home");
  if (!page) notFound();
  return pageMetadata(page, "/");
}

export default async function HomePage() {
  const page = await getPage("home");
  if (!page) notFound();
  return (
    <>
      <SeoSchema raw={page.seo?.schemaRaw} />
      <BlockRenderer blocks={page.blocks} />
    </>
  );
}

import { notFound } from "next/navigation";
import { BlockRenderer } from "@/blocks/block-renderer";
import { getPage } from "@/lib/cms";

// THIN composition only (workflow/02): fetch the page, hand blocks to the renderer.
// SSG enforced — content pages are NEVER SSR (resilience: ISR serves last-good).
export const dynamic = "error";

export default async function HomePage() {
  const page = await getPage("home");
  if (!page) notFound();
  return <BlockRenderer blocks={page.blocks} />;
}

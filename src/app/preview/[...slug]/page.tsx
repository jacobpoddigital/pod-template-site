import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { draftMode } from "next/headers";
import { BlockRenderer } from "@/blocks/block-renderer";
import { getPage } from "@/lib/cms";
import { SeoSchema } from "../../seo-schema";

// Draft-preview render path (boilerplate §4). DELIBERATELY separate from the SSG
// content route (app/[...slug]) so real visitors keep the static/ISR guarantee —
// only this route is dynamic. The WP "Preview" button hits /api/preview (validates
// PREVIEW_SECRET, enables draftMode) which redirects here. With draft mode on,
// getPage fetches UNCACHED + AUTHENTICATED (see cms/client.ts) so the editor sees
// unpublished/just-saved content. Resolving a draft BY URI + the WP application
// password are the per-project setup that flips §4 fully green (docs/preview.md).
export const dynamic = "force-dynamic";

// Preview pages must never be indexed.
export const metadata: Metadata = { robots: { index: false, follow: false } };

interface Props {
  params: Promise<{ slug: string[] }>;
}

export default async function PreviewPage({ params }: Props) {
  const { slug } = await params;
  const { isEnabled } = await draftMode();
  const path = slug.join("/");
  const page = await getPage(path, { preview: isEnabled });
  if (!page) notFound();
  return (
    <>
      {isEnabled ? (
        <div
          role="status"
          className="sticky top-0 z-50 flex items-center justify-center gap-3 bg-amber-500 px-4 py-2 body-sm font-medium text-black"
        >
          <span>Preview mode — showing unpublished content</span>
          {/* A plain <a>: /api/exit-preview is an API route that does a SERVER redirect — a
              client-side <Link> would try to navigate to it as a page and break the redirect. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/api/exit-preview" className="underline underline-offset-2 focus-visible:ring-2">
            Exit preview
          </a>
        </div>
      ) : null}
      <SeoSchema raw={page.seo?.schemaRaw} />
      <BlockRenderer blocks={page.blocks} />
    </>
  );
}

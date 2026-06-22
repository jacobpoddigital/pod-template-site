import Link from "next/link";

// Product tags → tappable chips linking to the `/shop/tag/{slug}` archive (merchandising / editorial
// browse, e.g. "shop the look"). Shown on the PDP buy-box + the quick-view modal (locational
// coverage); omitted from the dense listing card. Own file so the client quick-view can import it
// without pulling the whole server buy-box module into the client bundle.
export function ProductTags({ tags }: { tags: { name: string; slug: string }[] }) {
  if (!tags.length) return null;
  return (
    <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-border pt-4">
      <span className="body-sm text-muted-foreground">Tags</span>
      <ul className="flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <li key={t.slug}>
            <Link
              href={`/shop/tag/${t.slug}`}
              className="inline-flex rounded-full border border-border px-2.5 py-1 body-sm text-foreground transition-colors hover:border-foreground/40 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {t.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

import Link from "next/link";
import { ProductCard } from "../../shop/_components/product-card";
import { TYPES } from "../../shop/_lib/taxonomy";
import type { ProductCard as ProductCardModel } from "@/lib/commerce/products";

// Zero-results recovery (Baymard's 5 strategies): never a dead end. Echo the query, offer
// alternative searches, related categories, popular products, and a help path. ~50% of ecom
// sites fail to recover here — see docs/research/2026-06-19-ecommerce-search-bar-ux.md.
const ALT_SEARCHES = ["carbon", "trail", "wide fit", "max cushion", "neutral"];

const linkCls =
  "rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function SearchRecovery({ query, recommended }: { query: string; recommended: ProductCardModel[] }) {
  return (
    <div className="flex flex-col gap-10">
      <div className="max-w-[65ch]">
        <h1 className="display-lg text-foreground">
          No results for {query ? <span>&ldquo;{query}&rdquo;</span> : "your search"}
        </h1>
        <p className="mt-4 body text-muted-foreground">
          We couldn&rsquo;t match that to a shoe. Try one of these, browse by type, or talk to us
          and we&rsquo;ll help you find the right pair.
        </p>
      </div>

      {/* Alternative searches */}
      <section aria-labelledby="alt-searches">
        <h2 id="alt-searches" className="display-sm mb-4 text-foreground">Try searching for</h2>
        <ul className="flex flex-wrap gap-2">
          {ALT_SEARCHES.map((t) => (
            <li key={t}>
              <Link
                href={`/search?q=${encodeURIComponent(t)}`}
                className={`inline-flex min-h-11 items-center rounded-full border border-border bg-surface px-4 body-sm text-foreground hover:bg-muted ${linkCls}`}
              >
                {t}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Related categories (type-first) */}
      <section aria-labelledby="browse-type">
        <h2 id="browse-type" className="display-sm mb-4 text-foreground">Browse by type</h2>
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {TYPES.map((t) => (
            <li key={t.slug}>
              <Link
                href={`/shop?type=${t.slug}`}
                className={`group flex h-full flex-col rounded-lg border border-border bg-surface-raised p-5 transition-shadow motion-safe:hover:shadow-md ${linkCls}`}
              >
                <t.icon className="size-7 text-primary" aria-hidden="true" />
                <span className="mt-3 display-xs text-foreground group-hover:text-link">{t.name}</span>
                <span className="mt-1 body-sm text-muted-foreground">{t.blurb}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Popular products */}
      {recommended.length > 0 && (
        <section aria-labelledby="popular-products">
          <h2 id="popular-products" className="display-sm mb-4 text-foreground">Popular right now</h2>
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {recommended.map((p) => (
              <li key={p.id}>
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Help path */}
      <p className="body text-muted-foreground">
        Still stuck?{" "}
        <Link href="/fit-guide" className={`font-medium text-link underline ${linkCls}`}>
          Use our fit guide
        </Link>{" "}
        to find your pair by how you run.
      </p>
    </div>
  );
}

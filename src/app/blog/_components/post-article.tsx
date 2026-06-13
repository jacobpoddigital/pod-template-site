import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/ui/badge";
import { RichText } from "@/ui/rich-text";
import { formatDate, readingTimeLabel } from "@/lib/format";
import type { BlogPost, PostListItem } from "@/lib/cms";
import { Breadcrumbs, type Crumb } from "./breadcrumbs";
import { AuthorBox } from "./author-box";
import { RelatedPosts } from "./related-posts";

// The single-post article body (workflow/34), split into small pieces so each stays
// under the complexity bar. Rendered + sanitized WP content sits in RichText's prose
// container (max-w-65ch); header/hero/footer are token-driven. The route owns SEO +
// JSON-LD; this owns presentation.

const focusRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

function PostHeader({ post, crumbs }: { post: BlogPost; crumbs: Crumb[] }) {
  const category = post.categories[0];
  // "Updated" only when the modified date differs from published (day granularity) —
  // transparency signal, never a fake refresh (research/eeat §C1).
  const updated = post.modified && formatDate(post.modified) !== formatDate(post.date) ? `Updated ${formatDate(post.modified)}` : "";
  const facts = [formatDate(post.date), updated, readingTimeLabel(post.readingTime)].filter(Boolean);
  return (
    <div className="mx-auto max-w-[70ch]">
      <Breadcrumbs items={crumbs} />
      {category ? (
        <Link href={category.href} className={`mb-3 inline-block rounded-full ${focusRing}`}>
          <Badge variant="muted">{category.name}</Badge>
        </Link>
      ) : null}
      <h1 className="display-lg text-ink">{post.title}</h1>
      {facts.length || post.author ? (
        <p className="mt-4 body-sm text-ink-muted">
          {facts.join(" · ")}
          {post.author ? (
            <>
              {facts.length ? " · " : ""}By{" "}
              <Link href={post.author.href} className={`rounded text-ink underline underline-offset-2 ${focusRing}`}>
                {post.author.name}
              </Link>
            </>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}

function PostHero({ image }: { image: BlogPost["image"] }) {
  if (!image?.sourceUrl) return null;
  return (
    <figure className="mx-auto mt-8 max-w-4xl">
      <div className="relative aspect-[16/9] overflow-hidden rounded-lg bg-surface-muted">
        <Image src={image.sourceUrl} alt={image.altText ?? ""} fill sizes="(min-width: 1024px) 56rem, 100vw" className="object-cover" priority />
      </div>
    </figure>
  );
}

// Cited sources (E-E-A-T §C2) — outbound references with rel=noopener. Renders nothing
// when the post cites none. An <ol> because the order is editorial/meaningful.
function PostSources({ sources }: { sources: BlogPost["sources"] }) {
  if (!sources.length) return null;
  return (
    <section aria-labelledby="sources-heading" className="mt-10 border-t border-border pt-6">
      <h2 id="sources-heading" className="display-xs mb-3 text-ink">Sources</h2>
      <ol className="space-y-1 body-sm text-ink-muted">
        {sources.map((s) => (
          <li key={s.url}>
            <a href={s.url} target="_blank" rel="noopener noreferrer nofollow" className={`text-ink underline underline-offset-2 ${focusRing}`}>
              {s.label}
            </a>
            {s.publisher ? <span> — {s.publisher}</span> : null}
          </li>
        ))}
      </ol>
    </section>
  );
}

function PostTags({ tags }: { tags: BlogPost["tags"] }) {
  if (!tags.length) return null;
  return (
    <ul role="list" className="mt-10 flex flex-wrap gap-2">
      {tags.map((t) => (
        <li key={t.slug}>
          <Link href={t.href} className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            <Badge variant="outline">#{t.name}</Badge>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function PostArticle({
  post,
  related,
  moreFromAuthor = [],
  crumbs,
}: {
  post: BlogPost;
  related: PostListItem[];
  moreFromAuthor?: PostListItem[];
  crumbs: Crumb[];
}) {
  const authorFirstName = post.author?.name.split(" ")[0];
  return (
    <article>
      <PostHeader post={post} crumbs={crumbs} />
      <PostHero image={post.image} />
      <div className="mx-auto mt-10 max-w-[70ch]">
        <RichText html={post.contentHtml} className="text-ink-muted" />
        <PostSources sources={post.sources} />
        <PostTags tags={post.tags} />
        {post.author ? (
          <div className="mt-10">
            <AuthorBox author={post.author} />
          </div>
        ) : null}
      </div>
      <RelatedPosts posts={moreFromAuthor} heading={`More from ${authorFirstName ?? "the author"}`} id="more-from-author" />
      <RelatedPosts posts={related} />
    </article>
  );
}

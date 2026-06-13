import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { sanitize } from "@/lib/sanitize";
import { formatDate, readingTimeLabel } from "@/lib/format";
import type { PostListItem } from "@/lib/cms";

// Blog post card (workflow/34) — ported from Great White's content-article, mapped
// to the template's design system: tokens + type-scale classes, the Card primitive
// (whole-card link via the stretched-anchor pattern), no raw hex / no raw text sizes.

export interface PostCardShow {
  image?: boolean;
  category?: boolean;
  excerpt?: boolean;
  author?: boolean;
  readingTime?: boolean;
}
const DEFAULT_SHOW: Required<PostCardShow> = { image: true, category: true, excerpt: true, author: true, readingTime: true };
const DEFAULT_SIZES = "(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw";

function CardThumb({ image, sizes }: { image: PostListItem["image"]; sizes?: string }) {
  if (!image?.sourceUrl) return null;
  return (
    <div className="relative aspect-[16/9] bg-surface-muted">
      <Image src={image.sourceUrl} alt={image.altText ?? ""} fill sizes={sizes ?? DEFAULT_SIZES} className="object-cover" />
    </div>
  );
}

/** "9 June 2026 · 5 min read" — empty parts dropped. */
function cardMeta(post: PostListItem, showReadingTime: boolean): string {
  return [formatDate(post.date), showReadingTime ? readingTimeLabel(post.readingTime) : ""].filter(Boolean).join(" · ");
}

export function PostCard({
  post,
  show,
  sizes,
  headingLevel = 2,
}: {
  post: PostListItem;
  show?: PostCardShow;
  sizes?: string;
  /** Card title level — 2 under a page H1 (listings), 3 under a section H2 (related). */
  headingLevel?: 2 | 3;
}) {
  const s = { ...DEFAULT_SHOW, ...show };
  const meta = cardMeta(post, s.readingTime);
  const category = post.categories[0];
  const Heading = `h${headingLevel}` as "h2" | "h3";

  return (
    <Card interaction="link" className="flex h-full flex-col overflow-hidden">
      {s.image ? <CardThumb image={post.image} sizes={sizes} /> : null}

      <CardContent className="flex flex-1 flex-col gap-3 p-6">
        {s.category && category ? (
          <Badge variant="muted" className="w-fit">{category.name}</Badge>
        ) : null}

        {/* Stretched link makes the whole card clickable while the title stays the a11y name. */}
        <Heading className="display-xs text-ink">
          <Link
            href={post.href}
            className="after:absolute after:inset-0 focus-visible:outline-none"
          >
            {post.title}
          </Link>
        </Heading>

        {meta ? <p className="body-sm text-ink-muted">{meta}</p> : null}

        {s.excerpt && post.excerpt ? (
          <div
            className="body-sm text-ink-muted [&_p]:m-0 line-clamp-3"
            dangerouslySetInnerHTML={{ __html: sanitize(post.excerpt) }}
          />
        ) : null}

        {s.author && post.author ? (
          <p className="mt-auto pt-2 body-sm text-ink-muted">By {post.author.name}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

/** A responsive, semantic grid of post cards (KB 09 — 1 / 2 / 3 columns). */
export function PostCardList({ posts, show, headingLevel }: { posts: PostListItem[]; show?: PostCardShow; headingLevel?: 2 | 3 }) {
  return (
    <ul role="list" className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <li key={post.slug} className="flex">
          <PostCard post={post} show={show} headingLevel={headingLevel} />
        </li>
      ))}
    </ul>
  );
}

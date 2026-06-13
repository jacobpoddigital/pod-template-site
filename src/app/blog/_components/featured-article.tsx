import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/ui/button-link";
import { Badge } from "@/ui/badge";
import { sanitize } from "@/lib/sanitize";
import { formatDate, readingTimeLabel } from "@/lib/format";
import type { PostListItem } from "@/lib/cms";

// The index "featured article" (Great White port) — a 50/50 image | content split on
// desktop, image-first stack on mobile (KB 09 order pattern). Excluded from the grid
// below it. Tokens + type scale only.
export function FeaturedArticle({ post }: { post: PostListItem }) {
  const category = post.categories[0];
  const meta = [formatDate(post.date), readingTimeLabel(post.readingTime)].filter(Boolean);

  return (
    <article className="grid grid-cols-1 items-center gap-8 rounded-lg border border-border bg-card lg:grid-cols-2 lg:gap-0">
      {post.image?.sourceUrl ? (
        <div className="relative order-1 aspect-[16/10] overflow-hidden rounded-t-lg lg:order-none lg:aspect-auto lg:h-full lg:rounded-l-lg lg:rounded-tr-none">
          <Image
            src={post.image.sourceUrl}
            alt={post.image.altText ?? ""}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
            priority
          />
        </div>
      ) : null}

      <div className="order-2 flex flex-col items-start gap-4 p-6 lg:order-none lg:p-10">
        <div className="flex items-center gap-3">
          <Badge>Featured</Badge>
          {category ? <Badge variant="muted">{category.name}</Badge> : null}
        </div>
        <h2 className="display-md text-ink">{post.title}</h2>
        {meta.length ? <p className="body-sm text-ink-muted">{meta.join(" · ")}</p> : null}
        {post.excerpt ? (
          <div
            className="body max-w-[65ch] text-ink-muted [&_p]:m-0"
            dangerouslySetInnerHTML={{ __html: sanitize(post.excerpt) }}
          />
        ) : null}
        <ButtonLink href={post.href} icon={ArrowRight} className="mt-2">
          Read the article
        </ButtonLink>
      </div>
    </article>
  );
}

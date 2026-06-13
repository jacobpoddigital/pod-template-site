import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/ui/badge";
import { RichText } from "@/ui/rich-text";
import { formatDate, readingTimeLabel } from "@/lib/format";
import type { BlogPost, PostListItem } from "@/lib/cms";
import { Breadcrumbs, type Crumb } from "./breadcrumbs";
import { AuthorBox } from "./author-box";
import { RelatedPosts } from "./related-posts";

// The single-post article body (workflow/33), split into small pieces so each stays
// under the complexity bar. Rendered + sanitized WP content sits in RichText's prose
// container (max-w-65ch); header/hero/footer are token-driven. The route owns SEO +
// JSON-LD; this owns presentation.

function PostHeader({ post, crumbs }: { post: BlogPost; crumbs: Crumb[] }) {
  const category = post.categories[0];
  const meta = [
    formatDate(post.date),
    readingTimeLabel(post.readingTime),
    post.author ? `By ${post.author.name}` : "",
  ].filter(Boolean);
  return (
    <div className="mx-auto max-w-[70ch]">
      <Breadcrumbs items={crumbs} />
      {category ? (
        <Link href={category.href} className="mb-3 inline-block rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          <Badge variant="muted">{category.name}</Badge>
        </Link>
      ) : null}
      <h1 className="display-lg text-ink">{post.title}</h1>
      {meta.length ? <p className="mt-4 body-sm text-ink-muted">{meta.join(" · ")}</p> : null}
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

export function PostArticle({ post, related, crumbs }: { post: BlogPost; related: PostListItem[]; crumbs: Crumb[] }) {
  return (
    <article>
      <PostHeader post={post} crumbs={crumbs} />
      <PostHero image={post.image} />
      <div className="mx-auto mt-10 max-w-[70ch]">
        <RichText html={post.contentHtml} className="text-ink-muted" />
        <PostTags tags={post.tags} />
        {post.author ? (
          <div className="mt-10">
            <AuthorBox author={post.author} />
          </div>
        ) : null}
      </div>
      <RelatedPosts posts={related} />
    </article>
  );
}

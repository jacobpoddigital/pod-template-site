import type { PostListItem } from "@/lib/cms";
import { PostCardList } from "./post-card";

// A labelled strip of post cards under an article — used for "Related articles"
// (same category) and "More from {author}" (workflow/34). Renders nothing when empty.
// `id` must be unique per strip (aria-labelledby) when two appear on one page.
export function RelatedPosts({
  posts,
  heading = "Related articles",
  id = "related-heading",
}: {
  posts: PostListItem[];
  heading?: string;
  id?: string;
}) {
  if (!posts.length) return null;
  return (
    <section aria-labelledby={id} className="mt-16 border-t border-border pt-12">
      <h2 id={id} className="display-sm mb-8 text-ink">
        {heading}
      </h2>
      <PostCardList posts={posts} show={{ author: false }} headingLevel={3} />
    </section>
  );
}

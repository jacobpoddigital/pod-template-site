import type { PostListItem } from "@/lib/cms";
import { PostCardList } from "./post-card";

// "Related articles" — same-category posts (excluding the current one), via
// getRelatedBlogPosts. Renders nothing when there are none. workflow/34.
export function RelatedPosts({ posts }: { posts: PostListItem[] }) {
  if (!posts.length) return null;
  return (
    <section aria-labelledby="related-heading" className="mt-16 border-t border-border pt-12">
      <h2 id="related-heading" className="display-sm mb-8 text-ink">
        Related articles
      </h2>
      <PostCardList posts={posts} show={{ author: false }} headingLevel={3} />
    </section>
  );
}

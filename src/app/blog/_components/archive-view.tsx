import { Section } from "@/ui/section";
import type { BlogTerm, PaginatedPosts, PostListItem } from "@/lib/cms";
import { ArchiveHero } from "./archive-hero";
import { BlogFilter } from "./blog-filter";
import { FeaturedArticle } from "./featured-article";
import { PostCardList } from "./post-card";
import { BlogPagination } from "./blog-pagination";

// The shared listing view behind /blog, /blog/page/[n], and the category/tag archives
// (workflow/34). Routes stay thin — they fetch + compute SEO, then hand the data here.
// Featured article shows only on page 1 of the main index.
export function ArchiveView({
  hero,
  filter,
  posts,
  basePath,
  featured,
}: {
  hero: { title: string; eyebrow?: string | null; description?: string | null; image?: { sourceUrl: string; altText?: string | null } | null };
  filter: { categories: BlogTerm[]; tags: BlogTerm[]; current?: { type: "category" | "tag"; slug: string } | null };
  posts: PaginatedPosts;
  basePath: string;
  featured?: PostListItem | null;
}) {
  return (
    <>
      <ArchiveHero title={hero.title} eyebrow={hero.eyebrow} description={hero.description} image={hero.image} />

      <Section dataBlock="blog_archive" padding="default">
        <BlogFilter categories={filter.categories} tags={filter.tags} current={filter.current} />

        {featured ? (
          <div className="mt-10">
            <FeaturedArticle post={featured} />
          </div>
        ) : null}

        <div className="mt-10">
          {posts.items.length ? (
            <PostCardList posts={posts.items} />
          ) : (
            <p className="py-16 text-center body-lg text-ink-muted">No articles here yet — check back soon.</p>
          )}
        </div>

        <BlogPagination basePath={basePath} page={posts.page} totalPages={posts.totalPages} />
      </Section>
    </>
  );
}

import { Section } from "@/ui/section";
import { BLOG_BASE, type BlogAuthor, type PaginatedPosts } from "@/lib/cms";
import { siteConfig } from "../../../../site.config";
import { AuthorHero } from "./author-hero";
import { PostCardList } from "./post-card";
import { BlogPagination } from "./blog-pagination";
import { Breadcrumbs, type Crumb } from "./breadcrumbs";
import { AuthorJsonLd } from "./blog-jsonld";

// Author archive (workflow/34): hero (photo/role/bio/social/team link) → that author's
// posts → pagination, with ProfilePage/Person JSON-LD. Route stays thin.
export function AuthorArchive({ author, posts }: { author: BlogAuthor; posts: PaginatedPosts }) {
  const crumbs: Crumb[] = [
    { label: "Home", href: "/" },
    { label: siteConfig.blog.title, href: BLOG_BASE },
    { label: author.name },
  ];

  return (
    <>
      <AuthorHero author={author} postCount={posts.total} />
      <Section dataBlock="author_archive" padding="default">
        <Breadcrumbs items={crumbs} />
        {posts.items.length ? (
          <PostCardList posts={posts.items} show={{ author: false }} />
        ) : (
          <p className="py-16 text-center body-lg text-ink-muted">No articles by this author yet.</p>
        )}
        <BlogPagination basePath={author.href} page={posts.page} totalPages={posts.totalPages} />
      </Section>
      <AuthorJsonLd author={author} breadcrumb={crumbs.map((c) => ({ label: c.label, path: c.href ?? author.href }))} />
    </>
  );
}

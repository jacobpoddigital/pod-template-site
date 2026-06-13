import { getAuthorBySlug, getBlogPosts, type BlogAuthor, type PaginatedPosts } from "@/lib/cms";
import { siteConfig } from "../../../../site.config";

// Loader for /blog/author/[slug] (+ /page/[n]) (workflow/34). Returns null when the
// author doesn't exist (route → notFound). Author pages list one author's posts.
export interface AuthorData {
  author: BlogAuthor;
  posts: PaginatedPosts;
}

export async function loadAuthorArchive(slug: string, page: number): Promise<AuthorData | null> {
  const [author, posts] = await Promise.all([
    getAuthorBySlug(slug),
    getBlogPosts({ page, perPage: siteConfig.blog.perPage, authorSlug: slug }),
  ]);
  if (!author) return null;
  return { author, posts };
}

import {
  getBlogPosts,
  getCategoryBySlug,
  getTagBySlug,
  getCategories,
  getTags,
  type BlogTerm,
  type PaginatedPosts,
} from "@/lib/cms";
import { siteConfig } from "../../../../site.config";

// Shared loader for /blog/category/[slug] + /blog/tag/[slug] (and their /page/[n]).
// Returns null when the term doesn't exist (route → notFound). Categories use the
// term's own ACF banner image; tags fall back to the site-wide blog banner.

export interface TaxonomyData {
  term: BlogTerm;
  categories: BlogTerm[];
  tags: BlogTerm[];
  posts: PaginatedPosts;
  current: { type: "category" | "tag"; slug: string };
}

async function load(
  type: "category" | "tag",
  slug: string,
  page: number,
): Promise<TaxonomyData | null> {
  const perPage = siteConfig.blog.perPage;
  const [term, categories, tags] = await Promise.all([
    type === "category" ? getCategoryBySlug(slug) : getTagBySlug(slug),
    getCategories(),
    getTags(),
  ]);
  if (!term) return null;
  const posts = await getBlogPosts({
    page,
    perPage,
    categorySlug: type === "category" ? slug : null,
    tagSlug: type === "tag" ? slug : null,
  });
  return { term, categories, tags, posts, current: { type, slug } };
}

export const loadCategoryArchive = (slug: string, page: number) => load("category", slug, page);
export const loadTagArchive = (slug: string, page: number) => load("tag", slug, page);

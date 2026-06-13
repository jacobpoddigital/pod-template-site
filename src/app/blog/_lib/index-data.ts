import { getBlogPosts, getCategories, getTags, type PaginatedPosts, type PostListItem, type BlogTerm } from "@/lib/cms";
import { siteConfig } from "../../../../site.config";

// Index-page data loader (workflow/33). The featured post (newest) is excluded from
// the grid on EVERY page so it's shown once as the banner and never duplicated; the
// grid is therefore "all posts except the featured one", paginated. Shared by
// /blog and /blog/page/[n] so the two routes stay thin + identical.

export interface IndexData {
  categories: BlogTerm[];
  tags: BlogTerm[];
  featured: PostListItem | null;
  posts: PaginatedPosts;
}

async function featuredId(): Promise<{ featured: PostListItem | null; excludeIds: number[] }> {
  if (!siteConfig.blog.featured) return { featured: null, excludeIds: [] };
  const top = await getBlogPosts({ page: 1, perPage: 1 });
  const featured = top.items[0] ?? null;
  return { featured, excludeIds: featured ? [featured.databaseId] : [] };
}

export async function loadIndexPage(page: number): Promise<IndexData> {
  const perPage = siteConfig.blog.perPage;
  const [categories, tags, { featured, excludeIds }] = await Promise.all([getCategories(), getTags(), featuredId()]);
  const posts = await getBlogPosts({ page, perPage, excludeIds });
  // The featured banner only appears on page 1.
  return { categories, tags, featured: page === 1 ? featured : null, posts };
}

/** Total index pages (accounts for the excluded featured post). Drives static params. */
export async function indexTotalPages(): Promise<number> {
  const { excludeIds } = await featuredId();
  const posts = await getBlogPosts({ page: 1, perPage: siteConfig.blog.perPage, excludeIds });
  return posts.totalPages;
}

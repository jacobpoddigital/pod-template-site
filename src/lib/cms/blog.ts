import { cmsRequest } from "./client";
import { toSeo } from "./seo";
import { POSTS_TAG } from "./cache-tags";
import {
  BlogPostsDocument,
  PostBySlugDocument,
  PostSlugsDocument,
  AllCategoriesDocument,
  CategoryBySlugDocument,
  AllTagsDocument,
  TagBySlugDocument,
  AuthorBySlugDocument,
  AuthorSlugsDocument,
} from "./generated/graphql";
import type { BlogPostsQuery, PostBySlugQuery, AuthorBySlugQuery } from "./generated/graphql";
import type { BlogTerm, BlogAuthor, BlogAuthorSocial, PostListItem, BlogPost, PaginatedPosts, SeoImage } from "./types";

// --- The standard blog (workflow/34). Rendered-WP-content model: getBlogPosts
// paginates via the WPGraphQL Offset Pagination addon; getPost returns one article;
// the taxonomy helpers feed the filter + archive routes. All hrefs are FRONTEND paths
// (we own /blog/*, not WP's uri). cms-internal — re-exported from the public index. ---

/** Blog mount point + posts-per-page. Change BLOG_BASE + the app/blog folder to remount. */
export const BLOG_BASE = "/blog";
export const BLOG_PER_PAGE = 12;

const postHref = (slug: string) => `${BLOG_BASE}/${slug}`;
const categoryHref = (slug: string) => `${BLOG_BASE}/category/${slug}`;
const tagHref = (slug: string) => `${BLOG_BASE}/tag/${slug}`;
const authorHref = (slug: string) => `${BLOG_BASE}/author/${slug}`;

// --- Flat normalizers (kept tiny so the public functions stay under the complexity bar) ---

/** ceil(words / 200) reading time from rendered HTML; null when no content fetched. */
function readingTime(html?: string | null): number | null {
  if (!html) return null;
  const words = html.replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/gi, " ").split(/\s+/).filter(Boolean).length;
  return words > 0 ? Math.max(1, Math.ceil(words / 200)) : null;
}

type ImgNode = { sourceUrl?: string | null; altText?: string | null; mediaDetails?: { width?: number | null; height?: number | null } | null } | null | undefined;
function flatImage(node: ImgNode) {
  return node?.sourceUrl ? { sourceUrl: node.sourceUrl, altText: node.altText } : null;
}
function flatImageDetailed(node: ImgNode): SeoImage | null {
  return node?.sourceUrl ? { sourceUrl: node.sourceUrl, altText: node.altText, width: node.mediaDetails?.width, height: node.mediaDetails?.height } : null;
}

type RawSocial = { label?: string | null; url?: string | null };
function mapSocial(arr: readonly RawSocial[] | null | undefined): BlogAuthorSocial[] {
  return (arr ?? []).filter((s) => s.url).map((s) => ({ label: s.label ?? "", href: s.url! }));
}

type RawAuthor = {
  name?: string | null;
  slug?: string | null;
  description?: string | null;
  avatar?: { url?: string | null } | null;
  roleTitle?: string | null;
  teamProfileUrl?: string | null;
  social?: readonly RawSocial[] | null;
};
type AuthorEdge = { node?: RawAuthor | null } | null | undefined;

function flatAuthorSummary(edge: AuthorEdge) {
  const a = edge?.node;
  return a?.name ? { name: a.name, slug: a.slug ?? "", href: authorHref(a.slug ?? "") } : null;
}
function flatAuthorFull(edge: AuthorEdge): BlogAuthor | null {
  const a = edge?.node;
  if (!a?.name) return null;
  const slug = a.slug ?? "";
  return {
    name: a.name,
    slug,
    href: authorHref(slug),
    bio: a.description,
    avatarUrl: a.avatar?.url,
    roleTitle: a.roleTitle,
    teamUrl: a.teamProfileUrl,
    social: mapSocial(a.social),
  };
}

type TermNode = { name?: string | null; slug?: string | null };
function toCategoryLinks(nodes: readonly TermNode[] | undefined) {
  return (nodes ?? []).filter((t) => t.slug).map((t) => ({ name: t.name ?? t.slug!, slug: t.slug!, href: categoryHref(t.slug!) }));
}
function toTagLinks(nodes: readonly TermNode[] | undefined) {
  return (nodes ?? []).filter((t) => t.slug).map((t) => ({ name: t.name ?? t.slug!, slug: t.slug!, href: tagHref(t.slug!) }));
}

type RawPostNode = NonNullable<BlogPostsQuery["posts"]>["nodes"][number];
function toPostListItem(n: RawPostNode): PostListItem {
  const slug = n.slug ?? "";
  return {
    databaseId: n.databaseId,
    title: n.title ?? "",
    slug,
    href: postHref(slug),
    date: n.date,
    excerpt: n.excerpt,
    image: flatImage(n.featuredImage?.node),
    author: flatAuthorSummary(n.author),
    categories: toCategoryLinks(n.categories?.nodes),
    readingTime: readingTime(n.content),
  };
}

// --- Public API ---

export interface BlogPostsOpts {
  /** 1-based page number. */
  page?: number;
  perPage?: number;
  categorySlug?: string | null;
  tagSlug?: string | null;
  authorSlug?: string | null;
  search?: string | null;
  /** Post databaseIds to exclude (the featured post on every page, or the current post). */
  excludeIds?: number[];
}

function blogVars(opts: BlogPostsOpts) {
  const perPage = opts.perPage ?? BLOG_PER_PAGE;
  const page = Math.max(1, opts.page ?? 1);
  return {
    perPage,
    page,
    vars: {
      size: perPage,
      offset: (page - 1) * perPage,
      category: opts.categorySlug ?? null,
      tag: opts.tagSlug ?? null,
      author: opts.authorSlug ?? null,
      search: opts.search ?? null,
      notIn: opts.excludeIds?.map(String) ?? null,
    },
  };
}

/** One page of posts + the totals for path-based pagination. Needs the WPGraphQL
 *  Offset Pagination addon on WP (see provision.sh). */
export async function getBlogPosts(opts: BlogPostsOpts = {}): Promise<PaginatedPosts> {
  const { perPage, page, vars } = blogVars(opts);
  const data = await cmsRequest(BlogPostsDocument, vars, [POSTS_TAG]);
  const items = (data.posts?.nodes ?? []).map(toPostListItem);
  const total = data.posts?.pageInfo?.offsetPagination?.total ?? items.length;
  return { items, total, page, perPage, totalPages: Math.max(1, Math.ceil(total / perPage)) };
}

/** Related posts for the article footer — newest in the same category, with the current
 *  post (and any other excluded ids, e.g. the "More from author" strip) dropped (§18). */
export async function getRelatedBlogPosts(opts: { categorySlug?: string | null; excludeIds: number[]; first?: number }): Promise<PostListItem[]> {
  const want = opts.first ?? 3;
  // Over-fetch so excluded ids still leave `want`.
  const { items } = await getBlogPosts({ page: 1, perPage: want + opts.excludeIds.length, categorySlug: opts.categorySlug, excludeIds: opts.excludeIds });
  return items.slice(0, want);
}

/** "More from this author" — the author's other recent posts, current one excluded. */
export async function getMoreFromAuthor(opts: { authorSlug: string; excludeId: number; first?: number }): Promise<PostListItem[]> {
  const want = opts.first ?? 3;
  const { items } = await getBlogPosts({ page: 1, perPage: want, authorSlug: opts.authorSlug, excludeIds: [opts.excludeId] });
  return items.slice(0, want);
}

/** Every published post slug — generateStaticParams for /blog/[slug] + page-count math. */
export async function getPostSlugs(): Promise<string[]> {
  const data = await cmsRequest(PostSlugsDocument, {}, [POSTS_TAG]);
  return (data.posts?.nodes ?? []).map((n) => n.slug).filter((s): s is string => Boolean(s));
}

type RawSinglePost = NonNullable<PostBySlugQuery["post"]>;
function toBlogPost(post: RawSinglePost, slug: string): BlogPost {
  const finalSlug = post.slug ?? slug;
  return {
    databaseId: post.databaseId,
    title: post.title ?? slug,
    slug: finalSlug,
    href: postHref(finalSlug),
    date: post.date,
    modified: post.modified,
    contentHtml: post.content ?? "",
    image: flatImageDetailed(post.featuredImage?.node),
    author: flatAuthorFull(post.author),
    categories: toCategoryLinks(post.categories?.nodes),
    tags: toTagLinks(post.tags?.nodes),
    readingTime: readingTime(post.content),
    seo: toSeo(post.seo),
  };
}

function fetchPost(slug: string, opts: { preview?: boolean }) {
  return cmsRequest(PostBySlugDocument, { slug }, [POSTS_TAG, `post:${slug}`], opts);
}

/** A single post for the article page. Null when the slug doesn't exist (route 404s).
 *  `preview` bypasses ISR for draft preview (§4). */
export async function getPost(slug: string, opts: { preview?: boolean } = {}): Promise<BlogPost | null> {
  const data = await fetchPost(slug, opts);
  return data.post ? toBlogPost(data.post, slug) : null;
}

/** All non-empty categories — the filter UI + category archive static params. */
export async function getCategories(): Promise<BlogTerm[]> {
  const data = await cmsRequest(AllCategoriesDocument, {}, [POSTS_TAG]);
  return (data.categories?.nodes ?? [])
    .filter((c) => c.slug)
    .map((c) => ({ name: c.name ?? c.slug!, slug: c.slug!, href: categoryHref(c.slug!), count: c.count ?? 0, image: flatImage(c.categoryImage) }));
}

/** One category by slug — the archive banner + post count. Null when missing. */
export async function getCategoryBySlug(slug: string): Promise<BlogTerm | null> {
  const data = await cmsRequest(CategoryBySlugDocument, { slug }, [POSTS_TAG]);
  const c = data.category;
  if (!c?.slug) return null;
  return { name: c.name ?? c.slug, slug: c.slug, href: categoryHref(c.slug), count: c.count ?? 0, description: c.description, image: flatImageDetailed(c.categoryImage) };
}

/** All non-empty tags — the filter UI's tag list + tag archive static params. */
export async function getTags(): Promise<BlogTerm[]> {
  const data = await cmsRequest(AllTagsDocument, {}, [POSTS_TAG]);
  return (data.tags?.nodes ?? [])
    .filter((t) => t.slug)
    .map((t) => ({ name: t.name ?? t.slug!, slug: t.slug!, href: tagHref(t.slug!), count: t.count ?? 0 }));
}

/** One tag by slug — the archive header + post count. Null when missing. */
export async function getTagBySlug(slug: string): Promise<BlogTerm | null> {
  const data = await cmsRequest(TagBySlugDocument, { slug }, [POSTS_TAG]);
  const t = data.tag;
  if (!t?.slug) return null;
  return { name: t.name ?? t.slug, slug: t.slug, href: tagHref(t.slug), count: t.count ?? 0, description: t.description };
}

type RawAuthorNode = NonNullable<AuthorBySlugQuery["user"]>;
function toAuthorProfile(u: RawAuthorNode): BlogAuthor {
  const slug = u.slug ?? "";
  return {
    name: u.name ?? slug,
    slug,
    href: authorHref(slug),
    bio: u.description,
    avatarUrl: u.avatar?.url,
    image: flatImage(u.profileImage),
    roleTitle: u.roleTitle,
    teamUrl: u.teamProfileUrl,
    social: mapSocial(u.social),
  };
}

/** One author (WP User) by slug — the author archive header + E-E-A-T Person schema.
 *  Null when the slug doesn't exist (route 404s). */
export async function getAuthorBySlug(slug: string): Promise<BlogAuthor | null> {
  const data = await cmsRequest(AuthorBySlugDocument, { slug }, [POSTS_TAG]);
  return data.user ? toAuthorProfile(data.user) : null;
}

/** Slugs of authors with published posts — generateStaticParams for /blog/author/[slug]. */
export async function getAuthorSlugs(): Promise<string[]> {
  const data = await cmsRequest(AuthorSlugsDocument, {}, [POSTS_TAG]);
  return (data.users?.nodes ?? []).map((n) => n.slug).filter((s): s is string => Boolean(s));
}

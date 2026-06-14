import type { TypedDocumentNode } from "@graphql-typed-document-node/core";
import {
  PageBySlugDocument,
  AllPagesDocument,
  AllPostsDocument,
  RecentPostsDocument,
  SiteChromeDocument,
  BlogPostsDocument,
  PostBySlugDocument,
  PostSlugsDocument,
  AllCategoriesDocument,
  CategoryBySlugDocument,
  AllTagsDocument,
  TagBySlugDocument,
  AuthorBySlugDocument,
  AuthorSlugsDocument,
  CaseStudiesDocument,
  CaseStudyBySlugDocument,
  CaseStudySlugsDocument,
} from "../generated/graphql";
import { mockHome, mockPosts, mockChrome } from "./fixtures";
import { mockBlogPosts, mockCategories, mockTags, mockAuthors } from "./blog";
import { mockCaseStudies } from "./case-studies";

// DEV-ONLY GraphQL mock (ADR 0013 amendment). Serves the committed-schema queries
// from curated fixtures so the template builds + renders with no WordPress. It is
// NOT shipped: client.ts imports this dynamically only when WPGRAPHQL_URL is unset
// or CMS_MODE=mock. A document→handler table keyed by document identity (===) — both
// sides import the same const. Add a query? Add one row.

type Vars = Record<string, unknown>;

// Blog index/archives: filter + offset-paginate the fixtures so /blog, /blog/page/[n]
// and the category/tag archives all render real pages offline (workflow/34).
function blogPostsHandler(variables: Vars) {
  const { offset = 0, size = 12, category, tag, author, search, notIn } = variables as {
    offset?: number;
    size?: number;
    category?: string | null;
    tag?: string | null;
    author?: string | null;
    search?: string | null;
    notIn?: string[] | null;
  };
  const excluded = new Set((notIn ?? []).map(String));
  const filtered = mockBlogPosts.filter((p) => {
    if (excluded.has(String(p.databaseId))) return false;
    if (category && !p.categories.nodes.some((c) => c.slug === category)) return false;
    if (tag && !p.tags.nodes.some((t) => t.slug === tag)) return false;
    if (author && p.author.node.slug !== author) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  return { posts: { pageInfo: { offsetPagination: { total: filtered.length } }, nodes: filtered.slice(offset, offset + size) } };
}

// Case Study CPT index: offset-paginate the fixtures, same contract as the blog —
// proves the registered CPT renders offline through the identical mock seam.
function caseStudiesHandler(variables: Vars) {
  const { offset = 0, size = 12, notIn } = variables as { offset?: number; size?: number; notIn?: string[] | null };
  const excluded = new Set((notIn ?? []).map(String));
  const filtered = mockCaseStudies.filter((c) => !excluded.has(String(c.databaseId)));
  return { caseStudies: { pageInfo: { offsetPagination: { total: filtered.length } }, nodes: filtered.slice(offset, offset + size) } };
}

const HANDLERS: [unknown, (v: Vars) => unknown][] = [
  [PageBySlugDocument, (v) => {
    const slug = v.slug as string | undefined;
    return slug === "home" || slug === "/" || slug === "" ? mockHome : { page: null };
  }],
  [AllPagesDocument, () => ({ pages: { nodes: [{ databaseId: 1, title: "Home", slug: "home", uri: "/" }] } })],
  [AllPostsDocument, () => ({ posts: { nodes: mockBlogPosts.map((p) => ({ databaseId: p.databaseId, slug: p.slug, uri: p.uri, date: p.date, modified: p.modified })) } })],
  [RecentPostsDocument, () => ({ posts: { nodes: mockPosts } })],
  [BlogPostsDocument, blogPostsHandler],
  [PostBySlugDocument, (v) => ({ post: mockBlogPosts.find((p) => p.slug === v.slug) ?? null })],
  [PostSlugsDocument, () => ({ posts: { nodes: mockBlogPosts.map((p) => ({ slug: p.slug, date: p.date })) } })],
  [AllCategoriesDocument, () => ({ categories: { nodes: mockCategories } })],
  [CategoryBySlugDocument, (v) => ({ category: mockCategories.find((c) => c.slug === v.slug) ?? null })],
  [AllTagsDocument, () => ({ tags: { nodes: mockTags } })],
  [TagBySlugDocument, (v) => ({ tag: mockTags.find((t) => t.slug === v.slug) ?? null })],
  [AuthorBySlugDocument, (v) => ({ user: mockAuthors.find((a) => a.slug === v.slug) ?? null })],
  [AuthorSlugsDocument, () => ({ users: { nodes: mockAuthors.map((a) => ({ slug: a.slug })) } })],
  [CaseStudiesDocument, caseStudiesHandler],
  [CaseStudyBySlugDocument, (v) => ({ caseStudy: mockCaseStudies.find((c) => c.slug === v.slug) ?? null })],
  [CaseStudySlugsDocument, () => ({ caseStudies: { nodes: mockCaseStudies.map((c) => ({ slug: c.slug, date: c.date })) } })],
  [SiteChromeDocument, () => mockChrome],
];

export async function mockRequest<TResult>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  document: TypedDocumentNode<TResult, any>,
  variables: Vars,
): Promise<TResult> {
  const match = HANDLERS.find(([doc]) => (document as unknown) === doc);
  return (match ? match[1](variables) : {}) as TResult;
}

import type { Metadata } from "next";
import { Section } from "@/ui/section";
import { getBlogPosts, type PaginatedPosts } from "@/lib/cms";
import { BlogSearchForm } from "../_components/blog-search-form";
import { PostCardList } from "../_components/post-card";

// /blog/search?q= — full-text search over post title + content (workflow/34). Dynamic
// (depends on the query) and NOINDEX (internal search results shouldn't be indexed —
// standard SEO hygiene). The form is a no-JS GET form; results paginate to the first 24.
export const dynamic = "force-dynamic";

const PER_PAGE = 24;

function readQuery(raw: string | string[] | undefined): string {
  return (Array.isArray(raw) ? raw[0] ?? "" : raw ?? "").trim();
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }): Promise<Metadata> {
  const q = readQuery((await searchParams).q);
  return { title: q ? `Search: ${q}` : "Search the blog", robots: { index: false, follow: true } };
}

function SearchResults({ result, q }: { result: PaginatedPosts; q: string }) {
  if (!result.items.length) {
    return <p className="py-12 text-center body-lg text-ink-muted">No articles match “{q}”. Try a different term.</p>;
  }
  const shown = result.total > result.items.length ? `Showing the first ${result.items.length} of ${result.total}` : `${result.total} result${result.total === 1 ? "" : "s"}`;
  return (
    <>
      <p className="mb-8 body text-ink-muted">{shown} for “{q}”</p>
      <PostCardList posts={result.items} />
    </>
  );
}

export default async function BlogSearchPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const q = readQuery((await searchParams).q);
  const result = q ? await getBlogPosts({ search: q, perPage: PER_PAGE }) : null;

  return (
    <Section dataBlock="blog_search" padding="default">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="display-md text-ink">Search the blog</h1>
        <p className="mt-3 body-lg text-ink-muted">Find articles by title or content.</p>
        <div className="mt-6 flex justify-center">
          <BlogSearchForm defaultValue={q} />
        </div>
      </div>
      {result ? (
        <div className="mt-12">
          <SearchResults result={result} q={q} />
        </div>
      ) : null}
    </Section>
  );
}

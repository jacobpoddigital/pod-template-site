import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBlogPosts, getTags, getTagBySlug } from "@/lib/cms";
import { siteConfig } from "../../../../../../../site.config";
import { TaxonomyArchive } from "../../../../_components/taxonomy-archive";
import { loadTagArchive } from "../../../../_lib/taxonomy";
import { archiveMetadata } from "../../../../_lib/metadata";

// /blog/tag/[slug]/page/[n] — paginated tag archive. workflow/33.
export const dynamic = "error";
export const dynamicParams = false;

interface Props {
  params: Promise<{ slug: string; n: string }>;
}

export async function generateStaticParams() {
  const tags = await getTags();
  const perPage = siteConfig.blog.perPage;
  const params: { slug: string; n: string }[] = [];
  for (const t of tags) {
    const posts = await getBlogPosts({ page: 1, perPage, tagSlug: t.slug });
    for (let n = 2; n <= posts.totalPages; n++) params.push({ slug: t.slug, n: String(n) });
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, n } = await params;
  const term = await getTagBySlug(slug);
  if (!term) return {};
  return archiveMetadata({ title: term.name, description: term.description, path: term.href, page: Number(n) });
}

export default async function TagArchivePagedPage({ params }: Props) {
  const { slug, n } = await params;
  const page = Number(n);
  if (!Number.isInteger(page) || page < 2) notFound();
  const data = await loadTagArchive(slug, page);
  if (!data || page > data.posts.totalPages) notFound();
  return <TaxonomyArchive data={data} />;
}

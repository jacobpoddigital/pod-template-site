import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAuthorBySlug, getAuthorSlugs, getBlogPosts } from "@/lib/cms";
import { siteConfig } from "../../../../../../../site.config";
import { AuthorArchive } from "../../../../_components/author-archive";
import { loadAuthorArchive } from "../../../../_lib/author";
import { archiveMetadata } from "../../../../_lib/metadata";

// /blog/author/[slug]/page/[n] — paginated author archive (workflow/34).
export const dynamic = "error";
export const dynamicParams = false;

interface Props {
  params: Promise<{ slug: string; n: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAuthorSlugs();
  const perPage = siteConfig.blog.perPage;
  const params: { slug: string; n: string }[] = [];
  for (const slug of slugs) {
    const posts = await getBlogPosts({ page: 1, perPage, authorSlug: slug });
    for (let n = 2; n <= posts.totalPages; n++) params.push({ slug, n: String(n) });
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, n } = await params;
  const author = await getAuthorBySlug(slug);
  if (!author) return {};
  return archiveMetadata({ title: `Posts by ${author.name}`, description: author.bio, path: author.href, page: Number(n) });
}

export default async function AuthorArchivePagedPage({ params }: Props) {
  const { slug, n } = await params;
  const page = Number(n);
  if (!Number.isInteger(page) || page < 2) notFound();
  const data = await loadAuthorArchive(slug, page);
  if (!data || page > data.posts.totalPages) notFound();
  return <AuthorArchive author={data.author} posts={data.posts} />;
}

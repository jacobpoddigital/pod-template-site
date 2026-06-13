import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAuthorBySlug, getAuthorSlugs } from "@/lib/cms";
import { AuthorArchive } from "../../_components/author-archive";
import { loadAuthorArchive } from "../../_lib/author";
import { archiveMetadata } from "../../_lib/metadata";

// /blog/author/[slug] — author archive (page 1), indexable E-E-A-T profile (workflow/34).
export const dynamic = "error";
export const dynamicParams = false;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAuthorSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);
  if (!author) return {};
  return archiveMetadata({ title: `Posts by ${author.name}`, description: author.bio, path: author.href, page: 1 });
}

export default async function AuthorArchivePage({ params }: Props) {
  const { slug } = await params;
  const data = await loadAuthorArchive(slug, 1);
  if (!data) notFound();
  return <AuthorArchive author={data.author} posts={data.posts} />;
}

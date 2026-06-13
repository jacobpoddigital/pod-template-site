import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTags, getTagBySlug } from "@/lib/cms";
import { TaxonomyArchive } from "../../_components/taxonomy-archive";
import { loadTagArchive } from "../../_lib/taxonomy";
import { archiveMetadata } from "../../_lib/metadata";

// /blog/tag/[slug] — tag archive (page 1). workflow/33.
export const dynamic = "error";
export const dynamicParams = false;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const tags = await getTags();
  return tags.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const term = await getTagBySlug(slug);
  if (!term) return {};
  return archiveMetadata({ title: term.name, description: term.description, path: term.href, page: 1 });
}

export default async function TagArchivePage({ params }: Props) {
  const { slug } = await params;
  const data = await loadTagArchive(slug, 1);
  if (!data) notFound();
  return <TaxonomyArchive data={data} />;
}

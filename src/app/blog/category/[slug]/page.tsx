import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategories, getCategoryBySlug } from "@/lib/cms";
import { TaxonomyArchive } from "../../_components/taxonomy-archive";
import { loadCategoryArchive } from "../../_lib/taxonomy";
import { archiveMetadata } from "../../_lib/metadata";

// /blog/category/[slug] — category archive (page 1). workflow/34.
export const dynamic = "error";
export const dynamicParams = false;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const term = await getCategoryBySlug(slug);
  if (!term) return {};
  return archiveMetadata({ title: term.name, description: term.description, path: term.href, page: 1 });
}

export default async function CategoryArchivePage({ params }: Props) {
  const { slug } = await params;
  const data = await loadCategoryArchive(slug, 1);
  if (!data) notFound();
  return <TaxonomyArchive data={data} />;
}

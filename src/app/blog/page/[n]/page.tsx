import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BLOG_BASE } from "@/lib/cms";
import { siteConfig } from "../../../../../site.config";
import { ArchiveView } from "../../_components/archive-view";
import { loadIndexPage, indexTotalPages } from "../../_lib/index-data";
import { archiveMetadata } from "../../_lib/metadata";

// /blog/page/[n] — path-based pagination (SEO-clean; boilerplate §E E6). Page 1 lives
// at /blog, so static params start at 2. workflow/34.
export const dynamic = "error";
export const dynamicParams = false;

interface Props {
  params: Promise<{ n: string }>;
}

export async function generateStaticParams() {
  const total = await indexTotalPages();
  return Array.from({ length: Math.max(0, total - 1) }, (_, i) => ({ n: String(i + 2) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { n } = await params;
  return archiveMetadata({ title: siteConfig.blog.title, description: siteConfig.blog.intro, path: BLOG_BASE, page: Number(n) });
}

export default async function BlogIndexPagedPage({ params }: Props) {
  const page = Number((await params).n);
  if (!Number.isInteger(page) || page < 2) notFound();
  const { categories, tags, posts } = await loadIndexPage(page);
  if (page > posts.totalPages) notFound();
  return (
    <ArchiveView
      hero={{ title: siteConfig.blog.title, description: siteConfig.blog.intro, image: siteConfig.blog.bannerImage ? { sourceUrl: siteConfig.blog.bannerImage } : null }}
      filter={{ categories, tags }}
      posts={posts}
      basePath={BLOG_BASE}
    />
  );
}

import type { Metadata } from "next";
import { BLOG_BASE } from "@/lib/cms";
import { siteConfig } from "../../../site.config";
import { ArchiveView } from "./_components/archive-view";
import { loadIndexPage } from "./_lib/index-data";
import { archiveMetadata } from "./_lib/metadata";

// /blog — the index (page 1). SSG; new posts appear on the next build/ISR (the
// resilience rule, like the page route). workflow/33.
export const dynamic = "error";

export function generateMetadata(): Metadata {
  return archiveMetadata({ title: siteConfig.blog.title, description: siteConfig.blog.intro, path: BLOG_BASE, page: 1 });
}

export default async function BlogIndexPage() {
  const { categories, tags, featured, posts } = await loadIndexPage(1);
  return (
    <ArchiveView
      hero={{ title: siteConfig.blog.title, description: siteConfig.blog.intro, image: siteConfig.blog.bannerImage ? { sourceUrl: siteConfig.blog.bannerImage } : null }}
      filter={{ categories, tags }}
      featured={featured}
      posts={posts}
      basePath={BLOG_BASE}
    />
  );
}

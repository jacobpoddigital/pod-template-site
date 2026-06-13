import type { MetadataRoute } from "next";
import { getPages, getAllPosts, BLOG_BASE } from "@/lib/cms";
import { siteConfig } from "../../site.config";

// The ONLY sitemap — Yoast's own XML sitemap stays DISABLED on the WP origin (it points
// at WP URLs; we own the frontend sitemap). CMS-driven: every published page + post,
// frontend URLs only (boilerplate §6). Posts resolve at /blog/<slug> (the standard blog,
// workflow/33). See docs/seo.md + docs/blog.md.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [pages, posts] = await Promise.all([getPages(), getAllPosts()]);

  const pageEntries: MetadataRoute.Sitemap = pages.map((page) => ({
    url: page.slug === "home" ? siteConfig.url : `${siteConfig.url}/${page.slug}`,
    changeFrequency: "weekly" as const,
    priority: page.slug === "home" ? 1 : 0.7,
  }));

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${siteConfig.url}${BLOG_BASE}/${post.slug}`,
    lastModified: post.modified ?? post.date ?? undefined,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [...pageEntries, ...postEntries];
}

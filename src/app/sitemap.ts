import type { MetadataRoute } from "next";
import { getPages, getAllPosts } from "@/lib/cms";
import { siteConfig } from "../../site.config";

// The ONLY sitemap — Yoast's own XML sitemap stays DISABLED on the WP origin (it points
// at WP URLs; we own the frontend sitemap). CMS-driven: every published page + post,
// frontend URLs only (boilerplate §6). NOTE: posts use their WP `uri` — the template
// ships pages-only routes, so a blog needs a matching post route (e.g. app/blog/[slug])
// before post URLs resolve. See docs/seo.md.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [pages, posts] = await Promise.all([getPages(), getAllPosts()]);

  const pageEntries: MetadataRoute.Sitemap = pages.map((page) => ({
    url: page.slug === "home" ? siteConfig.url : `${siteConfig.url}/${page.slug}`,
    changeFrequency: "weekly" as const,
    priority: page.slug === "home" ? 1 : 0.7,
  }));

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    // uri is a path with leading/trailing slashes (e.g. "/blog/post/"); join cleanly.
    url: `${siteConfig.url}/${post.uri.replace(/^\/|\/$/g, "")}`,
    lastModified: post.modified ?? post.date ?? undefined,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [...pageEntries, ...postEntries];
}

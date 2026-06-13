import { getPages } from "@/lib/cms";
import { siteConfig } from "../../../site.config";

// /llms.txt — the emerging convention (an llms.txt is to AI what robots.txt is to crawlers):
// a curated, plain-markdown index of the site so LLMs/answer engines can find the canonical
// pages without scraping nav. Built from the published page list. Complements the JSON-LD
// (Organization/WebSite/FAQPage) and AI-crawler-allowed robots.ts. See docs/seo.md §GEO.
export const dynamic = "error"; // static; rebuilt on deploy / ISR like the sitemap

export async function GET() {
  const pages = await getPages();
  const links = pages
    .filter((p) => p.slug && p.slug !== "home")
    .map((p) => `- [${p.title}](${siteConfig.url}/${p.slug})`)
    .join("\n");

  const body = `# ${siteConfig.name}

> ${siteConfig.description}

## Pages
- [${siteConfig.name}](${siteConfig.url}): Home
${links}
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

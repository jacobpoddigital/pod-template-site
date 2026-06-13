import { siteConfig } from "../../../../site.config";
import { ArchiveView } from "./archive-view";
import type { TaxonomyData } from "../_lib/taxonomy";

// Renders a category or tag archive (workflow/33). Category archives use the term's
// own ACF banner image; tags fall back to the site-wide blog banner. basePath = the
// term's frontend archive path, so pagination resolves to /…/page/[n].
export function TaxonomyArchive({ data }: { data: TaxonomyData }) {
  const { term, categories, tags, posts, current } = data;
  const siteBanner = siteConfig.blog.bannerImage ? { sourceUrl: siteConfig.blog.bannerImage } : null;
  const image = current.type === "category" ? term.image ?? siteBanner : siteBanner;
  const eyebrow = current.type === "category" ? "Category" : "Topic";

  return (
    <ArchiveView
      hero={{ title: term.name, eyebrow, description: term.description, image }}
      filter={{ categories, tags, current }}
      posts={posts}
      basePath={term.href}
    />
  );
}

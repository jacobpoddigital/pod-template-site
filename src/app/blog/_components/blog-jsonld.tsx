import { siteConfig } from "../../../../site.config";
import { SeoSchema } from "../../seo-schema";
import { ORG_ID } from "../../structured-data";
import type { BlogPost, BlogAuthor } from "@/lib/cms";

// Blog JSON-LD (workflow/04 §4 — server-rendered so AI crawlers parse without JS).
// Posts: if Yoast supplied a schema graph (seo.schemaRaw, which already includes
// Article + BreadcrumbList), emit THAT and nothing else (no duplicate Article).
// Otherwise build Article + BreadcrumbList ourselves from the normalized post, so the
// blog still ships valid structured data with no SEO plugin. Archives emit a
// BreadcrumbList. `<` is escaped so a stray "</script>" can't break out of the tag.

const SITE = siteConfig.url.replace(/\/$/, "");
const abs = (path: string) => (path.startsWith("http") ? path : `${SITE}${path}`);

function Ld({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export interface Crumb {
  label: string;
  path: string;
}

export function BreadcrumbJsonLd({ items }: { items: Crumb[] }) {
  return (
    <Ld
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((c, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: c.label,
          item: abs(c.path),
        })),
      }}
    />
  );
}

function articleData(post: BlogPost) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    datePublished: post.date ?? undefined,
    dateModified: post.modified ?? post.date ?? undefined,
    image: post.image?.sourceUrl ? [post.image.sourceUrl] : undefined,
    author: post.author ? { "@type": "Person", name: post.author.name } : undefined,
    // Reference the single site-wide Organization node (one @id, no duplicate org).
    publisher: { "@id": ORG_ID },
    mainEntityOfPage: { "@type": "WebPage", "@id": abs(post.href) },
  };
}

/** A single post's structured data — Yoast graph when present, else Article + crumbs. */
export function PostJsonLd({ post, breadcrumb }: { post: BlogPost; breadcrumb: Crumb[] }) {
  if (post.seo?.schemaRaw) return <SeoSchema raw={post.seo.schemaRaw} />;
  return (
    <>
      <Ld data={articleData(post)} />
      <BreadcrumbJsonLd items={breadcrumb} />
    </>
  );
}

function personData(author: BlogAuthor) {
  const sameAs = author.social.map((s) => s.href);
  return {
    "@type": "Person",
    name: author.name, // name only — role goes in jobTitle (research/eeat §A2)
    url: abs(author.href),
    jobTitle: author.roleTitle ?? undefined,
    description: author.bio ?? undefined,
    image: author.image?.sourceUrl ?? author.avatarUrl ?? undefined,
    sameAs: sameAs.length ? sameAs : undefined,
  };
}

/** Author archive — ProfilePage with the author as mainEntity (E-E-A-T; research §A3),
 *  plus a BreadcrumbList. Real name in `name`; profiles in `sameAs`. */
export function AuthorJsonLd({ author, breadcrumb }: { author: BlogAuthor; breadcrumb: Crumb[] }) {
  return (
    <>
      <Ld data={{ "@context": "https://schema.org", "@type": "ProfilePage", mainEntity: personData(author) }} />
      <BreadcrumbJsonLd items={breadcrumb} />
    </>
  );
}

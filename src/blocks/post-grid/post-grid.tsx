import Image from "next/image";
import Link from "next/link";
import { Section } from "@/ui/section";
import { Card, CardHeader, CardTitle, CardContent } from "@/ui/card";
import { getRecentPosts } from "@/lib/cms";
import { sanitize } from "@/lib/sanitize";
import { sectionProps, columnsClass } from "@/lib/section-settings";
import type { PostGridProps } from "./schema";

// A FETCHING block (the exception to "blocks never fetch"): a listing needs live
// data, so it calls the CMS public API (the boundary allows blocks → cms-public).
export async function PostGrid({ heading, intro, category, count, columns, tone, spacing, container }: PostGridProps) {
  const posts = await getRecentPosts({ first: count ?? 3, category });
  if (posts.length === 0) return null;

  return (
    <Section dataBlock="post_grid" {...sectionProps({ tone, spacing, container })}>
      {heading || intro ? (
        <div className="mb-12 max-w-2xl">
          {heading ? <h2 className="display-md text-ink">{heading}</h2> : null}
          {intro ? <p className="mt-4 max-w-[65ch] body-lg text-ink-muted">{intro}</p> : null}
        </div>
      ) : null}

      <div className={`grid gap-6 ${columnsClass(columns)}`}>
        {posts.map((p) => (
          <Card key={p.uri} className="overflow-hidden">
            <Link
              href={p.uri}
              className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {p.image?.sourceUrl ? (
                <div className="relative aspect-video bg-surface-muted">
                  <Image
                    src={p.image.sourceUrl}
                    alt={p.image.altText ?? ""}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
              ) : null}
              <CardHeader>
                <CardTitle className="text-lg font-bold text-ink">{p.title}</CardTitle>
              </CardHeader>
            </Link>
            {p.excerpt ? (
              <CardContent>
                <div
                  className="leading-relaxed text-ink-muted [&_p]:m-0"
                  dangerouslySetInnerHTML={{ __html: sanitize(p.excerpt) }}
                />
              </CardContent>
            ) : null}
          </Card>
        ))}
      </div>
    </Section>
  );
}

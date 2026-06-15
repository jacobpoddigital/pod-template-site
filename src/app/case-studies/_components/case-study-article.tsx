import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/ui/badge";
import { RichText } from "@/ui/rich-text";
import { formatDate } from "@/lib/format";
import type { CaseStudy } from "@/lib/cms";

// The single case-study body (the example CPT), split into small pieces so each stays
// under the complexity bar. Leads with the ACF-driven proof (client/industry + the
// metrics band) — the part a CPT adds over a native post — then the rendered narrative
// in RichText's prose container (max-w-65ch). The route owns SEO + JSON-LD.

const focusRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

function Header({ caseStudy }: { caseStudy: CaseStudy }) {
  const facts = [caseStudy.industry, caseStudy.client, formatDate(caseStudy.date)].filter(Boolean);
  return (
    <div className="mx-auto max-w-[70ch]">
      <p className="mb-4">
        <Link href="/case-studies" className={`body-sm text-ink-muted underline underline-offset-2 ${focusRing}`}>
          ← All case studies
        </Link>
      </p>
      {caseStudy.industry ? <Badge variant="muted" className="mb-3">{caseStudy.industry}</Badge> : null}
      <h1 className="display-lg text-ink">{caseStudy.title}</h1>
      {caseStudy.summary ? <p className="mt-4 body text-ink-muted">{caseStudy.summary}</p> : null}
      {facts.length ? <p className="mt-4 body-sm text-ink-muted">{facts.join(" · ")}</p> : null}
    </div>
  );
}

function Hero({ image }: { image: CaseStudy["image"] }) {
  if (!image?.sourceUrl) return null;
  return (
    <div className="relative mx-auto mt-8 aspect-[16/9] max-w-[70ch] overflow-hidden rounded-lg bg-surface-muted">
      <Image src={image.sourceUrl} alt={image.altText ?? ""} fill sizes="(min-width: 768px) 70ch, 100vw" className="object-cover" priority />
    </div>
  );
}

/** The headline metrics band — the structured ACF repeater rendered as proof numbers. */
function Metrics({ caseStudy }: { caseStudy: CaseStudy }) {
  if (!caseStudy.metrics.length) return null;
  return (
    <dl className="mx-auto mt-10 grid max-w-[70ch] grid-cols-1 gap-6 sm:grid-cols-3">
      {caseStudy.metrics.map((m) => (
        <div key={m.label} className="rounded-lg border border-border p-6 text-center">
          <dd className="display-md text-primary">{m.value}</dd>
          <dt className="mt-1 body-sm text-ink-muted">{m.label}</dt>
        </div>
      ))}
    </dl>
  );
}

function Footer({ caseStudy }: { caseStudy: CaseStudy }) {
  if (!caseStudy.websiteUrl) return null;
  return (
    <div className="mx-auto mt-10 max-w-[70ch]">
      <a
        href={caseStudy.websiteUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`body-sm text-primary underline underline-offset-2 ${focusRing}`}
      >
        Visit {caseStudy.client ?? "the client"}’s site →
      </a>
    </div>
  );
}

export function CaseStudyArticle({ caseStudy }: { caseStudy: CaseStudy }) {
  return (
    <article>
      <Header caseStudy={caseStudy} />
      <Hero image={caseStudy.image} />
      <Metrics caseStudy={caseStudy} />
      <div className="mx-auto mt-10 max-w-[70ch]">
        <RichText html={caseStudy.contentHtml} />
      </div>
      <Footer caseStudy={caseStudy} />
    </article>
  );
}

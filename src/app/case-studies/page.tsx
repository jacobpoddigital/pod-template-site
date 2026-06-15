import type { Metadata } from "next";
import { Section } from "@/ui/section";
import { CASE_STUDIES_BASE, getCaseStudies } from "@/lib/cms";
import { siteConfig } from "../../../site.config";
import { CaseStudyCardList } from "./_components/case-study-card";

// /case-studies — the index for the example CUSTOM POST TYPE. SSG; new entries appear
// on the next build/ISR (same resilience rule as /blog). The CPT mirrors the blog's
// route conventions to prove a registered post type is a first-class citizen.
export const dynamic = "error";

export function generateMetadata(): Metadata {
  return {
    title: siteConfig.caseStudies.title,
    description: siteConfig.caseStudies.intro,
    alternates: { canonical: CASE_STUDIES_BASE },
    openGraph: { title: siteConfig.caseStudies.title, description: siteConfig.caseStudies.intro, url: CASE_STUDIES_BASE, type: "website" },
  };
}

export default async function CaseStudiesIndexPage() {
  const { items } = await getCaseStudies();
  return (
    <Section dataBlock="case_studies_index" padding="default">
      <header className="mx-auto mb-12 max-w-[65ch] text-center">
        <h1 className="display-lg text-ink">{siteConfig.caseStudies.title}</h1>
        <p className="mt-4 body text-ink-muted">{siteConfig.caseStudies.intro}</p>
      </header>
      {items.length ? (
        <CaseStudyCardList items={items} />
      ) : (
        <p className="text-center body text-ink-muted">No case studies yet — check back soon.</p>
      )}
    </Section>
  );
}

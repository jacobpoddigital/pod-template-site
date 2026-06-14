import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Section } from "@/ui/section";
import { getCaseStudy, getCaseStudySlugs } from "@/lib/cms";
import { CaseStudyArticle } from "../_components/case-study-article";
import { CaseStudyJsonLd } from "../_components/case-study-jsonld";
import { caseStudyMetadata } from "../_lib/metadata";

// /case-studies/[slug] — a single entry of the example CUSTOM POST TYPE: rendered +
// sanitized WP content in a prose container, the ACF metrics band, Yoast SEO + Article
// JSON-LD. Same route conventions as /blog/[slug] — a CPT is a first-class citizen.
export const dynamic = "error";
export const dynamicParams = false;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getCaseStudySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const caseStudy = await getCaseStudy(slug);
  if (!caseStudy) notFound();
  return caseStudyMetadata(caseStudy);
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const caseStudy = await getCaseStudy(slug);
  if (!caseStudy) notFound();

  return (
    <Section dataBlock="case_study" padding="default">
      <CaseStudyArticle caseStudy={caseStudy} />
      <CaseStudyJsonLd caseStudy={caseStudy} />
    </Section>
  );
}

import { cmsRequest } from "./client";
import { toSeo } from "./seo";
import { CASE_STUDIES_TAG } from "./cache-tags";
import {
  CaseStudiesDocument,
  CaseStudyBySlugDocument,
  CaseStudySlugsDocument,
} from "./generated/graphql";
import type { CaseStudiesQuery, CaseStudyBySlugQuery } from "./generated/graphql";
import type { CaseStudyListItem, CaseStudy, PaginatedCaseStudies, CaseStudyMetric, SeoImage } from "./types";

// --- The example CUSTOM POST TYPE (case_study). Mirrors the blog data layer
// (./blog) but on a REGISTERED CPT exposed to WPGraphQL with its own ACF group.
// getCaseStudies paginates via the Offset Pagination addon; getCaseStudy returns one
// entry; getCaseStudySlugs feeds generateStaticParams. All hrefs are FRONTEND paths
// (we own /case-studies/*, not WP's uri). cms-internal — re-exported from the index. ---

/** CPT mount point + per-page. Change CASE_STUDIES_BASE + the app folder to remount. */
export const CASE_STUDIES_BASE = "/case-studies";
export const CASE_STUDIES_PER_PAGE = 12;

const caseStudyHref = (slug: string) => `${CASE_STUDIES_BASE}/${slug}`;

type ImgNode = { sourceUrl?: string | null; altText?: string | null; mediaDetails?: { width?: number | null; height?: number | null } | null } | null | undefined;
function flatImage(node: ImgNode) {
  return node?.sourceUrl ? { sourceUrl: node.sourceUrl, altText: node.altText } : null;
}
function flatImageDetailed(node: ImgNode): SeoImage | null {
  return node?.sourceUrl ? { sourceUrl: node.sourceUrl, altText: node.altText, width: node.mediaDetails?.width, height: node.mediaDetails?.height } : null;
}

type RawMetric = { label?: string | null; value?: string | null };
function mapMetrics(arr: readonly RawMetric[] | null | undefined): CaseStudyMetric[] {
  return (arr ?? []).filter((m) => m.label && m.value).map((m) => ({ label: m.label!, value: m.value! }));
}

// Single normalizer for the ACF group so both list + detail mappers stay flat (the
// `?? null` chain is what pushes complexity over the bar otherwise).
type RawFields = { client?: string | null; industry?: string | null; summary?: string | null; websiteUrl?: string | null; metrics?: readonly RawMetric[] | null } | null | undefined;
function flatFields(f: RawFields) {
  return {
    client: f?.client ?? null,
    industry: f?.industry ?? null,
    summary: f?.summary ?? null,
    websiteUrl: f?.websiteUrl ?? null,
    metrics: mapMetrics(f?.metrics),
  };
}

type RawListNode = NonNullable<CaseStudiesQuery["caseStudies"]>["nodes"][number];
function toListItem(n: RawListNode): CaseStudyListItem {
  const slug = n.slug ?? "";
  const { client, industry, summary, metrics } = flatFields(n.caseStudyFields);
  return {
    databaseId: n.databaseId,
    title: n.title ?? "",
    slug,
    href: caseStudyHref(slug),
    date: n.date,
    excerpt: n.excerpt,
    image: flatImage(n.featuredImage?.node),
    client,
    industry,
    summary,
    metrics,
  };
}

export interface CaseStudiesOpts {
  /** 1-based page number. */
  page?: number;
  perPage?: number;
  /** databaseIds to exclude (e.g. the featured entry). */
  excludeIds?: number[];
}

function caseStudyVars(opts: CaseStudiesOpts) {
  const perPage = opts.perPage ?? CASE_STUDIES_PER_PAGE;
  const page = Math.max(1, opts.page ?? 1);
  return {
    perPage,
    page,
    vars: { size: perPage, offset: (page - 1) * perPage, notIn: opts.excludeIds?.map(String) ?? null },
  };
}

/** One page of case studies + totals. Needs the WPGraphQL Offset Pagination addon. */
export async function getCaseStudies(opts: CaseStudiesOpts = {}): Promise<PaginatedCaseStudies> {
  const { perPage, page, vars } = caseStudyVars(opts);
  const data = await cmsRequest(CaseStudiesDocument, vars, [CASE_STUDIES_TAG]);
  const items = (data.caseStudies?.nodes ?? []).map(toListItem);
  const total = data.caseStudies?.pageInfo?.offsetPagination?.total ?? items.length;
  return { items, total, page, perPage, totalPages: Math.max(1, Math.ceil(total / perPage)) };
}

/** Every published case study slug — generateStaticParams for /case-studies/[slug]. */
export async function getCaseStudySlugs(): Promise<string[]> {
  const data = await cmsRequest(CaseStudySlugsDocument, {}, [CASE_STUDIES_TAG]);
  return (data.caseStudies?.nodes ?? []).map((n) => n.slug).filter((s): s is string => Boolean(s));
}

type RawSingle = NonNullable<CaseStudyBySlugQuery["caseStudy"]>;
function toCaseStudy(cs: RawSingle, slug: string): CaseStudy {
  const finalSlug = cs.slug ?? slug;
  return {
    databaseId: cs.databaseId,
    title: cs.title ?? slug,
    slug: finalSlug,
    href: caseStudyHref(finalSlug),
    date: cs.date,
    modified: cs.modified,
    contentHtml: cs.content ?? "",
    image: flatImageDetailed(cs.featuredImage?.node),
    ...flatFields(cs.caseStudyFields),
    seo: toSeo(cs.seo),
  };
}

/** A single case study for the detail page. Null when the slug doesn't exist (route 404s).
 *  `preview` bypasses ISR for draft preview (boilerplate §4). */
export async function getCaseStudy(slug: string, opts: { preview?: boolean } = {}): Promise<CaseStudy | null> {
  const data = await cmsRequest(CaseStudyBySlugDocument, { slug }, [CASE_STUDIES_TAG, `case-study:${slug}`], opts);
  return data.caseStudy ? toCaseStudy(data.caseStudy, slug) : null;
}

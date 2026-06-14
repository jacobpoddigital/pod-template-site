# Custom post types (the worked example: Case Studies)

The template ships **one reference custom post type — `case_study`** — as the worked
example of taking a registered WordPress post type all the way to typed, statically
generated frontend routes. It exists to prove (and document) the pattern; **keep it,
rename it, or delete it per client.**

It mirrors the [standard blog](./blog.md) on purpose: same data-layer shape, same SSG
route conventions, same Yoast-SEO + JSON-LD wiring. The difference — and the point — is
that a CPT is a **registered** post type carrying its **own ACF field group**
(`caseStudyFields`), rather than reusing WordPress's native `post`. That ACF group is the
structured part a CPT adds over a native post (client, industry, summary, a metrics
repeater, website URL).

It renders **with no WordPress** via the dev mock (`CMS_MODE=mock`), exactly like the
rest of the template (ADR 0013).

## Routes

| Route | What |
|---|---|
| `/case-studies` | Index: hero → responsive 1/2/3-col card grid (industry badge, client, summary, headline metric) |
| `/case-studies/[slug]` | Single entry: back-link, hero image, the ACF **metrics band**, rendered narrative, client-site link |

Both are SSG (`dynamic = "error"`, `dynamicParams = false`) — new entries appear on the
next build/ISR. The frontend **owns the permalink** (`/case-studies/<slug>`), not WP's
`uri`. (The index keeps the offset-pagination contract for parity with the blog, but
ships a single grid; add `/case-studies/page/[n]` the same way the blog does if a client
needs paging.)

## The files (the recipe — copy these to add another CPT)

A CPT is **self-contained** across these layers. To add another (e.g. `team_member`,
`service`, `location`): copy each file, swap the post-type key + GraphQL names.

| Layer | File | Change per CPT |
|---|---|---|
| WP register | `wp/mu-plugins/pod-case-study-register.php` | `register_post_type` key + `graphql_single_name`/`graphql_plural_name` |
| ACF fields | `wp/acf-fields/{{SITESLUG}}-case-study.json` | field group, `graphql_field_name`, `location` post_type |
| Schema (SDL) | `src/lib/cms/schema.graphql` | the `CaseStudy*` types + `caseStudies`/`caseStudy` RootQuery fields |
| Queries | `src/lib/cms/queries/case-stud*.graphql` | list / by-slug / slugs |
| Types | `src/lib/cms/types.ts` | `CaseStudy*` normalized domain types |
| Data layer | `src/lib/cms/case-studies.ts` | fetch + normalize, frontend hrefs, `CASE_STUDIES_BASE` |
| Public surface | `src/lib/cms/index.ts` | re-export the getters + types + cache tag |
| Cache tag | `src/lib/cms/cache-tags.ts` | `CASE_STUDIES_TAG` |
| Dev mock | `src/lib/cms/mock/case-studies.ts` + a row each in `mock/index.ts` `HANDLERS` | fixtures + handler |
| Routes | `src/app/case-studies/{page.tsx,[slug]/page.tsx}` | index + detail |
| Components | `src/app/case-studies/_components/*` | card, article, JSON-LD |
| Config | `site.config.ts` → `caseStudies` | title + intro |

Then run **`pnpm codegen`** (regenerates typed documents from the SDL) and **`pnpm build`**.

## Why the SDL is hand-edited

`pnpm codegen` runs against the **committed** SDL (`src/lib/cms/schema.graphql`) so the
build is green with no live WordPress (ADR 0013). A new CPT introduces types
(`CaseStudy`, `RootQueryToCaseStudyConnection`, …) that a native-post-only schema does
not have — so we hand-author that subset, following WPGraphQL's CPT naming. Once the CPT
+ ACF group are live on real WP, **regenerate the full SDL** and the hand-authored shapes
are confirmed against the source of truth:

```
pnpm dlx get-graphql-schema "$WPGRAPHQL_URL" > src/lib/cms/schema.graphql
pnpm codegen
```

## WordPress requirements

1. **The CPT plugin** (`pod-case-study-register.php`) — `show_in_graphql: true` with
   `graphql_single_name`/`graphql_plural_name` is what makes WPGraphQL generate the
   `caseStudy` / `caseStudies` fields and the `CaseStudy` type.
2. **The ACF group** (`*-case-study.json`) — `show_in_graphql: 1`,
   `graphql_field_name: "caseStudyFields"`, located on `post_type == case_study`.
3. **WPGraphQL Offset Pagination** addon — same as the blog; `provision.sh` installs it.

## Deleting it (client has no case studies)

Delete, in this order, and the template is clean — nothing else imports them:

- `wp/mu-plugins/pod-case-study-register.php`
- `wp/acf-fields/{{SITESLUG}}-case-study.json`
- `src/lib/cms/case-studies.ts`, `src/lib/cms/queries/case-stud*.graphql`,
  `src/lib/cms/mock/case-studies.ts`
- the `CaseStudy*` types in `types.ts`, the re-exports in `index.ts`, the `HANDLERS` rows
  + import in `mock/index.ts`, `CASE_STUDIES_TAG` in `cache-tags.ts`, the `CaseStudy*`
  blocks in `schema.graphql`, the `caseStudies` block in `site.config.ts`
- `src/app/case-studies/`

Then `pnpm codegen && pnpm build`.

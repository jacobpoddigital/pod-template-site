# Navigation & site chrome (menus + Site Options)

How editor-managed header/footer chrome — the primary nav, footer columns, logo, CTA, social,
phones — comes through WPGraphQL into the React layout. This was the one part of the boilerplate
the template **didn't have** until the Website Navigator build surfaced it (assessment §19):
mock mode rendered fine, but live WP 500'd because the chrome was never registered WP-side.
Now it ships. This doc is the pattern so it isn't solved from scratch each time.

Two halves: **WordPress registers the chrome** (`wp/mu-plugins/pod-chrome-register.php`), and
**the frontend reads it in one query** (`getSiteChrome` → `SiteChrome`).

---

## WordPress side — `pod-chrome-register.php`

The mu-plugin is **generic — identical for every Pod site** — and does three things:

1. **Registers two nav-menu locations.** `register_nav_menus(['primary','footer'])` →
   WPGraphQL exposes them in `MenuLocationEnum` as `PRIMARY` / `FOOTER` (upper-cased slug).
2. **Registers a "Site Options" ACF options page** (editor UI only) for the logo / CTA /
   social / phones / strapline / address.
3. **Hand-registers the `siteOptions` GraphQL surface** — `SiteOptions` + `SiteOptionsSocial`
   + `SiteOptionsPhone` object types and a `RootQuery.siteOptions` field with a resolver that
   reads the ACF options (`get_field(…, 'option')`).

### Why hand-register `siteOptions` instead of wpgraphql-acf auto-exposure

This is the load-bearing decision (earned 2026-06-12, in `FRICTION.md` + `standards.md §12`):

> Auto-exposing an ACF options page in wpgraphql-acf 2.6.x nests the field group under a
> **self-referential** `siteOptions` sub-field (`SiteOptions.siteOptions: SiteOptions`) — a
> name collision between the options-page `graphql_field_name` and the field-group title. It
> **cannot** produce the flat `siteOptions { strapline … }` contract the frontend query
> expects.

So the field group JSON ships with **`show_in_graphql: 0`** (editor UI only) and the plugin
registers the GraphQL types explicitly. This is deterministic and version-proof, and it makes
the GraphQL surface match the committed `schema.graphql` exactly.

**Contrast with page blocks**, which *do* use wpgraphql-acf auto-exposure — there the rule is
that the generated type names must match the `PageFieldsBlocks<X>Layout` convention the
committed schema declares (`standards.md §12`). Chrome (options page) → hand-register; page
blocks → auto-expose. Don't mix them up.

### The field-name contract

The field group lives in `wp/acf-fields/{{SITESLUG}}-site-options.json`. Field **keys** are
site-prefixed (`{{SITESLUG}}`); field **names** are the contract the resolver reads and **must
not change** without updating all three together: the field group JSON, the resolver in the
mu-plugin, and the `getSiteChrome` query. The names: `logo` (image, `return_format: id` →
resolved to a `MediaItem`), `strapline`, `address`, `header_cta_label`, `header_cta_url`,
`social` (repeater: `label`/`url`), `social_in_header` (true/false), `phone_numbers` (repeater:
`location`/`number`).

`provision.sh` copies **all** `wp/mu-plugins/*.php`, so the chrome plugin ships with the blocks
plugin automatically — no per-file step.

---

## Frontend side — `getSiteChrome()` → `SiteChrome`

`src/lib/cms/queries/site-chrome.graphql` fetches header + footer in **one round-trip**:

```graphql
query SiteChrome {
  primary: menuItems(where: { location: PRIMARY }) { nodes { id parentId label uri description } }
  footer:  menuItems(where: { location: FOOTER })  { nodes { id parentId label uri } }
  siteOptions { strapline address headerCtaLabel headerCtaUrl
    logo { sourceUrl altText } social { label url } socialInHeader
    phoneNumbers { location number } }
}
```

`getSiteChrome()` (`src/lib/cms/index.ts`) normalises that into the `SiteChrome` shape the
layout consumes, cached under the `CHROME_TAG` ISR tag (revalidated when chrome changes).

### Flat menu items → a nav tree

WPGraphQL returns menu items **flat**, each carrying a `parentId`. `buildNavTree()` builds the
hierarchy:

- Map every node to a `NavItem` (`label`, `href` from `uri`, optional `description`, `children`).
- Attach each item to its parent (`parentId`), else it's a root.
- Custom link types work — they carry a `uri` like any item.
- A `seen` set breaks any cycle a malformed menu might form (CMS input is untrusted — defensive).

**Convention:** `PRIMARY` → the header nav (with drill-down children for mega-menus). `FOOTER`
**top-level items become footer columns**, and *their children become the links in that column*
(`toColumns()`). So an editor builds the footer's column structure as a two-level menu.

### The editor workflow (what a human does in WP)

1. **Appearance → Menus** — create a "Primary" menu, assign it to the **Primary (header)**
   location; create a "Footer" menu (top level = column headings, nest links beneath each),
   assign it to **Footer**.
2. **Site Options** (admin sidebar) — fill logo, strapline, address, header CTA, social links,
   phone numbers; toggle "Show social in header".
3. Publish. The frontend picks it up on the next ISR revalidate (or immediately via the
   `/api/revalidate` chrome tag).

---

## Adding to / changing the chrome

To add a chrome field (e.g. a secondary CTA): add it to the field group JSON **and** the
resolver in `pod-chrome-register.php` (register the field on `SiteOptions` + return it in the
resolver) **and** the `site-chrome.graphql` selection **and** the `SiteChrome` type +
normaliser — the four-place contract above. Then `pnpm codegen`.

> **Mock vs live.** `pnpm dev` renders chrome from the committed mock fixtures, so the header/
> footer look right with no WordPress. That's exactly why the live gap was invisible for so
> long — **always smoke-test chrome against live WP** (or at least confirm the mu-plugin is
> active and the menus are assigned) before calling a site done. `standards.md §12` →
> "Chrome is WP-side infrastructure — it must be registered, not assumed."

*Related: `docs/acf-queries.md` (the field-type patterns the chrome query uses),
`standards.md §12` (the earned chrome rules), `FRICTION.md` (the original symptoms).*

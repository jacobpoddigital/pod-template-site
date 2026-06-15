# Conditional rendering from ACF field values

How a block changes what it renders based on the values an editor sets in WordPress. The
assessment §3 asked for one place that pulls this together — it had been spread across blocks
and `section_settings`. There are **four layers**, smallest to largest; a single block usually
uses two or three.

The governing rule: **conditional rendering is decided in the React component or the shared
`section_settings` mechanism — never with raw CSS or arbitrary values.** Every variant resolves
to a design-token-backed class (tone surface, padding preset, container width, grid columns),
so an editor's choice can't break the design system (ADR 0014/0015, `standards.md §2`).

The worked example throughout is `src/blocks/media-text/media-text.tsx` (read it alongside
this) — it uses all four layers.

---

## Layer 1 — field-presence guards (render iff the editor filled it)

Optional fields come back as ACF `null` (zod `.nullish()`). Guard each one so an empty field
renders **nothing** — no empty `<p>`, no dangling label:

```tsx
{eyebrow ? <p className="mb-4 label text-brand-accent">{eyebrow}</p> : null}
{body ? <p className="mt-4 max-w-[65ch] body-lg text-ink-muted">{body}</p> : null}

{/* A CTA needs BOTH halves — never render a label with no href, or a button to nowhere */}
{cta_label && cta_url ? (
  <div className="mt-8"><ButtonLink href={cta_url}>{cta_label}</ButtonLink></div>
) : null}
```

Rules:
- Use `? … : null`, not `&&`, when the left side could be `0` or `""` (avoids rendering a
  stray `0`).
- A paired field (label **+** url, value **+** source) is all-or-nothing — guard on the
  conjunction.
- A required field (`z.string().min(1)`) needs no guard — zod already failed the build if it
  was missing.

## Layer 2 — variant switches (one field picks a layout)

A bounded `select`/`true_false` field selects between rendered variants. Keep the mapping as a
**lookup table of token-backed classes** (Tailwind needs whole class names — never interpolate
`aspect-[${ratio}]`), then index it with the field, defaulting the nullish case:

```tsx
// media_ratio → an aspect class · media_position → which column the media sits in at md+
const RATIO = { landscape: "aspect-[4/3]", square: "aspect-square",
                portrait: "aspect-[3/4]", wide: "aspect-video" } as const;
const ORDER = { right: { text: "order-2 md:order-1", media: "order-1 md:order-2" },
                left:  { text: "order-2",            media: "order-1" } } as const;

const order = ORDER[media_position ?? "right"];   // default the nullish value HERE
const ratio = RATIO[media_ratio ?? "landscape"];
```

A variant can also switch the **whole sub-tree**, not just a class — the same block renders a
video facade *or* an image *or* nothing, decided by which fields are set:

```tsx
function Media({ image, videoId, ratio, className }) {
  if (videoId) return <div className={className}><VideoFacade videoId={videoId} image={image} /></div>;
  if (!image?.sourceUrl) return null;            // neither set → render nothing
  return <div className={className}><Image src={image.sourceUrl} … /></div>;
}
```

Mirror the columns helper for repeater grids: `columnsClass(n)` in `src/lib/section-settings.ts`
maps an editor's `columns` (1–4) to a static responsive `grid-cols-*` class.

## Layer 3 — `section_settings` (the shared, every-block conditionals)

Five conditionals ship on **every** section block via `sectionSettingsFields`
(`src/lib/section-settings.ts`) so an editor controls a section's surface/space/width/anchor/flip
in WordPress with no rebuild — the headless translation of Great White's `section_settings`.
They're a **defined list**, not free text: each maps to a design-token value, so the ACF field
is a single-choice **`button_group`** (the editor picks from the list; it can't typo a value
that 500s). `src/lib/section-settings.ts` is the single source of truth for the choices — the
ACF `choices` must mirror `SPACINGS`/`CONTAINERS`/the `tone` enum (see §choices below).

| Field | ACF field type | Drives |
|---|---|---|
| `tone` | `button_group` (`default`/`muted`/`inverted`/`accent`) | The surface + text colour (`data-tone` → token set) |
| `spacing` | `button_group` (`default`/`compact`/`spacious`/`none`) | The `<Section>` vertical padding preset |
| `container` | `button_group` (`default`/`narrow`/`full`) | The `<Container>` max-width |
| `anchor` | `text` (genuinely freeform) | An in-page `#id` target (Layer 4) |
| `reverse` | `true_false` | Flip a two-column section (media ↔ content) at `lg+` |

> **Why `button_group`, not `select`.** wpgraphql-acf 2.x exposes an ACF `select` as a **list**
> (`[String]`), which breaks the scalar `tone`/`spacing`/`container` queries + the `z.enum`
> schemas. A single-choice `button_group` (and `radio`) exposes as a scalar **`String`**, so it
> gives the defined-list UI with no contract change. Confirm this on the per-project SDL regen
> (`standards.md §12`); if a field regenerates as `[String]`, codegen fails **loud** — switch
> the field to `radio` or flatten `[0]`. (Free text was the old stopgap and is why a typo'd
> `spacing:"lg"` once 500'd — `FRICTION.md`.)

A block never branches on `tone`/`spacing`/`container` by hand — it spreads them onto
`<Section>`:

```tsx
<Section dataBlock="media_text" {...sectionProps({ tone, spacing, container })}>
```

`sectionProps()` does the conditional mapping (`spacing:"spacious"` → the `hero` padding
preset, etc.) in one place, so the resolution can't drift between blocks.

**The flip (`reverse` → `flipOrder`).** For a two-column section, `reverse` (a `true_false`
toggle) is the generic flip — `flipOrder(reverse)` in `src/lib/section-settings.ts` returns
`{ a, b }` order classes the block applies to its first/second child (copy + media), swapping
sides at `lg+` while mobile order is unchanged:

```tsx
const order = flipOrder(reverse);
return (
  <Section …>
    <div className={`grid lg:grid-cols-2 …`}>
      <div className={order.a}>{/* copy */}</div>
      <div className={order.b}>{/* media / widget */}</div>
    </div>
  </Section>
);
```

`media_text` instead uses its own richer **`media_position`** select (Layer 2's `ORDER` table,
`left`/`right`) because it also re-orders on mobile — pick `media_position` when the media side
matters per breakpoint, `reverse` for a simple boolean flip on any other split block.

### choices

The `button_group` `choices` object is just `{ value: "Label" }` mirroring the zod enum, e.g.
`spacing`:

```json
{ "name": "spacing", "label": "Spacing", "type": "button_group", "show_in_graphql": 1,
  "choices": { "default": "Default", "compact": "Compact", "spacious": "Spacious", "none": "None" },
  "default_value": "default", "allow_null": 1 }
```

Add a value in `SPACINGS`/`CONTAINERS`/the tone enum **and** the matching `choices` entry in the
ACF field — the two must stay in step (the `/new-block` recipe enforces this for new layouts).

## Layer 4 — registry / renderer level (cross-cutting, applied once)

`BlockRenderer` (`src/blocks/block-renderer.tsx`) applies conditionals that are the same for
**all** blocks, so no component re-implements them:

```tsx
const anchor = toAnchorId(typeof props.anchor === "string" ? props.anchor : "");
return anchor ? (
  <div key={key} id={anchor} className="scroll-mt-24"><entry.Component {...props} /></div>
) : (
  <entry.Component key={key} {...props} />
);
```

If the editor set an `anchor`, the block is wrapped in an id'd, scroll-offset target;
otherwise it renders bare. Decide a truly cross-cutting conditional here once — not in every
block.

---

## Choosing the layer

| The conditional is… | Put it in |
|---|---|
| "show this field only if filled" | Layer 1 — a guard in the component |
| "this field picks one of N layouts/classes" | Layer 2 — a lookup table + default |
| surface / spacing / width / anchor (any section) | Layer 3 — `section_settings`, already there |
| identical for every block (id wrapper, future sticky offset) | Layer 4 — `BlockRenderer` |

*Related: `docs/acf-queries.md` (how the fields arrive + `.nullish()`),
`standards.md §2/§12` (token-backed variants, the `reverse` flip), KB 09 (responsive grids).*

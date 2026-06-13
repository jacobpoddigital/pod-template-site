# Broken-link check (checklist §22)

A pre-launch gate so no page ships with dead internal links (broken nav, CTAs, footer/legal links).
Pairs with the go-live checklist (§Reliability & content).

## What it does
`pnpm links` builds nothing — it starts the production server (`pnpm start`), crawls the site
recursively with [linkinator](https://github.com/JustinBeckwith/linkinator), and **fails on any
broken internal link**. Config: `linkinator.config.json`.

```bash
pnpm build && pnpm links
```

- **Internal links** (same origin) are followed recursively and checked — a 404 fails the run.
- **External links + `mailto:` / `tel:`** are skipped: they flake (rate limits, bot-403s) and
  external link-rot is a manual pre-launch check, not an automated gate.

## When to run it — it's a GO-LIVE gate, not a per-PR check
Run it once the site's content is **complete** (every linked route actually exists). This is why
it's **not** wired as a blocking CI job:

- On the **bare template**, the sample/mock content links to placeholder routes (`/services/*`,
  `/about`, `/blog/*`, `/privacy`, `/terms`) that don't exist — so it reports them as broken. Expected.
- On an **in-progress** build, links to not-yet-built pages report as broken. Also expected — those
  links genuinely are dead right now.

So make it a **Phase-7 go-live step** (it's on `docs/go-live-checklist.md`): run `pnpm links`,
confirm **zero broken internal links**, then launch. If a site is content-complete and stable, you
*can* add it to CI — but only then, or it will redden every PR during build-out.

## Optional CI (only for a content-complete site)
If you do want it in CI, it needs a human to add the job — agency policy (workflow/06) blocks agent
edits to `.github/workflows/`. The job mirrors the Lighthouse one (see `docs/performance.md`):
`pnpm install` → `pnpm build` → `pnpm links`.

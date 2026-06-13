# Performance budget (checklist §7)

A Lighthouse budget gate so a perf regression fails review instead of shipping. Pairs with the
Core Web Vitals targets in `docs/go-live-checklist.md` (§Performance) and KB 04.

## What's gated

`lighthouserc.json` runs Lighthouse (mobile, simulated throttling) against the built app **3×**
and asserts the median. The app runs in **mock mode** (no WordPress — pages prerender from
`src/lib/cms/mock`), so the gate needs no live CMS.

| Metric | Level | Threshold | Why |
|---|---|---|---|
| `cumulative-layout-shift` | **error** | ≤ 0.10 | A core web vital that IS lab-stable — layout shift reproduces in the lab. Template baseline: 0. |
| `total-blocking-time` | **error** | ≤ 300 ms | The lab proxy for INP (real INP is field-only). Baseline: ~64 ms. |
| `resource-summary:script:size` | **error** | ≤ 500 KB | JS transfer weight — the most common, most controllable regression. Baseline: ~384 KB. Doesn't churn with hashed filenames (summed by resource type). |
| `categories:performance` | warn | ≥ 0.85 | Lab score is dominated by throttled LCP, so it's noisy → visible, not blocking. Baseline: ~0.88. |
| `largest-contentful-paint` | warn | ≤ 4000 ms | **Lab LCP ≠ field LCP** (see below) → warn only. |
| `unused-javascript` | warn | ≤ 200 KB | Surfaces dead JS to trim. |

### Lab vs field — the important caveat
Lighthouse runs in a **throttled lab** (4× CPU slowdown, simulated slow 4G), so its LCP (~3.9 s on
the template) is **not** the field LCP target (**≤ 1.5 s mobile**, KB 04 / go-live checklist). Field
CWV is measured on **real devices / CrUX**, which is the go-live gate — not this lab run. That's why
the hard (error) gates here are the **controllable, lab-stable** metrics (layout shift, main-thread
blocking, JS weight); score and LCP are warnings.

## Run it locally
```bash
pnpm build && pnpm lhci    # builds, serves `pnpm start`, runs Lighthouse 3× and asserts
```
Reports land in `.lighthouseci/` (git-ignored). Open the `.report.html` files to inspect.

## Tune per site
Thresholds are template defaults. A site with heavy client widgets (e.g. ported demo engines) may
legitimately exceed the JS budget — raise `resource-summary:script:size` in `lighthouserc.json`
deliberately, with a note. Tighten `categories:performance` to `error` once a site is stable.

## CI wiring — NEEDS A HUMAN (workflow/06 blocks agent edits to `.github/workflows/`)
Add this job to `.github/workflows/ci.yml` alongside `verify` (ubuntu-latest has Chrome preinstalled,
which `lhci` uses):

```yaml
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm build      # mock, no WP — pages prerender from src/lib/cms/mock
      - run: pnpm lhci       # serves `pnpm start`, runs Lighthouse 3× and asserts the budget
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: lighthouse-reports
          path: .lighthouseci/
```

While editing `ci.yml`, also fix its stale header comment — it says "fallback content must keep the
build green", but there is **no silent fallback** (ADR 0013); the build is green because pages
prerender from the committed mock. (Both blocked from agent edit by the same policy.)

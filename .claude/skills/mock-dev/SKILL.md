---
name: mock-dev
description: How to build and render this site with no WordPress (CMS_MODE=mock / WPGRAPHQL_URL unset), where mock data lives, and the local Docker WP setup (docker-compose + provision.sh, fields-as-code). Read before adding mock data, running the site offline, or standing up local WordPress.
---

# mock-dev — build without WordPress, then stand up real WP

The whole site **builds and renders green with no WordPress** (ADR 0013). This is the free, deterministic dev path — and the agency's "test without spend" principle. Develop blocks against the mock first; wire real WP later.

## Offline mode

`src/lib/cms/client.ts`:

```ts
const useMock = !process.env.WPGRAPHQL_URL || process.env.CMS_MODE === "mock";
```

So **either** `WPGRAPHQL_URL` unset **or** `CMS_MODE=mock` serves the dev mock. The mock is **dynamically imported** (`await import("./mock")`) so it never enters the production bundle once a real endpoint is set.

```bash
pnpm lint && pnpm typecheck && pnpm build   # all green with NO WP running — the baseline
pnpm dev                                     # renders mock content
```

## Where the mock lives — `src/lib/cms/mock/`

- `index.ts` — `mockRequest(document, variables)` dispatches by **document identity** (`document === PageBySlugDocument`), not by string. Both `client.ts` and the mock import the *same* generated document, so after any query change you must `pnpm codegen` before the mock matches again.
- `fixtures.ts` — a typed `PageBySlugQuery` exercising the starter blocks.

**Add mock data when you add a block/content type:** extend `fixtures.ts` so the new block renders offline. It's typed against the generated query, so a shape mismatch fails typecheck — keep it in step with `schema.graphql` → `generated/`.

The chain: **`schema.graphql`** (contract) → `pnpm codegen` → **`generated/`** (typed documents) → **mock** returns typed results matching them. Change the query, regenerate, update the fixture.

## Local real WordPress (when you need it)

`docker-compose.yml` + `wp/provision.sh` stand up a full local WP:

```bash
ACF_PRO_ZIP=~/path/to/acf-pro.zip ./wp/provision.sh   # idempotent — re-run to sync fields + reseed
```

- **Stack**: `mariadb:11.4` + `wordpress:6` + a `wordpress:cli` sidecar (provisioning runs through the CLI container, not the WP container).
- Installs/activates **ACF Pro** (from `ACF_PRO_ZIP`), **WPGraphQL**, **wpgraphql-acf**; sets pretty permalinks.
- WP serves on a per-site port (template default **:8081** — each client repo pins its own; mismatched ports have bitten us, so check the repo's compose/env).
- Admin email default is `jacob@poddigital.co.uk`.

After WP is real, regenerate the schema and commit it (see `graphql-queries`): `pnpm dlx get-graphql-schema "$WPGRAPHQL_URL" > src/lib/cms/schema.graphql && pnpm codegen`.

## Fields as code — never wp-admin

ACF field groups are **JSON in `wp/acf-fields/*.json`**, registered at boot by the mu-plugin `wp/mu-plugins/pod-blocks-register.php`. **Editing fields in wp-admin does not persist** — the mu-plugin re-registers from JSON on every load. To change fields: edit the JSON (+ the block schema), then re-run `provision.sh`. `wp/acf-fields/` ships empty (`.gitkeep`) and is populated per-client.

## No fallback content

There is **no `fallback.ts`** and no shippable fallback (ADR 0013). The mock is a *dev-only* substitute, not production fallback. A missing page in production → `notFound()`, never placeholder content.

## Common offline gotchas

- Mock returns `{ page: null }` for unknown slugs (→ the page 404s in dev) — that's correct, not a bug.
- Stale `.next` after config/query churn → `rm -rf .next` and restart (CSS-gone / "Client Manifest" errors).
- Mock not matching after a query edit → you forgot `pnpm codegen` (identity match broke).

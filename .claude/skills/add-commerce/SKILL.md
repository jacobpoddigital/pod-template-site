---
name: add-commerce
description: How to turn on the opt-in headless WooCommerce module on this template (storefront, cart, checkout, customer account). Read before enabling commerce, provisioning Woo, wiring the header cart/search chrome, or debugging the cart Nonce/checkout/account gates. The module is delete-the-folder removable and 100% theme-token-driven.
---

# add-commerce — enable the opt-in WooCommerce storefront

This template ships a **headless WooCommerce module** the same way as auth: **opt-in**. A brochure
site carries none of it (no chrome, no Woo deps). Full architecture: **`docs/commerce.md`**.
Read that first; this skill is the turn-on checklist.

## Before you start
- The module is **theme-token-driven** — never hardcode colours/brand into commerce components;
  everything resolves from the client's theme tokens. (This is a hard rule; see docs/commerce.md.)
- Commerce reads have **no mock** (ADR 0013) — they fail loud without `WPGRAPHQL_URL`. Build-time
  reads are gated by `commerceConfigured()` so a WP-less `pnpm build` stays green; listing routes
  are `force-dynamic`.

## Turn-on checklist
1. **Flip the flag** — `siteConfig.commerce = true` (`site.config.ts`). This renders the header
   cart + search chrome (`StoreChrome`). Commerce-free sites leave it `false`.
2. **Provision WordPress** — `bash wp/provision-commerce.sh` (run AFTER `wp/provision.sh`). It
   installs WooCommerce + WooGraphQL, configures a UK/GBP guest-checkout store, and seeds a GENERIC
   demo catalogue (`wp/seed-commerce-demo.php`). Set `SEED_COMMERCE=0` to skip the demo; replace the
   seed with the client's real products (seed or migrate). See the script header for local vs CI args.
3. **Point at WP** — set `WPGRAPHQL_URL` in `.env.local`. Verify `/shop` + a `/product/[slug]` render.
4. **Regenerate the commerce SDL if the Woo schema differs** — `pnpm dlx get-graphql-schema
   "$WPGRAPHQL_URL" > src/lib/commerce/schema.graphql && pnpm codegen:commerce` (introspection ON
   locally only; prod stays hardened).
5. **Checkout (optional)** — `NEXT_PUBLIC_CHECKOUT_ENABLED=true`. Ships dark otherwise (`/checkout`
   → `/cart`). The shipped flow is a **cheque-gateway POC**; swap in **Stripe hosted checkout**
   (`PAYMENT_METHODS` + `placeOrder` body are the swap point) for real money. **The money path is
   mandatory human review (ADR 0017) — never ship it unreviewed.**
6. **Account (optional)** — `NEXT_PUBLIC_ACCOUNT_ENABLED=true` + the **auth module** (commerce
   account reuses `requireUser`/`getSession`). With it OFF, `/account` stays the auth worked-example;
   the commerce sub-routes 404.

## Gotchas (earned)
- **Store API writes need a `Nonce` header** (Woo current): missing→401, stale→403. `cart.ts`
  primes it from `GET /cart`, caches it in a cookie, refreshes from each response, retries once.
  If "Add to bag" 401/403s, this is why.
- **A Store API cart item `id` is the VARIATION id**, not the parent — derive the parent slug from
  `permalink` for cross-sell lookups.
- **WooGraphQL is not on wp.org** — supply the folder-wrapped zip locally / via the vendor bucket.
- **No mock** — to verify commerce UI, run live dev against a provisioned Woo, not a WP-less build.

## Removing the module
The module is isolated EXCEPT two shared integration files, which must be **reverted** (not just
left — they import commerce code, so deleting the folders without reverting them breaks the build).

**1. Delete (folder-delete, nothing else depends on these):**
- `src/lib/commerce/` · `src/app/(shop)/` · `codegen.commerce.ts`
- `src/app/api/cart/` · `src/app/api/product/` · `src/app/api/account/`
- the commerce account: `src/app/account/{_components,_lib,addresses,details,downloads,orders}/`
- commerce primitives: `src/ui/{carousel,switch,quantity-stepper,cart-trust-bar,fit-reassurance,free-shipping-bar}.tsx`
- commerce chrome: `src/layout/{cart-button,cart-drawer-body,account-button,search-autocomplete,search-action}.tsx`
- `wp/provision-commerce.sh` + `wp/seed-commerce-demo.php` · this skill + `docs/commerce.md`

**2. Revert these 2 shared files to their non-commerce form:**
- `src/layout/header.tsx` — remove the `CartButton`/`AccountButton`/`SearchAutocomplete` + `ACCOUNT_ENABLED`
  imports, the `StoreChrome`/`HeaderPhone` helpers' commerce bits, and the `showSearch` block.
- `src/app/account/{layout.tsx,page.tsx}` — revert to the auth-module worked-example (drop the
  `ACCOUNT_ENABLED` branch + the commerce dashboard/shell; keep `requireUser` + the identity view).

**3.** Set `siteConfig.commerce = false` (or drop the flag). Optionally remove the now-unused deps
(`embla-carousel-react`, `@radix-ui/react-switch`). The base template then builds green with zero
commerce trace.

> Not removing, just not using it? Leave everything in place with `siteConfig.commerce = false` — it's
> inert (gated chrome renders nothing, routes are unlinked + dynamic). Only the unused deps remain.

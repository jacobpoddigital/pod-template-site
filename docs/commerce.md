# Commerce (headless WooCommerce) — opt-in bolt-on module

The template can carry a **headless WooCommerce storefront**, shipped the same way as the auth
module: **opt-in**. A brochure site pays nothing for it — no Stripe/Woo deps load, the header
renders no cart/search chrome, and the `/shop`·`/cart`·`/checkout`·`/account` routes are inert
without a Woo backend. Built + proven on the **Stride Hub** ecom POC, then graduated here.

> **Scope:** catalogue browsing + cart + hosted checkout + customer account for a single-store,
> standard-product shop. Heavy Woo-plugin shops stay classic WP. Enable the **`/add-commerce`
> skill** for the step-by-step turn-on.

## The law — one substrate, NOT a fork

Commerce is **a profile of the one template** (ADR 0016), delivered as a removable module — not
baked into every site, not a forked ecom template (which would double propagation forever). It is
**100% theme-token-driven**: every colour/spacing/type resolves from the client's theme tokens, so
the same components render under any brand. No hardcoded styling, no brand-name strings.

Everything commerce lives under clearly-owned paths and is `delete-the-folder` removable:

```
src/lib/commerce/                 # ISOLATED read/write layer (own schema + codegen + client)
src/app/(shop)/                   # /shop, /product, /search, /cart, /checkout (route group)
src/app/account/                  # customer account (composed with the auth module — see below)
src/app/api/{cart,product,account}/  # cart/quick-view/account route handlers
src/ui/{carousel,quantity-stepper,switch,cart-trust-bar,free-shipping-bar,fit-reassurance,...}
src/layout/{cart-button,cart-drawer-body,account-button,search-autocomplete}.tsx
wp/provision-commerce.sh + wp/seed-commerce-demo.php   # WP-side install + a GENERIC demo catalogue
codegen.commerce.ts               # commerce-only codegen target (pnpm codegen:commerce)
```

## Turning it on (per ecom client)

1. **`siteConfig.commerce = true`** (site.config.ts) — renders the header cart + search chrome.
2. **Provision WP** — `bash wp/provision-commerce.sh` (installs WooCommerce + WooGraphQL, configures
   the store, seeds a generic demo catalogue; `SEED_COMMERCE=0` skips the demo). See the header of
   that script for local vs CI invocation.
3. **`WPGRAPHQL_URL`** set (the commerce client fails loud without it — there is no mock; ADR 0013).
   `commerceConfigured()` gates the only build-time reads so a WP-less build stays green.
4. **Checkout** — env gate `NEXT_PUBLIC_CHECKOUT_ENABLED=true` (ships dark otherwise; `/checkout`
   redirects to `/cart`). The shipped flow is a **cheque-gateway POC** — swap in **Stripe hosted
   checkout** for real money (the `PAYMENT_METHODS` + `placeOrder` body are the swap point). The
   money path is **mandatory human review** (ADR 0017).
5. **Account** — env gate `NEXT_PUBLIC_ACCOUNT_ENABLED=true` + the **auth module** (it reuses
   `requireUser`/`getSession`). With it off, `/account` stays the auth worked-example (see below).

## Architecture (workflow/14, fixed by ADR 0017)

- **Reads** (catalogue/product/category/search) → **WooGraphQL**, SSG/ISR-first (ADR 0013-consistent).
  Listing routes are `force-dynamic` (searchParams-driven); `/product/[slug]` is SSG with
  `generateStaticParams` gated on `commerceConfigured()` (→ `[]` + `dynamicParams` when no WP).
- **Writes** (cart/checkout/order) → **WooCommerce Store API + Cart-Token + Nonce header**, proxied
  via Next route handlers / Server Actions — never browser→WP. ⚙ **Every write needs a `Nonce`
  header** on current Woo (missing→401, stale→403): `cart.ts` primes it from a `GET /cart`, caches
  it in a cookie, refreshes from each response, and retries once. This is the #1 cart gotcha.
- **Payments** → **Stripe Checkout (hosted redirect)**, SAQ A. POC ships a cheque gateway.
- **Totals always read back server-authoritatively**; the client cart is UX only.
- ⚠ Cart/checkout/account are **SSR/never-cached** — "WP down ≠ site down" does NOT hold for them;
  an ecom store needs a real backend uptime SLA.

## Why commerce has its OWN GraphQL layer

WooGraphQL explodes the schema to ~42k lines; merging it into the curated `src/lib/cms` schema would
break the cms typed queries + mock. So commerce is **fully isolated**: its own `schema.graphql`,
`codegen.commerce.ts` → `src/lib/commerce/generated/`, and `client.ts` (`commerceRequest`, no mock —
unset `WPGRAPHQL_URL` fails loud). The boundaries lint forbids `lib → cms-internal`; commerce never
reaches into cms. Regenerate the SDL when the Woo schema changes (introspection ON locally only):

```
pnpm dlx get-graphql-schema "$WPGRAPHQL_URL" > src/lib/commerce/schema.graphql
pnpm codegen:commerce
```

## Routes

| Route | Notes |
|---|---|
| `/shop` · `/shop/[gender]` · `/shop/[gender]/[type]` · `/shop/tag/[slug]` | server-side faceted filtering + sort + pagination (`force-dynamic`) |
| `/product/[slug]` | PDP — gallery, variation selector (size/width/colour), specs, reviews, JSON-LD |
| `/search` | results + zero-results recovery (header `SearchAutocomplete` is the single search surface) |
| `/cart` | Store API server-authoritative totals + cross-sells + coupons; mini-cart drawer in the header |
| `/checkout` + `/checkout/confirmation` | one-page guest checkout (env-gated, ships dark) |
| `/account/*` | customer dashboard / orders / addresses / details / downloads (env-gated) |

## Filtering, listing & PDP standards (locked)

The faceted filter UX, the listing layer (toolbar/sort/pagination), the PDP UX, and the cart/checkout
UX are **agency standards** — extend per client, don't re-invent. They cover: server-side WooGraphQL
filtering with disjunctive facet counts (facets never disappear), desktop-live / mobile-staged filters,
`PAGINATION_MODE` (load-more | numbered), variant-aware cards/PDP (sale/stock/backorder/colourway-image),
all four Woo product types (simple/variable/external/grouped), and the Baymard-informed cart + checkout.
Config flags live in `src/lib/commerce/config.ts` (`PRICE_DISPLAY`, `STOCK_DISPLAY`, `TAX_DISPLAY`,
`FREE_SHIPPING_THRESHOLD`, `PAGINATION_MODE`, `CHECKOUT_ENABLED`, `ACCOUNT_ENABLED`, `PAYMENT_METHODS`).

## Account ↔ auth composition

`/account` is shared by two opt-in modules and **branches on `ACCOUNT_ENABLED`**:
- **OFF (default)** → the **auth module worked-example** (identity + sign-out) renders; the commerce
  sub-routes (`orders`/`addresses`/`details`/`downloads`) `notFound()`.
- **ON** → the **storefront dashboard** renders inside the account nav shell.

This way neither opt-in module regresses the other. The portal reuses the auth module's
`requireUser`/`getSession`/`logoutAction`, so commerce-account requires the auth module too.

## Note: demo content

The provisioned demo catalogue (`wp/seed-commerce-demo.php`) is **generic placeholder data** — a real
client seeds or migrates their own products. Some storefront copy still carries POC-flavoured demo
strings (e.g. category taxonomy); treat these as content to set per client.

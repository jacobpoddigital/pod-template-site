# Authentication (member/gated content) — opt-in scaffolding

The template ships **reusable headless auth scaffolding**: a visitor logs into the site
and reaches gated content. It's **opt-in** (like commerce / TanStack Query) — a brochure
site pays nothing for it. Full build plan + rationale: HQ `docs/workflow/36`.

> **Scope:** this is **client-site member auth** (a visitor → a *client's* site), not the
> agency Hub's auth. WordPress is the identity provider; capabilities are the authorization
> model. No second user store.

**v1 shape (decided 2026-06-15):** password-only · **no self-registration** (users
provisioned in wp-admin) · **self-serve password reset included** · use-case-agnostic
(WooCommerce customer accounts will be one consumer later).

## How it works

```
Browser ──form POST──▶ Next Server Action ──GraphQL (Bearer)──▶ WordPress (WPGraphQL-JWT)
   ▲                         │
   └──── httpOnly cookies ◀──┘   (browser NEVER holds a token or calls WP directly)
```

- **Login** (`loginAction`) exchanges credentials for a JWT pair via the `login` mutation,
  then writes **`httpOnly` / `Secure` / `SameSite=Lax` cookies** (`pod_at` access,
  `pod_rt` refresh). The browser can't read them (XSS-resistant).
- **Session** (`getSession`) reads the access cookie, calls `viewer` with the Bearer
  header, returns a normalized `AuthUser` (or null). A pure read — always `no-store`.
- **Guards** (`requireUser` / `requireCapability`) run server-side in a gated layout —
  the REAL check. `middleware.ts` is only a fast redirect (defence in depth).
- **Gated content is dynamic/uncached** — public pages stay SSG/ISR untouched.
- **Password reset** uses **core** WPGraphQL (`sendPasswordResetEmail` → `resetUserPassword`)
  — no extra plugin (verified on a live 2.x endpoint, 2026-06-15).

## Routes & files

| Route | Purpose |
|---|---|
| `/login` | Credentials → cookies → redirect to `?next=` or `/account` |
| `/forgot-password` | Triggers WP's reset email (generic confirmation — no account-existence leak) |
| `/reset-password?key=…&login=…` | Target of the reset email; sets the new password |
| `/account` | **Worked example** of a gated area (guarded layout) — replace with real member content |

| Layer | File |
|---|---|
| CMS ops (cms-internal) | `src/lib/cms/auth.ts` (login/refresh/viewer/reset) + `authed-request.ts` (Bearer, no-store) — re-exported from `src/lib/cms/index.ts` |
| Pure config/types (lib) | `src/lib/auth/config.ts` (cookie names/attrs/TTLs), `src/lib/auth/types.ts` |
| App glue | `src/app/(auth)/_lib/{actions,session,guard}.ts` (Server Actions + session + guards — they touch cms-public, which `lib` may not) |
| UI | `src/app/(auth)/{login,forgot-password,reset-password}/`, `src/app/account/`, `src/middleware.ts` |
| WP | `wp/mu-plugins/pod-auth-register.php` (JWT secret assertion + notes) |

**Layer-boundary note:** `lib` may only import `lib` (lint-enforced). So the WPGraphQL auth
calls live in `lib/cms` (cms-public), and the cookie/session orchestration lives in the
`app` layer — never in `lib/auth` (which stays pure config/types).

## Offline / dev

With no `WPGRAPHQL_URL` (or `CMS_MODE=mock`), the CMS mock answers the auth
mutations (`src/lib/cms/mock/auth.ts`), so the whole flow runs with **no WordPress and no
JWT plugin**. Dev demo credential: **`member@example.com` / `password`**. `pnpm build`
(or `CMS_MODE=mock pnpm dev`) renders every auth route offline.

## Security (non-negotiables)

- Tokens in **`httpOnly` cookies only** — never in JS reach.
- **No personalised response cached** (gated reads `no-store`; SSG stays public-only).
- **Browser never calls WP** — the Next server is the only WP client.
- **CSRF**: `SameSite=Lax` + a same-origin check (`assertSameOrigin`) on every mutating action.
- **Open-redirect guard**: `?next=` must be a same-site relative path.
- **No enumeration**: login + forgot-password show generic messages; never reveal whether
  an account exists.
- **Least privilege**: gate on **capabilities**, re-checked server-side — never trust a
  client-claimed role.
- **Server-side Zod** on every action (security, not just UX — `docs/standards.md §5`).

## Go-live gate (the one remaining live step)

The login/refresh half rides on the **`wp-graphql-jwt-authentication`** plugin, which is
**not yet verified against this project's WPGraphQL 2.x** (the core reset/viewer half WAS
verified, 2026-06-15). Before a real login site goes live:

1. Install + activate `wp-graphql-jwt-authentication` (composer or GitHub release).
2. Define `GRAPHQL_JWT_AUTH_SECRET_KEY` in wp-config / as an env secret (never commit;
   rotating it logs everyone out). `pod-auth-register.php` shows an admin error if it's
   missing while the plugin is active.
3. In GraphiQL, confirm `login` returns `authToken`/`refreshToken` and a `viewer` query
   with the Bearer header returns the user. If the plugin is unhealthy on 2.x, evaluate
   `wp-graphql-headless-login` (also enables social/SSO) — only the `src/lib/cms/auth.ts`
   mutations + the SDL change; the rest of the module is plugin-agnostic.
4. **Harden before launch**: rate-limit `/login` (brute-force), add lockout/backoff, and
   wire token **revocation** into `logoutAction` (secret-bump). See `docs/workflow/36` Phase 3.

## Not in v1 (add later)

- **Self-registration** — `registerUser` exists in core but is deliberately not exposed;
  adding it needs email verification + spam defence.
- **Social / SSO** — switch to `wp-graphql-headless-login`.
- **WooCommerce customer accounts** — this session model carries over; the account area
  becomes order history / downloads (couples to `docs/workflow/14`).

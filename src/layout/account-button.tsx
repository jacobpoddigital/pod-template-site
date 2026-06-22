"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "lucide-react";

// Header account entry. The header is a server component in the root layout, so auth state
// hydrates client-side from /api/account/state to keep static pages static (mirrors CartButton).
// Signed in → "Account" → /account; signed out → "Sign in" → /login?next=/account. Refetches on
// the `auth:changed` window event + focus so it stays truthful after login/logout. Generic → M5.
type State = { signedIn: boolean; name: string | null };

function accountLabel(state: State | null): string {
  if (state === null) return "Your account"; // pre-hydration: neutral
  if (!state.signedIn) return "Sign in";
  return state.name ? `Account — ${state.name}` : "Account";
}

export function AccountButton() {
  const [state, setState] = useState<State | null>(null);
  // The header lives in the root layout and does NOT re-mount across soft navigations — so login/logout
  // (server actions that redirect) wouldn't refresh it on mount alone. Refetch on every pathname change
  // (covers the post-login/logout redirect) plus the `auth:changed` event + window focus.
  const pathname = usePathname();

  useEffect(() => {
    const load = () =>
      fetch("/api/account/state", { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .then((d: State | null) => d && setState(d))
        .catch(() => {});
    load();
    window.addEventListener("auth:changed", load);
    window.addEventListener("focus", load);
    return () => {
      window.removeEventListener("auth:changed", load);
      window.removeEventListener("focus", load);
    };
  }, [pathname]);

  // Before hydration `state` is null — render a neutral "account" affordance (links to /account; the
  // layout guard redirects to login if needed), so there's never a misleading flash.
  const signedIn = Boolean(state?.signedIn);
  const href = signedIn ? "/account" : "/login?next=/account";
  const name = signedIn ? state?.name : null;
  const showSignInText = state !== null && !signedIn;

  return (
    <Link
      href={href}
      aria-label={accountLabel(state)}
      className="inline-flex h-11 items-center justify-center gap-1.5 rounded-card px-2 text-ink transition-colors hover:text-link focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <User className="h-5 w-5" aria-hidden="true" />
      {showSignInText ? <span className="hidden body-sm font-medium lg:inline">Sign in</span> : null}
      {name ? <span className="hidden body-sm font-medium lg:inline">{name}</span> : null}
    </Link>
  );
}

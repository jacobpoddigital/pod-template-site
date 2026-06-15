import { redirect } from "next/navigation";
import { LOGIN_PATH } from "@/lib/auth/config";
import type { AuthUser } from "@/lib/auth/types";
import { getSession } from "./session";

// Server-side guards — the REAL authorization check (middleware is only a fast redirect;
// defence in depth). Call at the top of a gated layout/page. Authorization is on
// CAPABILITIES, not merely "logged in" — re-checked from the token, never trusting a
// client-supplied role. docs/auth.md.

/** Require any authenticated user; redirect to /login?next=… otherwise. Returns the user. */
export async function requireUser(nextPath?: string): Promise<AuthUser> {
  const user = await getSession();
  if (!user) {
    const q = nextPath ? `?next=${encodeURIComponent(nextPath)}` : "";
    redirect(`${LOGIN_PATH}${q}`);
  }
  return user;
}

/** Require a specific WP capability; redirect if anonymous, throw 403 if authenticated-but-unauthorized. */
export async function requireCapability(capability: string, nextPath?: string): Promise<AuthUser> {
  const user = await requireUser(nextPath);
  if (!user.capabilities.includes(capability)) {
    throw new Error(`Forbidden: missing capability "${capability}"`);
  }
  return user;
}

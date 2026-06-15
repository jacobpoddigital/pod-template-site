"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { cmsLogin, cmsRefresh, cmsSendResetEmail, cmsResetPassword } from "@/lib/cms";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  REFRESH_MAX_AGE,
  AFTER_LOGIN_PATH,
  cookieOptions,
} from "@/lib/auth/config";
import type { LoginState, ResetState } from "@/lib/auth/types";

// Auth Server Actions (app layer — they touch cms-public, which lib may not). Credentials
// touch ONLY the server; tokens go to httpOnly cookies the browser can't read. Every
// mutating action runs a same-origin check (CSRF defence, paired with SameSite=Lax). Zod
// validates server-side (security, not just UX — docs/standards.md §5). Generic messages
// everywhere so we never leak whether an account exists. docs/auth.md.

/** Reject cross-site POSTs. The browser sends Origin on form POSTs; if present it must
 *  match Host. Absent Origin falls back to a Referer-host check. */
async function assertSameOrigin(): Promise<void> {
  const h = await headers();
  const host = h.get("host");
  const origin = h.get("origin");
  if (origin) {
    if (new URL(origin).host !== host) throw new Error("Cross-origin request rejected.");
    return;
  }
  const referer = h.get("referer");
  if (referer && new URL(referer).host !== host) throw new Error("Cross-origin request rejected.");
}

/** Only allow same-site relative paths as a post-login redirect (open-redirect guard). */
function safeNext(next: FormDataEntryValue | null): string {
  const v = typeof next === "string" ? next : "";
  return v.startsWith("/") && !v.startsWith("//") ? v : AFTER_LOGIN_PATH;
}

async function setSessionCookies(authToken: string, refreshToken: string | null): Promise<void> {
  const jar = await cookies();
  jar.set(ACCESS_COOKIE, authToken, cookieOptions()); // session-scoped (no maxAge)
  if (refreshToken) jar.set(REFRESH_COOKIE, refreshToken, cookieOptions(REFRESH_MAX_AGE));
}

const loginSchema = z.object({
  username: z.string().trim().min(1, "Enter your username or email."),
  password: z.string().min(1, "Enter your password."),
});

const BAD_CREDS = "Incorrect username or password.";

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  await assertSameOrigin();
  const parsed = loginSchema.safeParse({ username: formData.get("username"), password: formData.get("password") });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid details." };

  let result: Awaited<ReturnType<typeof cmsLogin>> = null;
  try {
    result = await cmsLogin(parsed.data.username, parsed.data.password);
  } catch {
    return { ok: false, error: BAD_CREDS }; // WP errors on bad creds — never reveal which field
  }
  if (!result?.authToken) return { ok: false, error: BAD_CREDS };

  await setSessionCookies(result.authToken, result.refreshToken);
  redirect(safeNext(formData.get("next"))); // throws NEXT_REDIRECT — must be outside try
}

export async function logoutAction(): Promise<void> {
  await assertSameOrigin();
  const jar = await cookies();
  jar.delete(ACCESS_COOKIE);
  jar.delete(REFRESH_COOKIE);
  // GO-LIVE: also call a WP revoke/secret-bump so outstanding tokens die (docs/auth.md §Go-live).
  redirect("/");
}

/** Mint a fresh access token from the refresh cookie. Server-only; for a route handler to
 *  call before an authed read when the access token has expired. Returns the new token. */
export async function refreshAccessToken(): Promise<string | null> {
  const jar = await cookies();
  const refresh = jar.get(REFRESH_COOKIE)?.value;
  if (!refresh) return null;
  try {
    const token = await cmsRefresh(refresh);
    if (token) jar.set(ACCESS_COOKIE, token, cookieOptions());
    return token;
  } catch {
    return null;
  }
}

const forgotSchema = z.object({ username: z.string().trim().min(1, "Enter your username or email.") });

export async function sendResetAction(_prev: ResetState, formData: FormData): Promise<ResetState> {
  await assertSameOrigin();
  const parsed = forgotSchema.safeParse({ username: formData.get("username") });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };
  try {
    await cmsSendResetEmail(parsed.data.username);
  } catch {
    // Swallow — never reveal whether the account exists (enumeration defence).
  }
  return { ok: true, done: true }; // always the same generic outcome
}

const resetSchema = z
  .object({
    key: z.string().min(1),
    login: z.string().min(1),
    password: z.string().min(8, "Use at least 8 characters."),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { message: "Passwords don't match.", path: ["confirm"] });

export async function resetPasswordAction(_prev: ResetState, formData: FormData): Promise<ResetState> {
  await assertSameOrigin();
  const parsed = resetSchema.safeParse({
    key: formData.get("key"),
    login: formData.get("login"),
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid details." };
  try {
    await cmsResetPassword({ key: parsed.data.key, login: parsed.data.login, password: parsed.data.password });
  } catch {
    return { ok: false, error: "That reset link is invalid or has expired. Request a new one." };
  }
  redirect("/login?reset=1");
}

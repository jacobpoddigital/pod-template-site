import { authedRequest } from "./authed-request";
import {
  LoginDocument,
  RefreshAuthTokenDocument,
  ViewerDocument,
  SendPasswordResetEmailDocument,
  ResetUserPasswordDocument,
} from "./generated/graphql";

// Auth WPGraphQL operations (cms-internal — lib/cms is the SOLE WPGraphQL entry point,
// workflow/02). The cookie/session/CSRF orchestration lives in the app layer
// (src/app/(auth)/_lib) which calls these through the public index. All uncached
// (authedRequest is always no-store). docs/auth.md.

/** The authenticated viewer shape these ops return (normalized in the app layer). */
export interface RawViewer {
  id?: string | null;
  databaseId: number;
  name?: string | null;
  email?: string | null;
  capabilities?: (string | null)[] | null;
}

/** Exchange credentials for a JWT pair. Null = bad credentials. */
export async function cmsLogin(
  username: string,
  password: string,
): Promise<{ authToken: string | null; refreshToken: string | null; user: RawViewer | null } | null> {
  const data = await authedRequest(LoginDocument, { username, password });
  if (!data.login) return null;
  return {
    authToken: data.login.authToken ?? null,
    refreshToken: data.login.refreshToken ?? null,
    user: data.login.user ?? null,
  };
}

/** Mint a fresh access token from a refresh token. Null on failure. */
export async function cmsRefresh(refreshToken: string): Promise<string | null> {
  const data = await authedRequest(RefreshAuthTokenDocument, { jwtRefreshToken: refreshToken });
  return data.refreshJwtAuthToken?.authToken ?? null;
}

/** The current user for a Bearer token (core `viewer`). Null when anonymous/expired. */
export async function cmsViewer(token: string): Promise<RawViewer | null> {
  const data = await authedRequest(ViewerDocument, {}, token);
  return data.viewer ?? null;
}

/** Trigger WP's password-reset email (core). We never surface the result (enumeration). */
export async function cmsSendResetEmail(username: string): Promise<void> {
  await authedRequest(SendPasswordResetEmailDocument, { username });
}

/** Complete a password reset with the emailed key + login (core). */
export async function cmsResetPassword(args: { key: string; login: string; password: string }): Promise<void> {
  await authedRequest(ResetUserPasswordDocument, args);
}

// Normalized auth domain types — what the app sees (never a raw WP/JWT shape).

/** The authenticated user, normalized from `viewer` / the login payload. */
export interface AuthUser {
  id: string;
  databaseId: number;
  name: string;
  email: string | null;
  /** WP capabilities (e.g. "read", "edit_posts") — the authorization model. */
  capabilities: string[];
}

/** Result of a login attempt, surfaced to the login form via useActionState. */
export type LoginState = { ok: boolean; error?: string };

/** Result of the forgot-password / reset-password actions. */
export type ResetState = { ok: boolean; error?: string; done?: boolean };

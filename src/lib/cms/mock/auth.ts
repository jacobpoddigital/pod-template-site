// DEV-ONLY auth mock (opt-in module — docs/auth.md). Answers the auth mutations/queries
// so the login + reset flows run with NO WordPress and NO JWT plugin (mirrors mock/blog.ts).
// A demo credential makes the happy path clickable; everything else fails like real bad
// creds. NOT shipped — routed only when WPGRAPHQL_URL is unset or CMS_MODE=mock.

export const mockViewer = {
  id: "dXNlcjox",
  databaseId: 1,
  name: "Demo Member",
  email: "member@example.com",
  capabilities: ["read", "level_0"],
};

/** The dev demo login — any of these usernames + this password "succeeds" offline. */
const DEMO_USERNAMES = new Set(["member", "member@example.com", "demo"]);
const DEMO_PASSWORD = "password";

export function mockLogin(vars: Record<string, unknown>) {
  const username = String(vars.username ?? "");
  const password = String(vars.password ?? "");
  if (DEMO_USERNAMES.has(username) && password === DEMO_PASSWORD) {
    return { login: { authToken: "mock-access-token", refreshToken: "mock-refresh-token", user: mockViewer } };
  }
  return { login: null }; // bad creds → the action shows the generic error
}

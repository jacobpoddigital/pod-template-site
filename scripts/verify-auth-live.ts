// THROWAWAY — auth go-live verification (HQ workflow/36 Phase 0 / docs/auth.md §Go-live).
// Exercises the REAL scaffolding CMS layer (cmsLogin/cmsViewer/cmsRefresh) against a live
// WordPress + wp-graphql-jwt-authentication endpoint, proving the wiring end-to-end (not the
// raw contract). Run:  WPGRAPHQL_URL=http://localhost:8092/graphql pnpm dlx tsx scripts/verify-auth-live.ts
import { cmsLogin, cmsViewer, cmsRefresh } from "@/lib/cms";
import { revokeRefreshToken, isRefreshTokenRevoked } from "@/app/(auth)/_lib/revocation";

const USER = process.env.AUTH_TEST_USER ?? "member";
const PASS = process.env.AUTH_TEST_PASS ?? "Password123!";

function ok(label: string, cond: boolean, extra = "") {
  console.log(`${cond ? "PASS" : "FAIL"}  ${label}${extra ? "  — " + extra : ""}`);
  if (!cond) process.exitCode = 1;
}

async function main() {
  console.log(`endpoint: ${process.env.WPGRAPHQL_URL}\n`);

  // 1. login → token pair + normalized user
  const login = await cmsLogin(USER, PASS);
  ok("cmsLogin returns an access token", !!login?.authToken);
  ok("cmsLogin returns a refresh token", !!login?.refreshToken);
  ok("cmsLogin returns the user with capabilities", !!login?.user?.capabilities?.length,
    JSON.stringify(login?.user?.capabilities));

  // 2. viewer with the Bearer token round-trips
  const viewer = await cmsViewer(login!.authToken!);
  ok("cmsViewer(token) returns the same member", viewer?.email === "member@example.com",
    viewer?.email ?? "null");

  // 3. anonymous viewer is null
  const anon = await cmsViewer("");
  ok("cmsViewer(no token) is null (anonymous)", anon === null);

  // 4. refresh mints a fresh access token
  const refreshed = await cmsRefresh(login!.refreshToken!);
  ok("cmsRefresh(refreshToken) mints a new access token", !!refreshed);

  // 5. the refreshed token also works against viewer
  const viewer2 = await cmsViewer(refreshed!);
  ok("refreshed token authenticates viewer", viewer2?.email === "member@example.com");

  // 6. bad credentials → null (the action maps this to the generic error)
  const bad = await cmsLogin(USER, "definitely-wrong").catch(() => null);
  ok("cmsLogin(bad password) yields no token", !bad?.authToken);

  // 7. logout revocation: the denylist gate refuses a revoked refresh token (the Phase-3
  //    server-side revocation — independent of the plugin's account-level kill switch).
  const fresh = await cmsLogin(USER, PASS);
  const rt = fresh!.refreshToken!;
  ok("a fresh refresh token is NOT revoked", !(await isRefreshTokenRevoked(rt)));
  await revokeRefreshToken(rt);
  ok("after logout, the refresh token IS revoked (gate blocks refresh)", await isRefreshTokenRevoked(rt));
  ok("an unrelated token is unaffected", !(await isRefreshTokenRevoked(fresh!.authToken!)));
}

main().catch((e) => {
  console.error("THREW:", e?.message ?? e);
  process.exitCode = 1;
});

import { cookies } from "next/headers";
import { cmsViewer, type RawViewer } from "@/lib/cms";
import { ACCESS_COOKIE } from "@/lib/auth/config";
import type { AuthUser } from "@/lib/auth/types";

// Server-side session reader (app layer — it touches cms-public, which lib may not).
// Reads the httpOnly access cookie, asks WP "who am I" (viewer), normalizes. Returns null
// for anonymous/expired. A PURE READ — never sets cookies (a Server Component may not);
// refresh lives in the actions/route handler. Always uncached (cmsViewer → no-store).

function normalize(v: RawViewer): AuthUser {
  return {
    id: v.id ?? String(v.databaseId),
    databaseId: v.databaseId,
    name: v.name ?? "",
    email: v.email ?? null,
    capabilities: (v.capabilities ?? []).filter((c): c is string => Boolean(c)),
  };
}

/** The current user, or null. Call from a layout/page/guard — never trust a client claim. */
export async function getSession(): Promise<AuthUser | null> {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (!token) return null; // no cookie → anonymous (also gates the mock, which ignores the token)
  try {
    const viewer = await cmsViewer(token);
    return viewer ? normalize(viewer) : null;
  } catch {
    return null; // expired/invalid token → anonymous
  }
}

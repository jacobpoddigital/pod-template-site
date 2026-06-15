import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_COOKIE, REFRESH_COOKIE, LOGIN_PATH } from "@/lib/auth/config";

// Edge middleware — a FAST redirect only, NOT the security boundary. It checks for the
// presence of a session cookie and bounces obviously-anonymous requests to /login before
// they hit the server render. The REAL authorization check is the server-side guard
// (requireUser in the /account layout), which verifies the token with WP. Defence in depth.
// docs/auth.md.

const GATED_PREFIXES = ["/account"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const gated = GATED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (!gated) return NextResponse.next();

  // Presence check only — a token here doesn't prove validity (the layout guard does that).
  const hasSession = req.cookies.has(ACCESS_COOKIE) || req.cookies.has(REFRESH_COOKIE);
  if (hasSession) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = LOGIN_PATH;
  url.search = `?next=${encodeURIComponent(pathname)}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Run only on the gated trees (keeps middleware off every public request).
  matcher: ["/account/:path*"],
};

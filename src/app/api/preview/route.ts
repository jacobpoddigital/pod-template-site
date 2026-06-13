import { draftMode } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// Draft preview (boilerplate §4): WordPress "Preview" button → this route → enable
// Next draftMode (sets the cookie) → redirect to the page. While the cookie is set,
// a DYNAMIC render path passes { preview: true } to getPage, which fetches uncached
// (no-store) so the editor sees unpublished/just-saved content immediately.
//
// Point Yoast/WP's preview link at:
//   <frontend>/api/preview?secret=<PREVIEW_SECRET>&slug=<path>
//
// NOTE: content pages are SSG by default (dynamic="error") — they will NOT pick up the
// draft. To actually view drafts, render a DYNAMIC preview route (see docs/preview.md);
// fetching the DRAFT body also needs an AUTHENTICATED WP request (a WP application
// password) — that credential is the remaining setup. This route + the getPage/cmsRequest
// preview plumbing are the scaffold.
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const secret = searchParams.get("secret");
  const slug = searchParams.get("slug") ?? "/";

  if (!process.env.PREVIEW_SECRET || secret !== process.env.PREVIEW_SECRET) {
    return NextResponse.json({ preview: false, error: "Invalid token" }, { status: 401 });
  }

  // Only allow internal redirects — never an open redirect from an attacker-supplied slug.
  const path = slug.startsWith("/") ? slug : `/${slug}`;
  (await draftMode()).enable();
  return NextResponse.redirect(new URL(path, request.nextUrl.origin));
}

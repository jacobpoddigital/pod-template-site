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
// Enables draftMode, then redirects to the DYNAMIC /preview/<path> route (NOT the SSG
// content route, which can't read the draft cookie — that keeps real visitors static).
// The preview route fetches uncached + authenticated. Remaining per-project setup to view
// true drafts: the WP application password (WP_APP_USER/WP_APP_PASSWORD) + the query
// resolving draft status WP-side. See docs/preview.md.
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const secret = searchParams.get("secret");
  const slug = searchParams.get("slug") ?? "/";

  if (!process.env.PREVIEW_SECRET || secret !== process.env.PREVIEW_SECRET) {
    return NextResponse.json({ preview: false, error: "Invalid token" }, { status: 401 });
  }

  // Normalise to a /preview/<path> segment. Root → the WP "home" page slug (served at
  // "/" normally, but the [...slug] preview route needs a segment). Only internal paths.
  const clean = slug.replace(/^\/+/, "").replace(/\/+$/, "");
  const previewPath = `/preview/${clean === "" ? "home" : clean}`;
  (await draftMode()).enable();
  return NextResponse.redirect(new URL(previewPath, request.nextUrl.origin));
}

import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { PAGES_TAG, POSTS_TAG, CHROME_TAG, CASE_STUDIES_TAG } from "@/lib/cms";

// On-demand ISR (workflow/02): WP "post saved" webhook → this route → revalidateTag.
// Configure the webhook to POST .../api/revalidate?secret=<REVALIDATE_SECRET>
// with an optional JSON body: { "tags": ["pages", "page:home"] }.

// Health check (no secret required): lets monitoring / the WP webhook setup confirm the
// endpoint is live and whether REVALIDATE_SECRET is wired in this environment. Reports only
// a boolean — never the secret value.
export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: "revalidate",
    knownTags: [PAGES_TAG, POSTS_TAG, CHROME_TAG, CASE_STUDIES_TAG],
    secretConfigured: Boolean(process.env.REVALIDATE_SECRET),
  });
}

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ revalidated: false }, { status: 401 });
  }

  const body: unknown = await request.json().catch(() => ({}));
  const requested =
    typeof body === "object" && body !== null && "tags" in body ? body.tags : null;
  const tags =
    Array.isArray(requested) && requested.every((t) => typeof t === "string")
      ? requested
      : ["pages"];

  // Next 16 signature: a cache-life profile is required — "max" = purge now,
  // regenerate on next request (classic webhook-driven ISR).
  tags.forEach((tag) => revalidateTag(tag, "max"));
  return NextResponse.json({ revalidated: true, tags });
}

import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

// On-demand ISR (workflow/02): WP "post saved" webhook → this route → revalidateTag.
// Configure the webhook to POST .../api/revalidate?secret=<REVALIDATE_SECRET>
// with an optional JSON body: { "tags": ["pages", "page:home"] }.

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

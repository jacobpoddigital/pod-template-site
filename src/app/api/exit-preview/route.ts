import { draftMode } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// Exit draft preview (boilerplate §4): clears the draftMode cookie and returns to the
// page (or home). Link this from a small "Exit preview" banner shown while draftMode is on.
export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug") ?? "/";
  const path = slug.startsWith("/") ? slug : `/${slug}`;
  (await draftMode()).disable();
  return NextResponse.redirect(new URL(path, request.nextUrl.origin));
}

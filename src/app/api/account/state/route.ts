import { NextResponse } from "next/server";
import { getSession } from "@/app/(auth)/_lib/session";

// Auth state for header chrome (Account vs Sign in). The header lives in the root layout, so it
// can't read the session directly without opting every page — incl. fully-static ones — into
// dynamic rendering. The client AccountButton fetches this instead (mirrors /api/cart). Never
// cached (per-user). Returns only a display name — never the token or capabilities.
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSession();
  const firstName = user?.name?.trim().split(/\s+/)[0] ?? null;
  return NextResponse.json(
    { signedIn: Boolean(user), name: firstName },
    { headers: { "Cache-Control": "no-store" } },
  );
}

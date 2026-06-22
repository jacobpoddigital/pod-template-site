import { NextResponse } from "next/server";
import { getSession } from "@/app/(auth)/_lib/session";
import { getCustomerOrders } from "@/lib/commerce/customer";

// Paginated order history for the account "Load more" island. Gated (session required) + never
// cached (personalised). Cursor-based via the WooGraphQL customer.orders connection.
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!(await getSession())) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  const after = new URL(req.url).searchParams.get("after") ?? undefined;
  try {
    const data = await getCustomerOrders(20, after);
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Couldn't load orders." }, { status: 502 });
  }
}

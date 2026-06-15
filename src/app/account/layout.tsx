import { requireUser } from "../(auth)/_lib/guard";

// Gates EVERY /account/* route server-side (the real check; middleware is just a fast
// redirect). Unauthenticated → /login?next=/account. This is the worked example of a
// gated area — point a client's member content at this pattern. docs/auth.md.
export const dynamic = "force-dynamic";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  await requireUser("/account");
  return <>{children}</>;
}

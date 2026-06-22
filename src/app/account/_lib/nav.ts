import { LayoutDashboard, Package, MapPin, UserCog, Download, type LucideIcon } from "lucide-react";

// The account section's navigation map — one source of truth for the desktop sidebar AND the mobile
// pill row, so they never drift. Every entry is a gated /account/* route. Generic → template M5.
export type AccountNavItem = { href: string; label: string; icon: LucideIcon };

export const ACCOUNT_NAV: AccountNavItem[] = [
  { href: "/account", label: "Dashboard", icon: LayoutDashboard },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/details", label: "Account details", icon: UserCog },
  { href: "/account/downloads", label: "Downloads", icon: Download },
];

/** The active nav item for a pathname — exact match for the dashboard, prefix match for sub-sections
 *  (so /account/orders/123 highlights "Orders"). Returns the longest matching href. */
export function activeHref(pathname: string): string {
  const matches = ACCOUNT_NAV.filter((i) => (i.href === "/account" ? pathname === "/account" : pathname.startsWith(i.href)));
  return matches.sort((a, b) => b.href.length - a.href.length)[0]?.href ?? "/account";
}

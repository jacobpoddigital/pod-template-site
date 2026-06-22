"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/app/(auth)/_lib/actions";
import { ACCOUNT_NAV, activeHref } from "../_lib/nav";

// Account section navigation — a desktop sidebar (vertical, sticky) + a mobile horizontal pill row,
// both driven by ACCOUNT_NAV so they can't drift. Active state from the pathname. Sign-out posts the
// logout Server Action. aria-current marks the active link for assistive tech. Generic → template M5.
export function AccountNav() {
  const pathname = usePathname();
  const active = activeHref(pathname);

  const link = (mobile: boolean) =>
    ACCOUNT_NAV.map(({ href, label, icon: Icon }) => {
      const isActive = href === active;
      return (
        <Link
          key={href}
          href={href}
          aria-current={isActive ? "page" : undefined}
          className={cn(
            "inline-flex items-center gap-2.5 rounded-md border body-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            mobile ? "shrink-0 px-3 py-2" : "px-3 py-2.5",
            isActive
              ? "border-border bg-surface-muted text-foreground"
              : "border-transparent text-muted-foreground hover:bg-surface-muted hover:text-foreground",
          )}
        >
          <Icon className="size-4 shrink-0" aria-hidden="true" />
          {label}
        </Link>
      );
    });

  return (
    <nav aria-label="Account" className="lg:sticky lg:top-24 lg:h-fit">
      {/* Desktop: vertical sidebar */}
      <div className="hidden flex-col gap-1 lg:flex">
        {link(false)}
        <form action={logoutAction} className="mt-2 border-t border-border pt-2">
          <button
            type="submit"
            className="inline-flex w-full items-center gap-2.5 rounded-md border border-transparent px-3 py-2.5 body-sm font-medium text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <LogOut className="size-4 shrink-0" aria-hidden="true" /> Sign out
          </button>
        </form>
      </div>

      {/* Mobile: horizontal scrolling pill row */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:hidden">
        {link(true)}
        <form action={logoutAction} className="shrink-0">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-md border border-transparent px-3 py-2 body-sm font-medium text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <LogOut className="size-4 shrink-0" aria-hidden="true" /> Sign out
          </button>
        </form>
      </div>
    </nav>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/lib/cms";

// Desktop primary nav (roadmap H1 + mega menu). The WP menu's DEPTH picks the
// rendering — no per-client code, no bespoke ACF:
//   • no children         → a plain link
//   • children, 1 level    → a simple flyout (single column of links)
//   • children, 2 levels   → a MEGA menu (each 2nd-level item = a column heading,
//                            its children = the column's links, with optional
//                            menu-item `description` shown under each)
// Keyboard/focus/aria are handled by Radix NavigationMenu. Hidden below lg (the
// mobile drawer drills the same tree).

function current(href: string, pathname: string): "page" | undefined {
  return href === pathname ? "page" : undefined;
}

const linkClass =
  "block rounded body-sm font-medium text-ink-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

const triggerClass = cn(linkClass, "inline-flex items-center gap-1 outline-none [&[data-state=open]>svg]:rotate-180");

function Chevron() {
  return (
    <ChevronDown
      className="h-4 w-4 shrink-0 motion-safe:transition-transform motion-safe:duration-200"
      aria-hidden="true"
    />
  );
}

function TopLink({ item, pathname }: { item: NavItem; pathname: string }) {
  return (
    <NavigationMenu.Item>
      <NavigationMenu.Link asChild>
        <Link
          href={item.href}
          aria-current={current(item.href, pathname)}
          className={cn(linkClass, current(item.href, pathname) && "text-ink")}
        >
          {item.label}
        </Link>
      </NavigationMenu.Link>
    </NavigationMenu.Item>
  );
}

function TopFlyout({ item, pathname }: { item: NavItem; pathname: string }) {
  const children = item.children ?? [];
  return (
    <NavigationMenu.Item>
      <NavigationMenu.Trigger className={triggerClass}>
        {item.label}
        <Chevron />
      </NavigationMenu.Trigger>
      <NavigationMenu.Content className="absolute left-0 top-full mt-2 min-w-56 rounded-card border border-border bg-surface p-2 shadow-card">
        <ul className="flex flex-col">
          {children.map((c, i) => (
            <li key={`${c.href}-${i}`}>
              <NavigationMenu.Link asChild>
                <Link
                  href={c.href}
                  aria-current={current(c.href, pathname)}
                  className={cn(linkClass, "px-3 py-2 hover:bg-muted", current(c.href, pathname) && "text-ink")}
                >
                  {c.label}
                </Link>
              </NavigationMenu.Link>
            </li>
          ))}
        </ul>
      </NavigationMenu.Content>
    </NavigationMenu.Item>
  );
}

function MegaLink({ item, pathname }: { item: NavItem; pathname: string }) {
  return (
    <li>
      <NavigationMenu.Link asChild>
        <Link
          href={item.href}
          aria-current={current(item.href, pathname)}
          className="block rounded px-3 py-2 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <span className="block body-sm font-medium text-ink">{item.label}</span>
          {item.description ? (
            <span className="mt-0.5 block body-sm text-ink-muted">{item.description}</span>
          ) : null}
        </Link>
      </NavigationMenu.Link>
    </li>
  );
}

function MegaHeading({ group, pathname }: { group: NavItem; pathname: string }) {
  if (!group.href || group.href === "#") {
    return <p className="px-3 pb-1 label text-ink-muted">{group.label}</p>;
  }
  return (
    <NavigationMenu.Link asChild>
      <Link
        href={group.href}
        aria-current={current(group.href, pathname)}
        className="block rounded px-3 pb-1 label text-ink-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {group.label}
      </Link>
    </NavigationMenu.Link>
  );
}

function MegaColumn({ group, pathname }: { group: NavItem; pathname: string }) {
  const links = group.children ?? [];
  return (
    <div>
      <MegaHeading group={group} pathname={pathname} />
      {links.length ? (
        <ul className="mt-1 flex flex-col">
          {links.map((c, i) => (
            <MegaLink key={`${c.href}-${i}`} item={c} pathname={pathname} />
          ))}
        </ul>
      ) : null}
    </div>
  );
}

const MEGA_COLS: Record<number, string> = { 1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3" };

function TopMega({ item, pathname }: { item: NavItem; pathname: string }) {
  const columns = item.children ?? [];
  const cols = MEGA_COLS[Math.min(columns.length, 3)] ?? MEGA_COLS[3];
  return (
    <NavigationMenu.Item>
      <NavigationMenu.Trigger className={triggerClass}>
        {item.label}
        <Chevron />
      </NavigationMenu.Trigger>
      <NavigationMenu.Content className="absolute left-0 top-full mt-2 w-[min(46rem,92vw)] rounded-card border border-border bg-surface p-4 shadow-card">
        <div className={cn("grid gap-x-8 gap-y-5", cols)}>
          {columns.map((g, i) => (
            <MegaColumn key={`${g.href}-${i}`} group={g} pathname={pathname} />
          ))}
        </div>
      </NavigationMenu.Content>
    </NavigationMenu.Item>
  );
}

function isMega(item: NavItem): boolean {
  return (item.children ?? []).some((c) => c.children?.length);
}

export function DesktopNav({ nav }: { nav: NavItem[] }) {
  const pathname = usePathname();
  return (
    <NavigationMenu.Root className="relative hidden lg:block" aria-label="Main">
      <NavigationMenu.List className="flex items-center gap-6">
        {nav.map((item, i) => {
          const key = `${item.href}-${i}`;
          if (isMega(item)) return <TopMega key={key} item={item} pathname={pathname} />;
          if (item.children?.length) return <TopFlyout key={key} item={item} pathname={pathname} />;
          return <TopLink key={key} item={item} pathname={pathname} />;
        })}
      </NavigationMenu.List>
    </NavigationMenu.Root>
  );
}

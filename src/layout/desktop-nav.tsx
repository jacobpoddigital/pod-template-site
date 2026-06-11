"use client";

import * as React from "react";
import Link from "next/link";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/lib/cms";

// Desktop primary nav with flyout sub-menus (roadmap H1). Top-level items with
// children render a Radix NavigationMenu trigger + panel (keyboard-operable,
// aria-expanded, Esc to close, focus managed). Flat items render a plain link.
// The mobile drawer handles < lg; this is hidden below lg.

const linkClass =
  "block rounded body-sm font-medium text-ink-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

function TopLink({ item }: { item: NavItem }) {
  return (
    <NavigationMenu.Item>
      <NavigationMenu.Link asChild>
        <Link href={item.href} className={linkClass}>
          {item.label}
        </Link>
      </NavigationMenu.Link>
    </NavigationMenu.Item>
  );
}

function TopFlyout({ item }: { item: NavItem }) {
  const children = item.children ?? [];
  return (
    <NavigationMenu.Item>
      <NavigationMenu.Trigger
        className={cn(
          linkClass,
          "inline-flex items-center gap-1 outline-none [&[data-state=open]>svg]:rotate-180",
        )}
      >
        {item.label}
        <ChevronDown
          className="h-4 w-4 shrink-0 motion-safe:transition-transform motion-safe:duration-200"
          aria-hidden="true"
        />
      </NavigationMenu.Trigger>
      <NavigationMenu.Content className="absolute left-0 top-full mt-2 min-w-56 rounded-card border border-border bg-surface p-2 shadow-card">
        <ul className="flex flex-col">
          {children.map((c) => (
            <li key={c.href}>
              <NavigationMenu.Link asChild>
                <Link href={c.href} className={cn(linkClass, "px-3 py-2 hover:bg-muted")}>
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

export function DesktopNav({ nav }: { nav: NavItem[] }) {
  return (
    <NavigationMenu.Root className="relative hidden lg:block" aria-label="Main">
      <NavigationMenu.List className="flex items-center gap-6">
        {nav.map((item) =>
          item.children?.length ? (
            <TopFlyout key={item.href} item={item} />
          ) : (
            <TopLink key={item.href} item={item} />
          ),
        )}
      </NavigationMenu.List>
    </NavigationMenu.Root>
  );
}

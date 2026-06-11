"use client";

import * as React from "react";
import Link from "next/link";
import { X } from "lucide-react";

// Dismissible announcement strip above the header. Opaque (never translucent) so
// text stays legible. Remembers dismissal per message (keyed on the text), so a
// new announcement re-appears. Read via useSyncExternalStore so SSR and the first
// client render agree (no hydration mismatch, no synchronous setState-in-effect).
const KEY = "pod-announcement-dismissed";

let listeners: (() => void)[] = [];

function subscribe(cb: () => void) {
  listeners.push(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners = listeners.filter((l) => l !== cb);
    window.removeEventListener("storage", cb);
  };
}

function getDismissed(): string | null {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function dismissAnnouncement(text: string) {
  try {
    window.localStorage.setItem(KEY, text);
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

export function AnnouncementBar({
  text,
  href,
  linkLabel,
}: {
  text: string;
  href?: string;
  linkLabel?: string;
}) {
  const dismissed = React.useSyncExternalStore(subscribe, getDismissed, () => null);
  if (dismissed === text) return null;

  return (
    <div className="bg-primary text-primary-foreground" data-block="announcement_bar">
      <div className="mx-auto flex min-h-11 max-w-[1440px] items-center justify-center gap-3 px-4 py-2 md:px-8 lg:px-16">
        <p className="body-sm font-medium">
          {text}
          {href && linkLabel ? (
            <Link
              href={href}
              className="ml-2 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
            >
              {linkLabel}
            </Link>
          ) : null}
        </p>
        <button
          type="button"
          onClick={() => dismissAnnouncement(text)}
          aria-label="Dismiss announcement"
          className="ml-auto inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

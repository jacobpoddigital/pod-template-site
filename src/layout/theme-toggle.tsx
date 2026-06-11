"use client";

import { useSyncExternalStore } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

// Light/dark/system toggle. Default (no choice) = follow the OS via prefers-color-scheme
// (pure CSS, see theme.css). Choosing light/dark sets [data-theme] on <html> + persists to
// localStorage; the no-flash script in layout.tsx re-applies it before paint on the next load.
// Reads the choice via useSyncExternalStore — no hydration mismatch, no setState-in-effect.
type Mode = "light" | "dark" | "system";

const ORDER: Mode[] = ["system", "light", "dark"];
const ICON: Record<Mode, typeof Sun> = { light: Sun, dark: Moon, system: Monitor };
const LABEL: Record<Mode, string> = { light: "Light", dark: "Dark", system: "System" };

const listeners = new Set<() => void>();
function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb); // cross-tab sync
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}
function getSnapshot(): Mode {
  const t = localStorage.theme;
  return t === "light" || t === "dark" ? t : "system";
}
function getServerSnapshot(): Mode {
  return "system";
}
function setMode(mode: Mode) {
  const el = document.documentElement;
  if (mode === "system") {
    el.removeAttribute("data-theme");
    localStorage.removeItem("theme");
  } else {
    el.dataset.theme = mode;
    localStorage.theme = mode;
  }
  listeners.forEach((l) => l()); // same-tab notify
}

export function ThemeToggle() {
  const mode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const Icon = ICON[mode];
  return (
    <button
      type="button"
      onClick={() => setMode(ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length]!)}
      aria-label={`Theme: ${LABEL[mode]}. Click to change.`}
      className="inline-flex h-11 items-center gap-2 rounded-card px-3 body-sm font-medium text-ink-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      <span>{LABEL[mode]}</span>
    </button>
  );
}

"use client";

import { useEffect, useId, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Clock, TrendingUp, Footprints } from "lucide-react";
import { cn } from "@/lib/utils";
import { searchSuggestionsAction } from "./search-action";
import { SEARCH_MIN_CHARS, type SearchSuggestions } from "@/lib/commerce/search-types";

// Predictive search dropdown (research: 75% of users use autocomplete). Product suggestions
// (thumb+name+price) + category suggestions, keyboard-navigable ARIA combobox, query highlight,
// recent + popular searches in the empty state. Calls the server action (WooGraphQL today; Orama
// later — same shapes). Enter / "see all" → /search?q=.

const POPULAR = ["carbon", "trail", "wide fit", "max cushion"];
const RECENT_KEY = "stride:recent-searches";
const EMPTY: SearchSuggestions = { products: [], categories: [] };

type Item = { key: string; kind: "category" | "product" | "term" | "all"; label: string; href: string; sub?: string; img?: string | null };

function highlight(text: string, q: string) {
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0 || !q) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark className="bg-transparent font-semibold text-foreground">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}

function loadRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]").slice(0, 5);
  } catch {
    return [];
  }
}

export function SearchAutocomplete({ className }: { className?: string }) {
  const router = useRouter();
  const listId = useId();
  const boxRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [data, setData] = useState<SearchSuggestions>(EMPTY);
  const [recent, setRecent] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [pending, setPending] = useState(false);

  // Debounced suggestion fetch. (No synchronous setState here — when the term is too short the
  // panel just shows recent/popular via the derived `items` below.)
  useEffect(() => {
    const term = query.trim();
    if (term.length < SEARCH_MIN_CHARS) return;
    const id = setTimeout(() => {
      setPending(true);
      searchSuggestionsAction(term)
        .then((r) => setData(r))
        .catch(() => setData(EMPTY))
        .finally(() => setPending(false));
    }, 180);
    return () => clearTimeout(id);
  }, [query]);

  const openPanel = useCallback(() => {
    setRecent(loadRecent()); // refresh from storage when the panel opens (event, not effect)
    setOpen(true);
  }, []);

  // Close on outside pointer.
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, []);

  const hasQuery = query.trim().length >= SEARCH_MIN_CHARS;
  const items: Item[] = hasQuery
    ? [
        ...data.categories.map((c) => ({ key: `c-${c.slug}`, kind: "category" as const, label: c.name, href: `/shop/${c.slug}`, sub: `${c.count} shoes` })),
        ...data.products.map((p) => ({ key: `p-${p.id}`, kind: "product" as const, label: p.name, href: `/product/${p.slug}`, sub: p.price ?? undefined, img: p.image?.url })),
        { key: "all", kind: "all" as const, label: `See all results for “${query.trim()}”`, href: `/search?q=${encodeURIComponent(query.trim())}` },
      ]
    : [
        ...recent.map((t) => ({ key: `r-${t}`, kind: "term" as const, label: t, href: `/search?q=${encodeURIComponent(t)}` })),
        ...POPULAR.map((t) => ({ key: `pop-${t}`, kind: "term" as const, label: t, href: `/search?q=${encodeURIComponent(t)}` })),
      ];

  const saveRecent = useCallback((term: string) => {
    const t = term.trim();
    if (!t) return;
    const next = [t, ...loadRecent().filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(0, 5);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    setRecent(next);
  }, []);

  const go = useCallback(
    (href: string, term?: string) => {
      if (term) saveRecent(term);
      setOpen(false);
      setActive(-1);
      router.push(href);
    },
    [router, saveRecent],
  );

  const submit = useCallback(() => {
    const t = query.trim();
    if (t.length >= SEARCH_MIN_CHARS) go(`/search?q=${encodeURIComponent(t)}`, t);
  }, [query, go]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(a + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const it = items[active];
      if (it) go(it.href, it.kind === "term" || it.kind === "all" ? it.label : query);
      else submit();
    } else if (e.key === "Escape") {
      setOpen(false);
      setActive(-1);
    }
  };

  const showList = open && items.length > 0;

  return (
    <div ref={boxRef} className={cn("relative", className)}>
      <div role="combobox" aria-expanded={showList} aria-haspopup="listbox" aria-owns={listId} className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={openPanel}
          onKeyDown={onKeyDown}
          role="searchbox"
          aria-label="Search shoes"
          aria-autocomplete="list"
          aria-controls={listId}
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          placeholder="Search shoes — e.g. trail, carbon, wide fit"
          className="h-11 w-full rounded-md border border-border bg-surface pl-9 pr-9 body-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none"
          // a native search input clears with Esc; we override Esc to close the panel
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setQuery("");
              setData(EMPTY);
              setActive(-1);
            }}
            className="absolute right-2 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {showList && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Search suggestions"
          className="absolute left-0 right-0 top-full z-[var(--z-modal)] mt-2 max-h-[70vh] overflow-y-auto rounded-lg border border-border bg-surface-raised p-2 shadow-card"
        >
          {!hasQuery && recent.length > 0 && <li className="px-2 pb-1 pt-2 label text-muted-foreground">Recent</li>}
          {items.map((it, i) => (
            <li key={it.key} id={`${listId}-${i}`} role="option" aria-selected={active === i}>
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={() => go(it.href, it.kind === "term" || it.kind === "all" ? it.label : query)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-2 py-2 text-left body-sm focus-visible:outline-none",
                  active === i ? "bg-muted" : "hover:bg-muted",
                )}
              >
                {it.kind === "product" ? (
                  <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded bg-surface-muted">
                    {it.img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={it.img} alt="" className="size-full object-cover" />
                    ) : (
                      <Footprints className="size-4 text-muted-foreground/50" aria-hidden="true" />
                    )}
                  </span>
                ) : (
                  <span className="flex size-9 shrink-0 items-center justify-center text-muted-foreground">
                    {it.kind === "term" ? <Clock className="size-4" aria-hidden="true" /> : it.kind === "all" ? <Search className="size-4" aria-hidden="true" /> : <TrendingUp className="size-4" aria-hidden="true" />}
                  </span>
                )}
                <span className="min-w-0 flex-1 truncate text-foreground">{hasQuery ? highlight(it.label, query.trim()) : it.label}</span>
                {it.sub && <span className="shrink-0 body-sm text-muted-foreground">{it.sub}</span>}
              </button>
            </li>
          ))}
          {pending && <li className="px-2 py-2 body-sm text-muted-foreground" aria-live="polite">Searching…</li>}
        </ul>
      )}
    </div>
  );
}

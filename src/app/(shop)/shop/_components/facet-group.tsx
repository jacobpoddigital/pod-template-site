"use client";

import { useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/ui/checkbox";
import type { Facet } from "@/lib/commerce/products";

// Scale-ready facet group (Baymard/NN-g): collapsible · show-more cap · in-facet search ·
// capped scroll · selected pinned to top. Threshold-gated — a small facet renders as a plain
// list; the affordances appear only when a facet has many terms. Reusable across every facet
// → graduates to the template as the standard faceted-filter pattern.
const CAP = 8; // visible options before "Show all"
const SEARCH_AT = 10; // in-facet search appears past this many options

const LINK = "body-sm text-link underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

type Props = {
  groupKey: string;
  label: string;
  options: Facet[];
  selected: string[];
  onToggle: (slug: string) => void;
  onClear: () => void;
  idPrefix: string;
  /** Primary facets open by default; secondary collapse (scales when there are many facets). */
  defaultOpen?: boolean;
};

function arrange(options: Facet[], selected: string[], query: string, expanded: boolean) {
  const q = query.trim().toLowerCase();
  const matched = q ? options.filter((o) => o.name.toLowerCase().includes(q)) : options;
  // selected pinned to the top; then available (higher count) above unavailable (0) ones
  const ordered = [...matched].sort(
    (a, b) => Number(selected.includes(b.slug)) - Number(selected.includes(a.slug)) || b.count - a.count,
  );
  const overCap = ordered.length > CAP;
  const capped = !expanded && !q && overCap;
  return { ordered, visible: capped ? ordered.slice(0, CAP) : ordered, capped, overCap };
}

function FacetOptions({ items, selected, onToggle, groupKey, idPrefix }: Pick<Props, "selected" | "onToggle" | "groupKey" | "idPrefix"> & { items: Facet[] }) {
  if (items.length === 0) return <li className="body-sm text-muted-foreground">No matches</li>;
  return (
    <>
      {items.map((o) => {
        const id = `${idPrefix}-${groupKey}-${o.slug}`;
        return (
          <li key={o.slug} className="flex min-h-9 items-center gap-2">
            <Checkbox
              id={id}
              checked={selected.includes(o.slug)}
              disabled={o.count === 0 && !selected.includes(o.slug)}
              onCheckedChange={() => onToggle(o.slug)}
            />
            <label
              htmlFor={id}
              className={cn(
                "flex-1 body-sm text-foreground",
                o.count === 0 && !selected.includes(o.slug) ? "cursor-not-allowed opacity-50" : "cursor-pointer",
              )}
            >
              {o.name} <span className="text-muted-foreground">({o.count})</span>
            </label>
          </li>
        );
      })}
    </>
  );
}

function FacetBody({ options, selected, onToggle, groupKey, idPrefix, label }: Omit<Props, "onClear">) {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);
  const { ordered, visible, capped, overCap } = arrange(options, selected, query, expanded);

  return (
    <div>
      {options.length > SEARCH_AT && (
        <div className="relative mb-2">
          <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${label.toLowerCase()}`}
            aria-label={`Search ${label}`}
            className="min-h-9 w-full rounded-md border border-border bg-surface pl-8 pr-2 body-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      )}
      <ul role="list" className={cn("flex flex-col gap-0.5", !capped && overCap && "max-h-72 overflow-y-auto pr-1")}>
        <FacetOptions items={visible} selected={selected} onToggle={onToggle} groupKey={groupKey} idPrefix={idPrefix} />
      </ul>
      {capped && (
        <button type="button" onClick={() => setExpanded(true)} className={cn("mt-1.5", LINK)}>
          Show all {ordered.length}
        </button>
      )}
      {expanded && !query && overCap && (
        <button type="button" onClick={() => setExpanded(false)} className={cn("mt-1.5", LINK)}>
          Show fewer
        </button>
      )}
    </div>
  );
}

export function FacetGroup({ groupKey, label, options, selected, onToggle, onClear, idPrefix, defaultOpen = false }: Props) {
  // Collapsed by default (keeps a many-facet sidebar scannable); a collapsed group with a
  // selection shows a summary of the chosen values, so you see your picks without expanding it.
  const [open, setOpen] = useState(defaultOpen);
  const summary = options.filter((o) => selected.includes(o.slug)).map((o) => o.name).join(", ");
  return (
    <fieldset>
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex flex-1 items-center gap-1.5 label text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronDown className={cn("size-4 motion-safe:transition-transform", !open && "-rotate-90")} aria-hidden="true" />
          <span>{label}</span>
          {selected.length > 0 && <span className="text-link">({selected.length})</span>}
        </button>
        {selected.length > 0 && (
          <button type="button" onClick={onClear} className={LINK}>Clear</button>
        )}
      </div>
      {!open && summary && <p className="mt-1 line-clamp-1 body-sm text-muted-foreground">{summary}</p>}
      {open && (
        <div className="mt-2">
          <FacetBody options={options} selected={selected} onToggle={onToggle} groupKey={groupKey} idPrefix={idPrefix} label={label} />
        </div>
      )}
    </fieldset>
  );
}

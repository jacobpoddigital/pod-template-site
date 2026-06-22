"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

// Canonical shop sort control — the branded ui/select (Radix), shared by the desktop results
// toolbar and the mobile "Filter & sort" sheet so the option set lives in ONE place. Binds the
// `sort` URL param (default "newest" → null, to keep clean URLs). Category-listing UX standard:
// sort is ONE control, never duplicated (toolbar on desktop, sheet on mobile).
export const SORT_OPTIONS: { value: string; label: string }[] = [
  // "Featured" = Woo's manual `menu_order` (the merchant drag-sorts products in wp-admin) — the
  // store-owner's curated order, Woo's "Default sorting". Maps to orderby MENU_ORDER server-side.
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "rating", label: "Top rated" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "Name: A–Z" },
];

export function SortSelect({
  value,
  onValueChange,
  id,
  triggerClassName,
}: {
  value: string;
  onValueChange: (value: string) => void;
  id?: string;
  triggerClassName?: string;
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger id={id} className={triggerClassName} aria-label="Sort products">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

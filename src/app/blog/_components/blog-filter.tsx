"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Tag as TagIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { BLOG_BASE, type BlogTerm } from "@/lib/cms";
import { BlogSearchForm } from "./blog-search-form";

// Blog filter (Great White's filter-content, ported to React + tokens). Navigation,
// not search: category pills + an expandable tag list drive the archive routes (no
// client-only state that breaks SSG). The first few categories show inline; "View
// all" reveals the rest; the chevron expands the tag drawer. Current term highlighted.
// (Full-text search is wired in the cms layer for a future /blog/search route.)

const VISIBLE_CATEGORIES = 4;

type Current = { type: "category" | "tag"; slug: string } | null | undefined;
const isCurrent = (current: Current, type: "category" | "tag", slug: string) => current?.type === type && current.slug === slug;

const pill =
  "inline-flex min-h-11 items-center rounded-full border border-border px-4 body-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";
const activeCls = "border-primary bg-primary text-primary-foreground";
const idle = "hover:bg-secondary text-ink";

function FilterLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link href={href} className={cn(pill, active ? activeCls : idle)} aria-current={active ? "page" : undefined}>
      {label}
    </Link>
  );
}

function TagDrawer({ tags, current }: { tags: BlogTerm[]; current: Current }) {
  return (
    <ul role="list" className="mt-4 flex flex-wrap gap-2">
      {tags.map((t) => (
        <li key={t.slug}>
          <FilterLink href={t.href} label={`#${t.name}`} active={isCurrent(current, "tag", t.slug)} />
        </li>
      ))}
    </ul>
  );
}

export function BlogFilter({
  categories,
  tags,
  current,
}: {
  categories: BlogTerm[];
  tags: BlogTerm[];
  current?: Current;
}) {
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showTags, setShowTags] = useState(current?.type === "tag");
  const shownCategories = showAllCategories ? categories : categories.slice(0, VISIBLE_CATEGORIES);

  return (
    <div className="border-y border-border py-5">
      <div className="flex flex-wrap items-center gap-2">
        <FilterLink href={BLOG_BASE} label="All articles" active={!current} />
        {shownCategories.map((c) => (
          <FilterLink key={c.slug} href={c.href} label={c.name} active={isCurrent(current, "category", c.slug)} />
        ))}
        {!showAllCategories && categories.length > VISIBLE_CATEGORIES ? (
          <button type="button" onClick={() => setShowAllCategories(true)} className={cn(pill, idle)}>
            View all
          </button>
        ) : null}

        {/* Search + Topics sit together on the right (full-width wrap on mobile). */}
        <div className="ml-auto flex w-full items-center gap-2 sm:w-auto">
          <BlogSearchForm variant="inline" />
          {tags.length ? (
            <button
              type="button"
              onClick={() => setShowTags((v) => !v)}
              aria-expanded={showTags}
              className={cn(pill, idle, "shrink-0 gap-2")}
            >
              <TagIcon aria-hidden className="size-4" />
              Topics
              <ChevronDown aria-hidden className={cn("size-4 transition-transform", showTags && "rotate-180")} />
            </button>
          ) : null}
        </div>
      </div>

      {showTags && tags.length ? <TagDrawer tags={tags} current={current} /> : null}
    </div>
  );
}

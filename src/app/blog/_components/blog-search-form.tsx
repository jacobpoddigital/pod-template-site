import { Search } from "lucide-react";
import { Input } from "@/ui/input";
import { Button } from "@/ui/button";
import { BLOG_BASE } from "@/lib/cms";

// Blog search (workflow/34). A plain GET form → /blog/search?q=… — no client JS, works
// without hydration, shareable URL. Two layouts: "page" (big, on the search page) and
// "inline" (compact, icon-only submit — sits inside the archive toolbar/filter).
export function BlogSearchForm({
  defaultValue = "",
  variant = "page",
}: {
  defaultValue?: string;
  variant?: "page" | "inline";
}) {
  const inline = variant === "inline";
  return (
    <form
      action={`${BLOG_BASE}/search`}
      method="get"
      role="search"
      className={inline ? "relative w-full sm:w-56" : "flex w-full max-w-xl gap-2"}
    >
      <Input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder="Search articles…"
        aria-label="Search articles"
        className={inline ? "h-11 pr-11" : "flex-1"}
      />
      {inline ? (
        <button
          type="submit"
          aria-label="Search"
          className="absolute right-0 top-0 inline-flex h-11 w-11 items-center justify-center rounded-md text-ink-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Search aria-hidden className="size-4" />
        </button>
      ) : (
        <Button type="submit" className="shrink-0">
          <Search aria-hidden className="size-4" />
          Search
        </Button>
      )}
    </form>
  );
}

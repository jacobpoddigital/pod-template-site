import { Search } from "lucide-react";
import { Input } from "@/ui/input";
import { Button } from "@/ui/button";
import { BLOG_BASE } from "@/lib/cms";

// Blog search (workflow/34). A plain GET form → /blog/search?q=… — no client JS,
// works without hydration, shareable/bookmarkable URL. Server component.
export function BlogSearchForm({ defaultValue = "", autoFocus = false }: { defaultValue?: string; autoFocus?: boolean }) {
  return (
    <form action={`${BLOG_BASE}/search`} method="get" role="search" className="flex w-full max-w-xl gap-2">
      <Input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder="Search articles…"
        aria-label="Search articles"
        autoFocus={autoFocus}
        className="flex-1"
      />
      <Button type="submit" className="shrink-0">
        <Search aria-hidden className="size-4" />
        Search
      </Button>
    </form>
  );
}

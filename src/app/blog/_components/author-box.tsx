import { Avatar, AvatarImage, AvatarFallback } from "@/ui/avatar";
import { initials } from "@/lib/utils";
import type { BlogAuthor } from "@/lib/cms";

// Article footer author box (Great White port) — avatar + name + bio. Tokens + the
// shared Avatar primitive (graceful initials fallback).
export function AuthorBox({ author }: { author: BlogAuthor }) {
  return (
    <div className="flex items-start gap-4 rounded-lg border border-border bg-card p-6">
      <Avatar size="lg">
        {author.avatarUrl ? <AvatarImage src={author.avatarUrl} alt="" /> : null}
        <AvatarFallback>{initials(author.name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="label text-ink-muted">Written by</p>
        <p className="display-xs text-ink">{author.name}</p>
        {author.bio ? <p className="mt-1 body-sm max-w-[60ch] text-ink-muted">{author.bio}</p> : null}
      </div>
    </div>
  );
}

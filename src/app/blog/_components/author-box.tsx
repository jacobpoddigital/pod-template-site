import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/ui/avatar";
import { initials } from "@/lib/utils";
import type { BlogAuthor } from "@/lib/cms";

// Article footer author box (Great White port + E-E-A-T, workflow/34) — photo, name
// (links to the author archive), role, bio, sameAs social, optional "Meet the team".
const link =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded";

export function AuthorBox({ author }: { author: BlogAuthor }) {
  const photo = author.image?.sourceUrl ?? author.avatarUrl ?? null;
  return (
    <div className="flex items-start gap-4 rounded-lg border border-border bg-card p-6">
      <Avatar size="lg">
        {photo ? <AvatarImage src={photo} alt="" /> : null}
        <AvatarFallback>{initials(author.name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="label text-ink-muted">Written by</p>
        <p className="display-xs text-ink">
          <Link href={author.href} className={link}>{author.name}</Link>
        </p>
        {author.roleTitle ? <p className="body-sm text-ink-muted">{author.roleTitle}</p> : null}
        {author.bio ? <p className="mt-1 body-sm max-w-[60ch] text-ink-muted">{author.bio}</p> : null}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 body-sm">
          <Link href={author.href} className={`${link} text-ink underline underline-offset-4`}>
            More from {author.name.split(" ")[0]}
          </Link>
          {author.teamUrl ? <Link href={author.teamUrl} className={`${link} text-ink-muted`}>Meet the team</Link> : null}
          {author.social.map((s) => (
            <Link key={s.href} href={s.href} target="_blank" rel="noopener noreferrer me" className={`${link} inline-flex items-center gap-1 text-ink-muted`}>
              {s.label}
              <ArrowUpRight aria-hidden className="size-3.5" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { ArrowUpRight, Users } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/ui/avatar";
import { ButtonLink } from "@/ui/button-link";
import { initials } from "@/lib/utils";
import type { BlogAuthor } from "@/lib/cms";

// Author archive header (workflow/34, E-E-A-T) — real photo, role, bio, sameAs social
// links, and an optional "Meet the team" link (loose team coupling). The matching
// ProfilePage/Person JSON-LD is emitted by AuthorJsonLd. Tokens + type scale only.

function AuthorLinks({ author }: { author: BlogAuthor }) {
  if (!author.social.length && !author.teamUrl) return null;
  return (
    <div className="mt-5 flex flex-wrap items-center gap-3">
      {author.teamUrl ? (
        <ButtonLink href={author.teamUrl} icon={Users} iconPosition="leading" size="sm" variant="secondary">
          Meet the team
        </ButtonLink>
      ) : null}
      {author.social.map((s) => (
        <Link
          key={s.href}
          href={s.href}
          rel="noopener noreferrer me"
          target="_blank"
          className="inline-flex min-h-11 items-center gap-1 body-sm text-ink underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {s.label}
          <ArrowUpRight aria-hidden className="size-3.5" />
        </Link>
      ))}
    </div>
  );
}

export function AuthorHero({ author, postCount }: { author: BlogAuthor; postCount: number }) {
  const photo = author.image?.sourceUrl ?? author.avatarUrl ?? null;
  const countLabel = `${postCount} article${postCount === 1 ? "" : "s"}`;
  const eyebrow = author.roleTitle ? `${author.roleTitle} · ${countLabel}` : countLabel;

  return (
    <section data-block="author_hero" className="bg-surface-muted">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-start gap-6 px-4 py-14 md:flex-row md:items-center md:px-8 md:py-20 lg:px-16">
        <Avatar size="xl" className="size-24 md:size-28">
          {photo ? <AvatarImage src={photo} alt="" /> : null}
          <AvatarFallback>{initials(author.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="label text-ink-muted">{eyebrow}</p>
          <h1 className="mt-1 display-lg text-ink">{author.name}</h1>
          {author.bio ? <p className="mt-3 body-lg max-w-[60ch] text-ink-muted">{author.bio}</p> : null}
          {author.knowsAbout.length ? (
            <p className="mt-3 body-sm text-ink-muted">
              <span className="font-semibold text-ink">Writes about:</span> {author.knowsAbout.join(" · ")}
            </p>
          ) : null}
          <AuthorLinks author={author} />
        </div>
      </div>
    </section>
  );
}

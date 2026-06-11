import Image from "next/image";
import Link from "next/link";
import { Section } from "@/ui/section";
import { sectionProps } from "@/lib/section-settings";
import type { AuthorBylineProps } from "./schema";

export function AuthorByline({ name, role, date, bio, profile_url, avatar, tone, spacing, container }: AuthorBylineProps) {
  const meta = [role, date].filter(Boolean).join(" · ");
  const nameEl = profile_url ? (
    <Link
      href={profile_url}
      className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {name}
    </Link>
  ) : (
    name
  );

  return (
    <Section dataBlock="author_byline" {...sectionProps({ tone, spacing, container: container ?? "narrow" })}>
      <div className="flex items-start gap-4">
        {avatar?.sourceUrl ? (
          <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-surface-muted">
            <Image src={avatar.sourceUrl} alt={avatar.altText ?? name} fill sizes="56px" className="object-cover" />
          </span>
        ) : null}
        <div>
          <p className="body font-semibold text-ink">{nameEl}</p>
          {meta ? <p className="body-sm text-ink-muted">{meta}</p> : null}
          {bio ? <p className="mt-2 max-w-[65ch] text-ink-muted">{bio}</p> : null}
        </div>
      </div>
    </Section>
  );
}

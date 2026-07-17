import { Avatar, AvatarImage, AvatarFallback } from "@/ui/avatar";
import { Section } from "@/ui/section";
import { Eyebrow } from "@/ui/eyebrow";
import { SocialLinks } from "@/ui/social-links";
import { RichText } from "@/ui/rich-text";
import { initials } from "@/lib/utils";
import { sectionProps, columnsClass } from "@/lib/section-settings";
import type { TeamProps } from "./schema";

type Member = NonNullable<TeamProps["members"]>[number];

// Reuse the agency SocialLinks row (44px targets, brand-icon resolution, rel=noopener).
function memberLinks(m: Member): { label: string; href: string }[] {
  return [
    m.linkedin_url ? { label: `${m.name} on LinkedIn`, href: m.linkedin_url } : null,
    m.twitter_url ? { label: `${m.name} on X`, href: m.twitter_url } : null,
    m.website_url ? { label: `${m.name}'s website`, href: m.website_url } : null,
  ].filter((l): l is { label: string; href: string } => l !== null);
}

function MemberView({ m }: { m: Member }) {
  const links = memberLinks(m);
  return (
    <div className="flex flex-col items-center text-center">
      <Avatar size="xl">
        {m.image?.sourceUrl ? (
          <AvatarImage src={m.image.sourceUrl} alt={m.image.altText ?? m.name} />
        ) : null}
        <AvatarFallback>{initials(m.name)}</AvatarFallback>
      </Avatar>
      <h3 className="mt-4 display-xs text-ink">{m.name}</h3>
      {m.role ? <p className="mt-1 label text-brand-accent">{m.role}</p> : null}
      {m.bio ? (
        <RichText html={m.bio} className="mt-3 max-w-[min(40ch,90vw)] body-sm" />
      ) : null}
      {links.length ? <SocialLinks links={links} className="mt-3 justify-center" /> : null}
    </div>
  );
}

export function Team({
  heading,
  intro,
  eyebrow,
  footnote,
  columns,
  members,
  tone,
  spacing,
  container,
}: TeamProps) {
  const items = Array.isArray(members) ? members : [];
  if (items.length === 0) return null;

  return (
    <Section dataBlock="team" {...sectionProps({ tone, spacing, container })}>
      {eyebrow || heading || intro ? (
        <div className="mb-12 max-w-2xl">
          {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
          {heading ? <h2 className="display-md text-ink">{heading}</h2> : null}
          {intro ? (
            <p className="mt-4 max-w-[min(65ch,90vw)] body-lg text-ink-muted">{intro}</p>
          ) : null}
        </div>
      ) : null}

      <ul role="list" className={`grid gap-10 ${columnsClass(columns)}`}>
        {items.map((m, i) => (
          <li key={`${m.name}-${i}`}>
            <MemberView m={m} />
          </li>
        ))}
      </ul>
      {footnote ? <RichText html={footnote} className="mt-8 body-sm text-ink-muted" /> : null}
    </Section>
  );
}

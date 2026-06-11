import Image from "next/image";
import { Section } from "@/ui/section";
import { ButtonLink } from "@/ui/button-link";
import { sectionProps, columnsClass } from "@/lib/section-settings";
import type { ServicesGridProps } from "./schema";

export function ServicesGrid({ heading, intro, columns, services, tone, spacing, container }: ServicesGridProps) {
  const items = Array.isArray(services) ? services : [];
  if (items.length === 0) return null;

  return (
    <Section dataBlock="services_grid" {...sectionProps({ tone, spacing, container })}>
      {heading || intro ? (
        <div className="mb-12 max-w-2xl">
          {heading ? <h2 className="display-md text-ink">{heading}</h2> : null}
          {intro ? <p className="mt-4 max-w-[65ch] body-lg text-ink-muted">{intro}</p> : null}
        </div>
      ) : null}

      <div className={`grid gap-8 ${columnsClass(columns)}`}>
        {items.map((s, i) => {
          const hasLink = s.link_label && s.link_url;
          return (
            <div key={`${s.title}-${i}`}>
              {s.image?.sourceUrl ? (
                <div className="relative mb-4 h-14 w-14 overflow-hidden rounded-card bg-brand-accent/10">
                  <Image
                    src={s.image.sourceUrl}
                    alt={s.image.altText ?? ""}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
              ) : null}
              <h3 className="text-lg font-semibold text-ink">{s.title}</h3>
              {s.body ? <p className="mt-2 leading-relaxed text-ink-muted">{s.body}</p> : null}
              {hasLink ? (
                <div className="mt-4">
                  <ButtonLink href={s.link_url!} variant="ghost" size="sm">
                    {s.link_label}
                  </ButtonLink>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </Section>
  );
}

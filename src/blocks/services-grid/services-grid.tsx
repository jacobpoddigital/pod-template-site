import Image from "next/image";
import { Section } from "@/ui/section";
import { ButtonLink } from "@/ui/button-link";
import { Slider, SliderItem } from "@/ui/slider";
import { sectionProps, columnsClass } from "@/lib/section-settings";
import type { ServicesGridProps } from "./schema";

type ServiceItem = NonNullable<ServicesGridProps["services"]>[number];

function ServiceItemView({ s }: { s: ServiceItem }) {
  const hasLink = s.link_label && s.link_url;
  return (
    <div>
      {s.image?.sourceUrl ? (
        <div className="relative mb-4 h-14 w-14 overflow-hidden rounded-card bg-brand-accent/10">
          <Image src={s.image.sourceUrl} alt={s.image.altText ?? ""} fill sizes="56px" className="object-cover" />
        </div>
      ) : null}
      <h3 className="text-lg font-bold text-ink">{s.title}</h3>
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
}

export function ServicesGrid({ heading, intro, columns, layout, services, tone, spacing, container }: ServicesGridProps) {
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

      {layout === "slider" ? (
        <Slider label={heading ?? "Services"}>
          {items.map((s, i) => (
            <SliderItem key={`${s.title}-${i}`}>
              <ServiceItemView s={s} />
            </SliderItem>
          ))}
        </Slider>
      ) : (
        <ul role="list" className={`grid gap-8 ${columnsClass(columns)}`}>
          {items.map((s, i) => (
            <li key={`${s.title}-${i}`}>
              <ServiceItemView s={s} />
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

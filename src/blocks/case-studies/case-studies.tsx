import Image from "next/image";
import { Card, CardContent } from "@/ui/card";
import { ButtonLink } from "@/ui/button-link";
import { Section } from "@/ui/section";
import { sectionProps, columnsClass } from "@/lib/section-settings";
import type { CaseStudiesProps } from "./schema";

type Study = NonNullable<CaseStudiesProps["items"]>[number];

function StudyCard({ s }: { s: Study }) {
  return (
    <Card elevation="outline" className="flex h-full flex-col">
      <CardContent className="flex flex-1 flex-col pt-6">
        {s.logo?.sourceUrl ? (
          <Image
            src={s.logo.sourceUrl}
            alt={s.logo.altText ?? s.client ?? ""}
            width={120}
            height={32}
            sizes="120px"
            className="h-8 w-auto object-contain opacity-80"
          />
        ) : null}
        <p className="mt-6 display-md text-brand-accent [font-feature-settings:'tnum']">{s.metric}</p>
        {s.summary ? <p className="mt-2 body text-ink-muted">{s.summary}</p> : null}
        {s.client ? <p className="mt-4 label text-ink-muted">{s.client}</p> : null}
        {s.link_label && s.link_url ? (
          <div className="mt-6">
            <ButtonLink href={s.link_url} variant="ghost" size="sm">
              {s.link_label}
            </ButtonLink>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function CaseStudies({
  heading,
  intro,
  columns,
  items,
  tone,
  spacing,
  container,
}: CaseStudiesProps) {
  const studies = Array.isArray(items) ? items : [];
  if (studies.length === 0) return null;

  return (
    <Section dataBlock="case_studies" {...sectionProps({ tone, spacing, container })}>
      {heading || intro ? (
        <div className="mb-12 max-w-2xl">
          {heading ? <h2 className="display-md text-ink">{heading}</h2> : null}
          {intro ? (
            <p className="mt-4 max-w-[min(65ch,90vw)] body-lg text-ink-muted">{intro}</p>
          ) : null}
        </div>
      ) : null}

      <ul role="list" className={`grid gap-6 ${columnsClass(columns)}`}>
        {studies.map((s, i) => (
          <li key={`${s.metric}-${i}`}>
            <StudyCard s={s} />
          </li>
        ))}
      </ul>
    </Section>
  );
}

import { MapPin, Phone } from "lucide-react";
import { Card, CardContent } from "@/ui/card";
import { Section } from "@/ui/section";
import { sectionProps, columnsClass } from "@/lib/section-settings";
import type { LocationsMapProps } from "./schema";

type Loc = NonNullable<LocationsMapProps["locations"]>[number];

function LocationCard({ l }: { l: Loc }) {
  return (
    <Card elevation="outline" className="h-full">
      <CardContent className="pt-6">
        <h3 className="display-xs text-ink">{l.name}</h3>
        {l.address ? (
          <p className="mt-3 flex items-start gap-2 body-sm text-ink-muted">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-accent" aria-hidden="true" />
            <span>{l.address}</span>
          </p>
        ) : null}
        {l.phone ? (
          <a
            href={`tel:${l.phone.replace(/\s+/g, "")}`}
            className="mt-2 inline-flex min-h-11 items-center gap-2 body-sm text-primary underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            {l.phone}
          </a>
        ) : null}
        {l.maps_url ? (
          <p className="mt-3">
            <a
              href={l.maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center body-sm text-primary underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              View on map
            </a>
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function LocationsMap({
  heading,
  intro,
  columns,
  locations,
  tone,
  spacing,
  container,
}: LocationsMapProps) {
  const items = Array.isArray(locations) ? locations : [];
  if (items.length === 0) return null;

  return (
    <Section dataBlock="locations_map" {...sectionProps({ tone, spacing, container })}>
      {heading || intro ? (
        <div className="mb-10 max-w-2xl">
          {heading ? <h2 className="display-md text-ink">{heading}</h2> : null}
          {intro ? (
            <p className="mt-4 max-w-[min(65ch,90vw)] body-lg text-ink-muted">{intro}</p>
          ) : null}
        </div>
      ) : null}

      <ul role="list" className={`grid gap-6 ${columnsClass(columns)}`}>
        {items.map((l, i) => (
          <li key={`${l.name}-${i}`}>
            <LocationCard l={l} />
          </li>
        ))}
      </ul>
    </Section>
  );
}

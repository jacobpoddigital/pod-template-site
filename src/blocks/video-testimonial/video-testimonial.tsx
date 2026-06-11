import { VideoFacade } from "@/ui/video-facade";
import { Section } from "@/ui/section";
import { sectionProps, columnsClass } from "@/lib/section-settings";
import type { VideoTestimonialProps } from "./schema";

type Item = NonNullable<VideoTestimonialProps["items"]>[number];

function VideoCard({ it }: { it: Item }) {
  return (
    <figure className="flex h-full flex-col">
      <VideoFacade
        videoId={it.video_id}
        image={it.facade_image}
        label={it.author ? `Watch ${it.author}'s testimonial` : "Watch the testimonial"}
      />
      {it.quote ? (
        <blockquote className="mt-4 body-lg text-ink">&ldquo;{it.quote}&rdquo;</blockquote>
      ) : null}
      {it.author || it.role ? (
        <figcaption className="mt-3 body-sm text-ink-muted">
          {it.author ? <span className="font-semibold text-ink">{it.author}</span> : null}
          {it.author && it.role ? ", " : null}
          {it.role}
        </figcaption>
      ) : null}
    </figure>
  );
}

export function VideoTestimonial({
  heading,
  intro,
  columns,
  items,
  tone,
  spacing,
  container,
}: VideoTestimonialProps) {
  const cards = Array.isArray(items) ? items : [];
  if (cards.length === 0) return null;

  return (
    <Section dataBlock="video_testimonial" {...sectionProps({ tone, spacing, container })}>
      {heading || intro ? (
        <div className="mb-12 max-w-2xl">
          {heading ? <h2 className="display-md text-ink">{heading}</h2> : null}
          {intro ? (
            <p className="mt-4 max-w-[min(65ch,90vw)] body-lg text-ink-muted">{intro}</p>
          ) : null}
        </div>
      ) : null}

      <ul role="list" className={`grid gap-8 ${columnsClass(columns ?? 2)}`}>
        {cards.map((it, i) => (
          <li key={`${it.video_id}-${i}`}>
            <VideoCard it={it} />
          </li>
        ))}
      </ul>
    </Section>
  );
}

import { Section } from "@/ui/section";
import { sectionProps } from "@/lib/section-settings";
import { VideoFacade } from "@/ui/video-facade";
import type { VideoProps } from "./schema";

export function Video({ heading, video_id, facade_image, button_text, tone, spacing, container }: VideoProps) {
  return (
    <Section dataBlock="video" {...sectionProps({ tone, spacing, container })}>
      {heading ? <h2 className="mb-8 max-w-2xl display-md text-ink">{heading}</h2> : null}
      <div className="mx-auto max-w-4xl">
        <VideoFacade videoId={video_id} image={facade_image} label={button_text || "Play video"} />
      </div>
    </Section>
  );
}
